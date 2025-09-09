***

## Workflow: Implementing a Containerized Repository Scanning System

This document provides a step-by-step guide to setting up and running a robust, multi-tool analysis of your codebase using Docker Compose. The "sidecar" approach ensures your primary development environment remains lean while leveraging best-in-class tools for code intelligence, security, and license compliance.

### Prerequisites

Before you begin, ensure you have the following installed on your host machine:

- **Docker and Docker Compose:** For running the containerized tools.
- **`treequery` CLI:** A locally installed binary for structural code queries. (This is the one tool we run outside the main Compose pipeline for simplicity, as it lacks a maintained official image).

***

### Step 1: Directory & File Structure

First, create the necessary directories in your project's root to hold configurations, rules, and scripts.

```bash
# Run from your repository root
mkdir -p .scanner/rules/semgrep .scanner/rules/treesitter .scanner/scripts
```

***

### Step 2: Create Ignore Files

Create ignore files at the repository root to prevent scanners from wasting time on irrelevant directories and to keep the Docker build context clean.

#### `.dockerignore`

This prevents build outputs and scanner results from being copied into any Docker image builds.

```
# .dockerignore
.git
.scanner/
*.json
node_modules/
dist/
build/
.venv/
```

#### `.semgrepignore`

This tells Semgrep (and helps inform other tools) which paths to skip during scans.

```
# .semgrepignore
# Third-party code
node_modules/
vendor/

# Build artifacts and virtual environments
dist/
build/
.venv/

# Generated documentation
docs/build/
```

***

### Step 3: Define the Scanners (`docker-compose.yml`)

This is the core of the system. It defines each scanning tool as a separate service, incorporating all the recommended hardening practices. Place this file in your repository root.

```yaml
# docker-compose.yml
version: '3.8'

services:
  # -------------------------------------------
  # YOUR DEVELOPMENT SERVICE (for context)
  # Run with `docker compose up dev`
  # -------------------------------------------
  dev:
    build: .
    # This service is NOT part of the 'scan' profile
    volumes:
            - .:/app

  # -------------------------------------------
  # SCANNER SERVICES
  # Run all with `docker compose --profile scan run --rm merge-results`
  # -------------------------------------------
  scc:
    image: boyter/scc:latest
    profiles: ["scan"]
    working_dir: /repo
    # Correct command: explicit input path
    command: scc --format json --by-file --wide --output .scanner/scc.json .
    volumes:
            - .:/repo:ro # Mount code read-only

  semgrep:
    image: returntocorp/semgrep:latest
    profiles: ["scan"]
    working_dir: /repo
    # Correct command: `scan` subcommand and dedicated output flag
    command: >
      semgrep scan --config /.scanner/rules/semgrep
            --json --json-output .scanner/semgrep.json .
    volumes:
            - .:/repo:ro
            - ./.scanner:/.scanner # Mount rules

  scancode:
    image: aboutcodeorg/scancode-toolkit:latest # Official image name
    profiles: ["scan"]
    working_dir: /repo
    # Correct command: `scancode [OPTIONS] <input> <output_file>`
    command: >
      scancode --format json-pp --copyright --license --package --processes 4
            --ignore ".git" --ignore ".scanner"
      /repo /.scanner/scancode.json
    volumes:
            - .:/repo:ro
            - ./.scanner:/repo/.scanner # Mount scanner dir for output

  gitleaks:
    image: zricethezav/gitleaks:latest
    profiles: ["scan"]
    working_dir: /repo
    # Command with optional baseline support
    command: >
      gitleaks detect --source .
            --report-format json --report-path .scanner/gitleaks.json
      ${GITLEAKS_BASELINE:+ --baseline-path .scanner/gitleaks.baseline.json}
    volumes:
            - .:/repo:ro

  # --- Optional Services (uncomment to enable) ---

  # trufflehog:
  #   image: trufflehog/trufflehog:latest
  #   profiles: ["scan"]
  #   working_dir: /repo
  #   # Scans filesystem for verified secrets and outputs JSON
  #   command: filesystem --json .
  #   # The output is sent to stdout, so we redirect it
  #   entrypoint: >
  #     /bin/sh -c "trufflehog filesystem --json . > .scanner/trufflehog.json"
  #   volumes:
  #     - .:/repo:ro

  # -------------------------------------------
  # MERGE SERVICE
  # This orchestrates the final step
  # -------------------------------------------
  merge-results:
    image: python:3.11-slim
    profiles: ["scan"]
    working_dir: /repo
    command: python .scanner/scripts/merge_scans.py
    volumes:
            - .:/repo # Mount read-write to create the output file
    depends_on:
            - scc
            - semgrep
            - scancode
            - gitleaks
```

***

### Step 4: Create Analysis Rules

Place your custom Semgrep and Tree-sitter rules in the directories you created. These are the same powerful starters from before.

#### Semgrep Rule

**`.scanner/rules/semgrep/fastapi-roles.yml`**

```yaml
rules:
      - id: fastapi-api-router
    patterns:
            - pattern-either:
      - pattern: |
            import fastapi
            ...
            @$ROUTER.get(...)
            ...
      - pattern: |
            from fastapi import APIRouter
            ...
            router = APIRouter(...)
            ...
    message: "Identified a FastAPI API router file."
    languages: [python]
    severity: INFO
    metadata:
      role: "api-router"
      framework: "fastapi"
      semgrep_tag: "api"
```

#### Tree-sitter Query

**`.scanner/rules/treesitter/fastapi_router.scm`**

```scheme
(decorated_definition
  decorator: (call
    function: (attribute
      object: (identifier) @router_object
      attribute: (identifier) @router_method
      (#match? @router_method "(get|post|put|delete|patch|options|head)")
    )
  )
  definition: (function_definition
    name: (identifier) @function_name
  )
) @fastapi_route
```

***

### Step 5: Implement the Hardened Merge Script

This updated Python script includes robust Git churn calculation, schema/provenance metadata, and better logging.

**`.scanner/scripts/merge_scans.py`**

```python
import json
import subprocess
import logging
from pathlib import Path
from datetime import datetime, timezone

# --- Configuration ---
SCANNER_DIR = Path(".scanner")
OUTPUT_FILE = Path("repo_scan.json")
REPO_ROOT = Path(".")
SCHEMA_VERSION = "1.0.0"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_json(file_path: Path):
    if not file_path.exists():
        logging.warning(f"Input file not found: {file_path}")
        return None
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            logging.error(f"Could not decode JSON from {file_path}")
            return None

def get_git_info(file_path: str):
    """Get Git metadata using robust commands."""
    try:
        last_mod_cmd = ["git", "log", "-1", "--format=%cI", "--", file_path]
        last_modified = subprocess.check_output(last_mod_cmd, text=True, cwd=REPO_ROOT).strip()

        # Use --numstat for robust, machine-readable churn data
        churn_cmd = ["git", "log", "--pretty=tformat:", "--numstat", "--", file_path]
        churn_output = subprocess.check_output(churn_cmd, text=True, cwd=REPO_ROOT).splitlines()

        additions = sum(int(line.split()[0]) for line in churn_output if line.strip())
        deletions = sum(int(line.split()[1]) for line in churn_output if line.strip())

        return {
            "last_modified": last_modified,
            "churn_additions": additions,
            "churn_deletions": deletions,
        }
    except Exception as e:
        logging.warning(f"Could not get git info for {file_path}: {e}")
        return {}

def main():
    logging.info("Starting merge process for repository scan...")
    merged_data = {}
    tool_record_counts = {}

    # 1. Base data from SCC
    scc_data = load_json(SCANNER_DIR / "scc.json")
    if scc_data:
        tool_record_counts["scc"] = len(scc_data)
        for item in scc_data:
            path = item.get("Name")
            if not path: continue
            merged_data[path] = {
                "path": path, "size_bytes": item.get("Bytes", 0),
                "language": item.get("Language", "Unknown"), "loc": item.get("Lines", 0),
                "comment_loc": item.get("Comment", 0), "complexity": item.get("Complexity", 0),
            }

    # 2. Semgrep findings
    semgrep_data = load_json(SCANNER_DIR / "semgrep.json")
    if semgrep_data and "results" in semgrep_data:
        tool_record_counts["semgrep"] = len(semgrep_data["results"])
        for finding in semgrep_data["results"]:
            path = finding["path"]
            if path in merged_data:
                hints = merged_data[path].setdefault("role_hints", {})
                tags = hints.setdefault("semgrep_tags", [])
                tag = finding.get("check_id").split('.')[-1]
                if tag not in tags: tags.append(tag)

    # 3. ScanCode findings
    scancode_data = load_json(SCANNER_DIR / "scancode.json")
    if scancode_data and "files" in scancode_data:
        tool_record_counts["scancode"] = len(scancode_data["files"])
        for item in scancode_data["files"]:
             path = item.get("path")
             if path in merged_data:
                 merged_data[path]["third_party"] = {
                     "detected": item.get("is_third_party", False),
                     "licenses": [lic.get("key") for lic in item.get("licenses", []) if lic.get("key")],
                     "copyright": [cr.get("copyright") for cr in item.get("copyrights", []) if cr.get("copyright")],
                 }

    # 4. Gitleaks secrets
    gitleaks_data = load_json(SCANNER_DIR / "gitleaks.json")
    if gitleaks_data:
        tool_record_counts["gitleaks"] = len(gitleaks_data)
        findings_count = {}
        for finding in gitleaks_data:
            path = finding.get("File")
            findings_count[path] = findings_count.get(path, 0) + 1
        for path, data in merged_data.items():
            data["secrets"] = {"findings": findings_count.get(path, 0)}

    # 5. Tree-sitter structural matches
    ts_data = load_json(SCANNER_DIR / "ts_fastapi.json")
    if ts_data:
        tool_record_counts["treequery"] = len(ts_data)
        for match in ts_data:
            path = match.get("file")
            if path in merged_data:
                hints = merged_data[path].setdefault("role_hints", {})
                matches = hints.setdefault("treesitter_matches", [])
                matches.append({"query": "fastapi_router_defs", "lines": [match.get("start_line"), match.get("end_line")]})

    # 6. Final enrichment loop
    for path, data in merged_data.items():
        data["git"] = get_git_info(path)
        # Ensure schema keys exist
        data.setdefault("role_hints", {})
        data.setdefault("secrets", {"findings": 0})
        data.setdefault("third_party", {"detected": False})

    # 7. Final JSON structure with provenance
    final_output = {
        "_schema": {"name": "repo_scan", "version": SCHEMA_VERSION},
        "_provenance": {
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "tool_record_counts": tool_record_counts
        },
        "files": list(merged_data.values())
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_output, f, indent=2)

    logging.info(f"Successfully merged data for {len(merged_data)} files into {OUTPUT_FILE}")
    logging.info(f"Record counts per tool: {tool_record_counts}")

if __name__ == "__main__":
    main()

```

***

### Step 6: Execute the Scan

The workflow is now a simple two-command process.

1. **Run the `treequery` scan (local binary):**

   ```bash
   treequery --query .scanner/rules/treesitter/fastapi_router.scm --repo . --json > .scanner/ts_fastapi.json
   ```

2. **Run the containerized pipeline:**
   The `--profile scan` flag tells Compose to only run services marked with `profiles: ["scan"]`, ignoring your `dev` service.

   ```bash
   docker compose --profile scan run --rm merge-results
   ```

This command will automatically:

- Start the `scc`, `semgrep`, `scancode`, and `gitleaks` services.
- Wait for them to complete.
- Run the `merge-results` service to execute the Python script.
- Clean up the containers when finished.

***

### Step 7: Use the Output

After the scan completes, a `repo_scan.json` file will be present in your project root. This single, comprehensive file contains the aggregated data for every file in your repository, ready for the next stage of your project, whether that's building a dashboard, prioritizing code cleanup, or automating organizational tasks.
