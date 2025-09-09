***

name: journal-maintenance
description: Run repo maintenance – autofix, checks, docs housekeeping
----------------------------------------------------------------------

Goals:

1. Apply Python autofixes and formatting (Ruff) using uv
2. Run combined checks (Biome + Ruff + mypy + pytest)
3. Optionally refresh docs and verify docs integrity

Steps:

- shell: |

  # Python autofix and format

  bun run py:fix

  # Combined checks (Biome + Ruff + mypy + pytest)

  bun run check:all

  # Optional docs housekeeping

  if \[ -x ./docs.sh ]; then
  ./docs.sh update || true
  ./docs.sh check || true
  fi

Notes:

- Never use pip/poetry (uv-only project). See CLAUDE.md.
- Use Bun for scripts; do not switch to npm unless necessary.
