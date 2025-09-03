# Metrics Reference

This backend exposes minimal Prometheus-style metrics at `/metrics`.

## Counters

- `outbox_publish_attempts_total{stage|result}`
  - stage=attempt (incremented on each try)
  - result=ok|error
- `outbox_dlq_total`
- `worker_process_total{result,type?,reason?}`
  - result=ok|retry|term
  - type=entry.created|entry.updated|entry.deleted|embedding.reindex (when ok)
  - reason=json|ratelimited|error (on retry/term)
- `provider_calls_total{provider,result}`
- `provider_errors_total{provider}`

## Usage

- Green paths increment `{result="ok"}` counters
- Retries and DLQ mark `{result="error"}` / `{result="retry"}` / `outbox_dlq_total`

> Note: Implemented as a lightweight in-process collector (no external deps). Replace with a full Prom client later.

