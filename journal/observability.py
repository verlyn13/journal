"""Observability utilities: structured logging and error handling.

This module configures structlog-based logging with per-request correlation IDs
and registers Flask error handlers that return JSON for API routes and HTML for
browser routes. It aims to provide sensible defaults for a solo developer while
remaining production-friendly.
"""

from __future__ import annotations

# ------------------------------
# Standard library imports
# ------------------------------
import logging
import os
import uuid
from typing import Any, Dict, Tuple, Optional

# ------------------------------
# Third-party imports
# ------------------------------
import structlog
from flask import Flask, Request, jsonify, g, request
from werkzeug.exceptions import HTTPException

# OpenTelemetry SDK (traces + logs over OTLP/HTTP)
from opentelemetry import _logs, trace
from opentelemetry.exporter.otlp.proto.http._log_exporter import OTLPLogExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk._logs import LoggerProvider, LoggingHandler
from opentelemetry.sdk._logs.export import BatchLogRecordProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor


def setup_logging(environment: str) -> None:
    """Configure structlog and stdlib logging.

    - Development: pretty console output for fast debugging.
    - Production/Test: JSON lines suitable for log aggregation.

    Args:
        environment: One of "development", "production", or "testing".
    """

    # Configure root logger level and handler
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(level=level)

    # Optional sampling based on env
    sampler = LogSampler.from_env()

    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        create_sampling_processor(sampler),
        redact_sensitive_processor(),
        structlog.processors.TimeStamper(fmt="iso", utc=True),
    ]

    if environment == "development":
        processors.append(structlog.dev.ConsoleRenderer())
    else:
        processors.extend(
            [
                structlog.processors.EventRenamer("message"),
                structlog.processors.JSONRenderer(),
            ]
        )

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


def _get_environment(app: Flask) -> str:
    if app.debug:
        return "development"
    if app.testing:
        return "testing"
    return os.getenv("FLASK_ENV", "production")


def _ensure_correlation_id(req: Request) -> str:
    header_name = "X-Correlation-ID"
    corr = req.headers.get(header_name)
    if not corr:
        corr = str(uuid.uuid4())
    return corr


def register_request_context(app: Flask) -> None:
    """Bind request-scoped context to structlog and propagate correlation ID."""

    @app.before_request
    def _bind_request_context() -> None:  # noqa: D401
        corr = _ensure_correlation_id(request)
        g.correlation_id = corr
        # Bind correlation + basic request context; add OTEL trace/span if present
        bind: Dict[str, Any] = dict(
            correlation_id=corr,
            method=request.method,
            path=request.path,
            remote_addr=request.headers.get("X-Forwarded-For", request.remote_addr or ""),
        )

        # OpenTelemetry current span info
        try:
            span = trace.get_current_span()
            ctx = span.get_span_context()
            if ctx and ctx.is_valid:
                bind["trace_id"] = f"{ctx.trace_id:032x}"
                bind["span_id"] = f"{ctx.span_id:016x}"
        except Exception:
            pass

        structlog.contextvars.bind_contextvars(**bind)

    @app.after_request
    def _add_correlation_header(response):  # type: ignore[override]
        response.headers["X-Correlation-ID"] = getattr(g, "correlation_id", "")
        return response


def register_error_handlers(app: Flask) -> None:
    """Install generic error handlers that log and return API-friendly errors.

    Rules:
    - If path starts with "/api", return JSON with a standard envelope.
    - Otherwise, return a simple text error (keeps templates optional).
    - Always log with structlog and include correlation_id.
    """

    log = structlog.get_logger("errors")

    def _is_api() -> bool:
        try:
            return request.path.startswith("/api")
        except Exception:
            return False

    def _json_error(status: int, code: str, message: str) -> Tuple[Any, int]:
        payload: Dict[str, Any] = {
            "error": {"code": code, "message": message},
            "correlation_id": getattr(g, "correlation_id", None),
        }
        return jsonify(payload), status

    @app.errorhandler(HTTPException)
    def http_error(e: HTTPException):  # type: ignore[override]
        code = e.code or 500
        name = (e.name or "HTTP_ERROR").replace(" ", "_").upper()
        # 4xx are user/client errors → info/warning; 5xx are server errors → error
        if 400 <= code < 500:
            log.warning("http_error", code=code, name=e.name, path=request.path)
        else:
            log.error("http_error", code=code, name=e.name, path=request.path)
        if _is_api():
            # Use Werkzeug description if available, otherwise a generic message
            desc = e.description if getattr(e, "description", None) else e.name
            return _json_error(code, name, desc)
        return f"{e.name}", code

    @app.errorhandler(Exception)
    def internal_error(e):  # type: ignore[override]
        # Defer HTTP errors to the HTTPException handler
        if isinstance(e, HTTPException):
            return http_error(e)
        # This captures unhandled exceptions. Keep JSON in API contexts.
        log.exception("unhandled_exception", error=str(e))
        if _is_api():
            return _json_error(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred.")
        return "Internal Server Error", 500


def setup_otel(app: Flask) -> None:
    """Configure OpenTelemetry tracing and logging if enabled via env.

    Environment variables:
    - OTEL_ENABLED=true|false (default: false)
    - OTEL_EXPORTER_OTLP_ENDPOINT (default: http://localhost:4318)
    - SERVICE_NAME (default: journal)
    - SERVICE_VERSION (default: 0.1.0)
    """
    if os.getenv("OTEL_ENABLED", "false").lower() not in {"1", "true", "yes"}:
        return

    endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4318").rstrip("/")
    service_name = os.getenv("SERVICE_NAME", "journal")
    service_version = os.getenv("SERVICE_VERSION", "0.1.0")

    resource = Resource.create({
        "service.name": service_name,
        "service.version": service_version,
        "service.namespace": "journal",
        "deployment.environment": os.getenv("FLASK_ENV", "production"),
    })

    # Tracing
    tracer_provider = TracerProvider(resource=resource)
    tracer_provider.add_span_processor(
        BatchSpanProcessor(OTLPSpanExporter(endpoint=f"{endpoint}/v1/traces"))
    )
    trace.set_tracer_provider(tracer_provider)
    FlaskInstrumentor().instrument_app(app)

    # Logging to OTLP
    logger_provider = LoggerProvider(resource=resource)
    logger_provider.add_log_record_processor(
        BatchLogRecordProcessor(OTLPLogExporter(endpoint=f"{endpoint}/v1/logs"))
    )
    _logs.set_logger_provider(logger_provider)

    # Bridge stdlib logging to OTEL
    level_name = os.getenv("LOG_LEVEL", "INFO").upper()
    level = getattr(logging, level_name, logging.INFO)
    handler = LoggingHandler(level=level, logger_provider=logger_provider)
    logging.getLogger().addHandler(handler)


def redact_sensitive_processor(sensitive_keys: Optional[Tuple[str, ...]] = None):
    """Return a structlog processor that redacts sensitive keys in event_dict.

    Applies to top-level keys only to keep performance predictable.
    """

    default_keys = (
        "password",
        "token",
        "authorization",
        "api_key",
        "apikey",
        "secret",
        "access_token",
        "refresh_token",
    )
    keys = tuple(k.lower() for k in (sensitive_keys or default_keys))

    def _processor(logger, method_name, event_dict):  # noqa: D401
        redacted = False
        for k in list(event_dict.keys()):
            if k.lower() in keys:
                event_dict[k] = "[REDACTED]"
                redacted = True
        if redacted:
            event_dict["_redacted"] = True
        return event_dict

    return _processor


class LogSampler:
    """Deterministic hash-based sampling for non-error logs.

    Errors and warnings are always kept. Info/debug can be reduced using
    sample rates from environment variables.
    """

    def __init__(self, info_rate: float = 1.0, debug_rate: float = 1.0):
        self.info_rate = max(0.0, min(1.0, info_rate))
        self.debug_rate = max(0.0, min(1.0, debug_rate))

    @classmethod
    def from_env(cls) -> "LogSampler":
        def _get(name: str, default: float) -> float:
            try:
                return float(os.getenv(name, default))
            except Exception:
                return default

        enabled = os.getenv("LOG_SAMPLING", "false").lower() in {"1", "true", "yes"}
        if not enabled:
            return cls(1.0, 1.0)

        info_rate = _get("LOG_SAMPLE_INFO", 0.1)
        debug_rate = _get("LOG_SAMPLE_DEBUG", 0.01)
        return cls(info_rate, debug_rate)

    def should_keep(self, level: str, correlation_id: Optional[str]) -> bool:
        lvl = level.lower()
        if lvl in {"error", "warning"}:
            return True
        if lvl == "info":
            rate = self.info_rate
        elif lvl in {"debug", "trace"}:
            rate = self.debug_rate
        else:
            rate = 1.0

        if rate >= 1.0:
            return True
        if rate <= 0.0:
            return False

        import hashlib

        key = correlation_id or "global"
        h = int(hashlib.md5(key.encode()).hexdigest()[:8], 16)
        threshold = h / 0xFFFFFFFF
        return threshold < rate


def create_sampling_processor(sampler: LogSampler):
    def _processor(logger, method_name, event_dict):  # noqa: D401
        level = event_dict.get("level", "info")
        corr = event_dict.get("correlation_id")
        if not sampler.should_keep(level, corr):
            # Drop this event before formatting
            raise structlog.DropEvent
        return event_dict

    return _processor


def register_http_logging(app: Flask) -> None:
    """Optional HTTP request/response logging with size limits.

    Enable by setting LOG_HTTP=true. Avoids logging bodies by default.
    """
    log = structlog.get_logger("http")

    @app.before_request
    def _log_request():  # noqa: D401
        try:
            log.info("http.request", method=request.method, path=request.path)
        except Exception:
            pass

    @app.after_request
    def _log_response(response):  # type: ignore[override]
        try:
            log.info(
                "http.response",
                method=request.method,
                path=request.path,
                status=response.status_code,
            )
        except Exception:
            pass
        return response
