#!/usr/bin/env bash
set -euo pipefail

echo "Waiting for Postgres on localhost:5433..."
if ! command -v pg_isready >/dev/null 2>&1; then
  sudo apt-get update && sudo apt-get install -y postgresql-client >/dev/null 2>&1 || true
fi
for i in $(seq 1 60); do
  if pg_isready -h localhost -p 5433 -U journal >/dev/null 2>&1; then
    echo "Postgres ready"; break; fi
  sleep 1
done

echo "Waiting for Redis on localhost:6380..."
if ! command -v redis-cli >/dev/null 2>&1; then
  sudo apt-get update && sudo apt-get install -y redis-tools >/dev/null 2>&1 || true
fi
for i in $(seq 1 60); do
  if redis-cli -h 127.0.0.1 -p 6380 ping | grep -q PONG; then
    echo "Redis ready"; break; fi
  sleep 1
done

echo "All required services are healthy."

