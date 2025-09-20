# Secure Hosting for a Personal Journal

This guide covers publishing Storybook/docs to GitHub Pages under a custom domain while keeping access private using Cloudflare Access. It also outlines options for running the Flask journal app securely with HTTPS and an additional identity layer.

## Goals

- Serve Storybook and (optional) static docs under your custom domain
- Keep content private via an identity-aware proxy (Cloudflare Access)
- Maintain simple CI/CD with GitHub Pages
- Securely host the Flask app with HTTPS and login

## Static Hosting (Storybook + Docs)

We deploy static content to GitHub Pages and put Cloudflare in front:

1. Configure GitHub Pages

- Ensure the repository has Pages enabled (Settings → Pages → GitHub Actions)
- The workflow `.github/workflows/pages.yml` builds Storybook and uploads artifact
- Set repository variable `PAGES_CUSTOM_DOMAIN` to your domain (e.g., `journal.example.com`)

2. DNS (Cloudflare)

- Add your domain to Cloudflare (nameservers pointing to Cloudflare)
- Create a CNAME record `journal.example.com` → `<username>.github.io`
- Enable proxy (orange cloud) so requests traverse Cloudflare

3. Cloudflare Access (Zero Trust)

- In Cloudflare Zero Trust → Access → Applications → Add an application
- Type: Self‑hosted; Domain: `journal.example.com`
- Policies: Include emails you trust (your email), or add an identity provider (Google, GitHub)
- Optional: Configure One‑Time Pin (OTP) for quick access

4. HSTS/HTTPS and Cache

- Cloudflare handles TLS; enable “Always Use HTTPS” and HSTS (optional)
- Keep cache conservative for dynamic previews; static Storybook assets are fine to cache

5. Validate

- Visit `journal.example.com/storybook` and confirm Cloudflare Access prompts for auth

## Flask App Hosting (Private)

You have multiple options; the two simplest:

### Option A: Public cloud with app auth + Cloudflare Access

- Host the Flask app (gunicorn) behind a reverse proxy (Nginx/Caddy) on a small VM (e.g., Fly.io/Render/VPS)
- Put Cloudflare in front of your domain (`app.example.com`), enable Access just like above
- Ensure Flask config is secure:
  \- `SECRET_KEY` from env; `SESSION_COOKIE_SECURE = True` (HTTPS only); `SESSION_COOKIE_SAMESITE = Lax`
  \- `PREFERRED_URL_SCHEME = https`
- Use systemd service (see `deployment/journal.service`) and a reverse proxy for TLS (Let’s Encrypt) if not using Cloudflare Flexible/Full (strict recommended)

### Option B: Cloudflare Tunnel + Access (no public inbound)

- Run a Cloudflare Tunnel connector on your host; no open ports are required
- Map Tunnel route `app.example.com` → localhost:8000
- Apply Access policy to `app.example.com`; only authenticated users pass

## CI/CD Integration

- The Pages workflow builds Storybook on main pushes; output is at `/storybook`
- If you want to publish docs HTML, wire your docs build to produce `docs-html/` (the workflow will publish it under `/docs` automatically)
- For the app, add a separate deploy workflow (Flyctl, Render, or rsync to your server)

## Secrets and Configuration

- Do not commit secrets; use repo Variables/Secrets and your host’s secret manager
- For Cloudflare Access, no secret is needed in the repo; configuration is in Cloudflare’s dashboard
- For the app, configure environment variables via systemd, Docker, or platform variables

## Quick Checklist

- [ ] Set `PAGES_CUSTOM_DOMAIN` repo variable
- [ ] Configure Cloudflare DNS CNAME to `<username>.github.io`
- [ ] Protect `journal.example.com` with Cloudflare Access (emails or SSO)
- [ ] (App) Secure Flask settings and run behind TLS or Tunnel
- [ ] Verify Access gate and HTTPS end-to-end

## References

- Cloudflare Access: <https://developers.cloudflare.com/cloudflare-one/policies/access/>
- GitHub Pages with custom domain: <https://docs.github.com/pages/configuring-a-custom-domain>
- Cloudflare Tunnel: <https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/>
