"""IP address extraction utilities with trusted proxy support.

This module provides safe IP extraction from HTTP requests, supporting
reverse proxy deployments while preventing IP spoofing attacks.
"""

from __future__ import annotations

import ipaddress
import logging

from typing import Optional

from fastapi import Request

from app.settings import settings


logger = logging.getLogger(__name__)


def get_client_ip(request: Request) -> str | None:
    """Extract client IP address from request.

    Safely handles proxy headers when deployed behind trusted proxies.

    Args:
        request: FastAPI request object

    Returns:
        Client IP address or None if unavailable

    Security Note:
        Only trusts X-Forwarded-For when TRUSTED_PROXIES is configured.
        This prevents IP spoofing attacks from untrusted sources.
    """
    # Direct client connection (no proxy)
    client_ip = request.client.host if request.client else None

    # Check if we should trust proxy headers
    if not getattr(settings, "trusted_proxies", None):
        # No trusted proxies configured, use direct connection
        return client_ip

    # Check if the direct connection is from a trusted proxy
    if not _is_trusted_proxy(client_ip):
        # Connection not from trusted proxy, don't trust headers
        logger.warning("Received proxy headers from untrusted source: %s", client_ip)
        return client_ip

    # Try standard proxy headers in order of preference
    # X-Real-IP is simpler and often more reliable
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return _validate_ip(real_ip)

    # X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the leftmost (original client) IP
        ips = [ip.strip() for ip in forwarded_for.split(",")]
        if ips:
            return _validate_ip(ips[0])

    # Forwarded header (RFC 7239) - more complex but standard
    forwarded = request.headers.get("Forwarded")
    if forwarded:
        # Parse the Forwarded header for the 'for' directive
        for part in forwarded.split(";"):
            if part.strip().startswith("for="):
                ip = part.split("=", 1)[1].strip('"')
                # Remove port if present
                if "[" in ip and "]" in ip:
                    # IPv6 with port: [::1]:8080
                    ip = ip[ip.index("[") + 1 : ip.index("]")]
                elif ":" in ip and not _is_ipv6(ip):
                    # IPv4 with port: 192.168.1.1:8080
                    ip = ip.split(":")[0]
                return _validate_ip(ip)

    # Fall back to direct connection
    return client_ip


def _is_trusted_proxy(ip: str | None) -> bool:
    """Check if IP is in trusted proxy list.

    Args:
        ip: IP address to check

    Returns:
        True if IP is trusted proxy
    """
    if not ip:
        return False

    trusted_proxies = getattr(settings, "trusted_proxies", [])
    if not trusted_proxies:
        return False

    try:
        ip_addr = ipaddress.ip_address(ip)

        for trusted in trusted_proxies:
            # Support both individual IPs and CIDR ranges
            if "/" in trusted:
                # CIDR range
                network = ipaddress.ip_network(trusted, strict=False)
                if ip_addr in network:
                    return True
            else:
                # Individual IP
                if ip_addr == ipaddress.ip_address(trusted):
                    return True

        return False

    except (ValueError, TypeError):
        logger.warning("Invalid IP address: %s", ip)
        return False


def _validate_ip(ip: str) -> str | None:
    """Validate and normalize IP address.

    Args:
        ip: IP address string to validate

    Returns:
        Normalized IP or None if invalid
    """
    if not ip:
        return None

    try:
        # Validate and normalize the IP
        validated = ipaddress.ip_address(ip.strip())
        return str(validated)
    except (ValueError, TypeError):
        logger.warning("Invalid IP address format: %s", ip)
        return None


def _is_ipv6(ip: str) -> bool:
    """Check if string looks like IPv6 address.

    Simple heuristic check for IPv6 format.

    Args:
        ip: IP string to check

    Returns:
        True if appears to be IPv6
    """
    return ":" in ip and ("::" in ip or ip.count(":") >= 2)


# Configuration helper for settings
def get_default_trusted_proxies() -> list[str]:
    """Get default trusted proxy configuration.

    Returns:
        List of trusted proxy IPs/ranges for common deployments
    """
    return [
        # Localhost (development)
        "127.0.0.1",
        "::1",
        # Docker bridge network
        "172.17.0.0/16",
        # Kubernetes pod network (common ranges)
        "10.0.0.0/8",
        "172.16.0.0/12",
        # CloudFlare (would need full list in production)
        # https://www.cloudflare.com/ips/
        # AWS ALB/ELB (would need VPC CIDR in production)
    ]


def configure_trusted_proxies() -> None:
    """Configure trusted proxies from environment.

    Sets up trusted proxy list based on deployment environment.
    Should be called during application startup.
    """
    import os

    # Check if explicitly configured
    trusted_proxies_env = os.getenv("TRUSTED_PROXIES", "").strip()

    if trusted_proxies_env:
        # Parse comma-separated list
        proxies = [p.strip() for p in trusted_proxies_env.split(",") if p.strip()]
        settings.trusted_proxies = proxies
        logger.info("Configured %d trusted proxies from environment", len(proxies))
    elif os.getenv("ENABLE_PROXY_HEADERS", "").lower() == "true":
        # Use defaults for common deployments
        settings.trusted_proxies = get_default_trusted_proxies()
        logger.info("Using default trusted proxy configuration")
    else:
        # No proxy support
        settings.trusted_proxies = []
        logger.info("Proxy headers disabled (direct connections only)")
