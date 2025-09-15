# Journal Auth & Secrets – Usage Guide

This quick guide shows developers how to run the API with Infisical Universal Auth (UA) and gopass‑backed credentials.

## Prerequisites

- gopass (with age or GPG configured) and a git‑backed password store
- Infisical CLI v0.42.x
- Python 3.12+ and uv

## 1) Store UA credentials in gopass (one‑time)

```
cd apps/api
./scripts/setup-infisical-auth.sh setup
```

This stores:

- UA client id/secret for token-service@journal and rotator@ops
- INFISICAL_PROJECT_ID and INFISICAL_SERVER_URL

## 2) Generate .env and test UA

```
./scripts/dev-environment.sh
```

This will:

- Create apps/api/.env from gopass
- Validate UA with Infisical
- Create run-dev.sh helper at repo root

## 3) Run the API

```
./run-dev.sh
```

The app uses a lifespan hook to initialize UA at startup and export INFISICAL_TOKEN for CLI/clients.

## 4) Rotate UA credentials (when needed)

```
cd apps/api
./scripts/setup-infisical-auth.sh rotate
./scripts/setup-infisical-auth.sh setup
```

## 5) End-to-end auth test

```
cd apps/api
./scripts/test-auth-flow.sh
```

## CI/CD (summary)

CI uses GitHub OIDC with an Infisical identity (ci@github) to mint short‑lived INFISICAL_TOKEN per job; no stored secrets required. See PROJECT-INTEGRATION.md.

