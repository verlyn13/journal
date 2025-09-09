# Observability Setup (Logging, Errors, and OTLP)

This project implements a modern, automated observability stack optimized for a solo developer: fast local debugging and production-friendly JSON logs with optional OTLP export (SigNoz, Better Stack, DataDog, etc.).

## Components

- Structured logging: `structlog` with contextvars and ISO timestamps
- Correlation IDs: `X-Correlation-ID` request/response propagation
- Unified error handlers: JSON for `/api/**`, text for web routes
- Optional OpenTelemetry (OTLP/HTTP) exporters for traces and logs

## Where It Lives

- Core: `journal/observability.py`
      - `setup_logging(env)`: configures structlog and stdlib logging
      - `register_request_context(app)`: binds correlation_id, method, path, remote_addr, trace/span
      - `register_error_handlers(app)`: 400/404/500 handlers with JSON for API
      - `setup_otel(app)`: optional OTLP exporters (traces + logs) and Flask auto-instrumentation
- App wiring: `journal/__init__.py` calls these during app creation

## Environment Variables

- `LOG_LEVEL`: logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`)
- `FLASK_ENV`: `development` for pretty console logs; otherwise JSON logs
- `OTEL_ENABLED`: `true` to enable OTLP exporters (default: `false`)
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OTLP/HTTP endpoint (default: `http://localhost:4318`)
- `SERVICE_NAME`: service name for OTEL Resource (default: `journal`)
- `SERVICE_VERSION`: service version for OTEL Resource (default: `0.1.0`)

### Sampling and HTTP Logging

- `LOG_SAMPLING`: `true|false` (default: false) — enable deterministic sampling for non-error logs
- `LOG_SAMPLE_INFO`: float 0–1 (default: 0.1)
- `LOG_SAMPLE_DEBUG`: float 0–1 (default: 0.01)
- `LOG_HTTP`: `true|false` (default: false) — log HTTP request/response lines

## Local Dev

1) Standard logging (no OTLP):

```
export FLASK_ENV=development
export LOG_LEVEL=DEBUG
uv run pytest -q  # live logs enabled via pytest.ini
```

2) Enable OTLP to SigNoz (docker-compose default):

```
export OTEL_ENABLED=true
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
export SERVICE_NAME=journal
uv run python run.py
```

Minimal docker-compose snippet (SigNoz OTLP/HTTP endpoint):

```
version: '3.8'
services:
  signoz:
    image: signoz/signoz:latest
    container_name: signoz
    ports:
            - '4318:4318'   # OTLP/HTTP
            - '3301:3301'   # SigNoz UI
    environment:
            - CLICKHOUSE_DB_URL=http://clickhouse:8123
    depends_on:
            - clickhouse
  clickhouse:
    image: clickhouse/clickhouse-server:23.8
    container_name: clickhouse
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    ports:
            - '8123:8123'
```

For a production-grade stack and latest instructions, prefer SigNoz's official compose files.

## Testing Experience

- Live logs in tests via `pytest.ini`:
      - `log_cli = true`, `log_cli_level = INFO`
- Use per-test correlation IDs (auto-generated if missing)
- API errors return JSON envelope with `correlation_id`

## Production Notes

- Logs are JSON lines with `message`, `level`, timestamp, correlation, and HTTP context
- OTLP traces/logs can be shipped to your observability stack (SigNoz, Better Stack, DataDog)
- Sampling: add a sampler to reduce INFO/DEBUG in production (see docs/error-handling-logging.md)

## Maintenance Plan

- Keep `structlog`, `opentelemetry-sdk`, and exporters aligned with Python runtime
- Prefer environment variables for OTLP endpoint and log levels
- Expand error handlers per-domain as the API surface grows
- Optional: add request/response event logging middleware with payload size limits
