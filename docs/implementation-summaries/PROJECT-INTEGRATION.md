---
id: project-integration
title: Project Integration
type: documentation
created: '2025-09-17'
updated: '2025-09-17'
author: documentation-system
tags:
- typescript
- deployment
- api
- security
status: active
description: "This document shows how CI/CD and runtime authenticate to Infisical\
  \ without storing long\u2011lived tokens."
last_verified: '2025-09-17'
---

# Project Integration – Infisical OIDC & UA

This document shows how CI/CD and runtime authenticate to Infisical without storing long‑lived tokens.

## GitHub Actions – OIDC (ci@github)

Configure an organization identity in Infisical with:

- Auth method: OIDC
- Issuer: https://token.actions.githubusercontent.com
- Discovery URL: https://token.actions.githubusercontent.com/.well-known/openid-configuration
- Subjects: repo:<OWNER>/<REPO>:ref:refs/heads/main (and pull_request if desired)
- Audiences: https://github.com/<OWNER>/<REPO>
- Project role: viewer

### Workflow snippet

```
permissions:
  id-token: write
  contents: read

steps:
  - uses: actions/checkout@v4
  - name: Install Infisical CLI
    run: |
      curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
      sudo apt-get update && sudo apt-get install -y infisical
  - name: OIDC login (preferred)
    run: |
      if infisical login --method=oidc --silent --plain >/dev/null 2>&1; then
        echo "OIDC ok"
      else
        echo "OIDC unavailable"; exit 1
      fi
  - name: Use Infisical
    run: |
      infisical secrets list --project-id "$INFISICAL_PROJECT_ID"
```

If the CLI occludes OIDC, exchange the GH job token with Infisical’s API and export `INFISICAL_TOKEN`.

## Runtime – Universal Auth (token-service@journal)

Identity: token-service@journal (org‑level) with Universal Auth. Add to the project as role `viewer`.

### Boot flow

1) UA credentials injected from secret manager (or gopass in dev):

```
UA_CLIENT_ID_TOKEN_SERVICE=...
UA_CLIENT_SECRET_TOKEN_SERVICE=...
INFISICAL_PROJECT_ID=...
INFISICAL_SERVER_URL=...
```

2) App lifespan calls UA login (already wired) and exports a short‑lived INFISICAL_TOKEN.

## Rotations – Universal Auth (rotator@ops)

- Identity rotator@ops (org‑level), project role `no-access`.
- Grant write via Policies and require Change Requests in prod.
- UA login only during CR window.

## Policies & CRs

- Deny writes to /auth/* in prod unless CR approved; exception granted to rotator@ops.
- token-service@journal: read /auth/jwt/* and /auth/aes/* only.
- Public JWKS path readable by all.

