import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict

# Configuration
SCANNER_DIR = Path(".scanner")
OUTPUT_FILE = Path("repo_scan.json")
PARTIAL_FILE = SCANNER_DIR / "repo_scan.partial.json"
PROGRESS_FILE = SCANNER_DIR / "progress.json"
LOG_FILE = SCANNER_DIR / "scan.log"
SCHEMA_VERSION = "1.0.0"

# Logging setup
LOG_LEVEL = os.getenv("SCAN_LOG_LEVEL", "INFO").upper()
logger = logging.getLogger("scanner.merge")
logger.setLevel(LOG_LEVEL)
logger.handlers.clear()
formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")

# Console
sh = logging.StreamHandler(sys.stdout)
sh.setLevel(LOG_LEVEL)
sh.setFormatter(formatter)
logger.addHandler(sh)

# File
try:
    SCANNER_DIR.mkdir(parents=True, exist_ok=True)
    fh = logging.FileHandler(LOG_FILE)
    fh.setLevel(LOG_LEVEL)
    fh.setFormatter(formatter)
    logger.addHandler(fh)
except Exception as e:
    logger.warning(f"Could not setup file logging: {e}")


def load_json(path: Path) -> Any | None:
    try:
        if not path.exists():
            logger.info(f"Input not found: {path}")
            return None
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in {path}: {e}")
        return None
    except Exception as e:
        logger.error(f"Failed reading {path}: {e}")
        return None


def save_json_atomic(path: Path, data: Dict[str, Any]) -> None:
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    tmp.replace(path)


def read_progress() -> Dict[str, Any]:
    prog = load_json(PROGRESS_FILE)
    if isinstance(prog, dict):
        return prog
    return {
        "run_id": datetime.now(timezone.utc).isoformat(),
        "steps": {
            "scc": "unknown",
            "merge": "pending",
        },
    }


def write_progress(step: str, status: str) -> None:
    prog = read_progress()
    prog["steps"][step] = status
    prog["updated_at"] = datetime.now(timezone.utc).isoformat()
    save_json_atomic(PROGRESS_FILE, prog)


def summarize_counts(files: list[dict[str, Any]]) -> dict[str, int]:
    by_lang: dict[str, int] = {}
    for f in files:
        lang = f.get("language") or "Unknown"
        by_lang[lang] = by_lang.get(lang, 0) + 1
    return by_lang


def merge() -> int:
    logger.info("Starting merge...")
    write_progress("merge", "in_progress")

    merged: Dict[str, dict[str, Any]] = {}
    tool_counts: Dict[str, int] = {}

    # SCC
    scc_json = load_json(SCANNER_DIR / "scc.json")
    logger.info(f"scc.json content: {scc_json}")
    if isinstance(scc_json, list):
        tool_counts["scc"] = 0
        for lang_summary in scc_json:
            if "Files" in lang_summary and isinstance(lang_summary["Files"], list):
                tool_counts["scc"] += len(lang_summary["Files"])
                for file_details in lang_summary["Files"]:
                    path = file_details.get("Location")
                    if not path:
                        continue
                    merged[path] = {
                        "path": path,
                        "size_bytes": file_details.get("Bytes", 0),
                        "language": lang_summary.get("Name", "Unknown"),
                        "loc": file_details.get("Lines", 0),
                        "comment_loc": file_details.get("Comment", 0),
                        "complexity": file_details.get("Complexity", 0),
                    }
    else:
        logger.warning("SCC results missing or invalid; continuing without SCC data")
        tool_counts["scc"] = 0

    logger.info(f"Merged dictionary: {merged}")
    files_list = list(merged.values())
    summary = summarize_counts(files_list)
    logger.info(f"Merged files: {len(files_list)}; by language: {summary}")

    final = {
        "_schema": {"name": "repo_scan", "version": SCHEMA_VERSION},
        "_provenance": {
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "tool_record_counts": tool_counts,
        },
        "files": files_list,
    }

    # Save partial first (resume aid)
    try:
        save_json_atomic(PARTIAL_FILE, final)
        logger.info(f"Wrote partial output to {PARTIAL_FILE}")
    except Exception as e:
        logger.error(f"Failed writing partial output: {e}")

    try:
        save_json_atomic(OUTPUT_FILE, final)
        logger.info(f"Successfully wrote merged output: {OUTPUT_FILE}")
    except Exception as e:
        logger.error(f"Failed writing final output: {e}")
        write_progress("merge", "failed")
        return 2

    write_progress("merge", "completed")
    logger.info("Merge completed.")
    return 0


if __name__ == "__main__":
    sys.exit(merge())
