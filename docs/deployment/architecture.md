---
id: deployment-architecture
title: Deployment Architecture Overview
category: deployment
type: architecture
status: draft
created: 2025-09-19
updated: 2025-09-19
author: Journal Team
tags: [deployment, architecture, vercel, supabase]
description: High-level architecture for Journal deployment on Vercel + Supabase
---

# Deployment Architecture Overview

This is a placeholder document referenced by the pre-deployment checklist. It will be expanded to include a detailed diagram and component responsibilities.

- Frontend: Vercel (apps/web)
- API: Vercel Functions or FastAPI service
- Database: Supabase PostgreSQL with pgvector, pg_trgm, and btree_gin
- Messaging/Cache: NATS, Redis

Related: ./vercel-deployment.md, ./supabase-configuration.md

