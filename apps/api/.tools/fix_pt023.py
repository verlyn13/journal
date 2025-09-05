from __future__ import annotations

import re

from pathlib import Path


DECORATOR_MAP = [
    (re.compile(r"^\s*@pytest\.mark\.asyncio\s*$"), "@pytest.mark.asyncio()"),
    (re.compile(r"^\s*@pytest\.mark\.component\s*$"), "@pytest.mark.component()"),
    (re.compile(r"^\s*@pytest\.mark\.integration\s*$"), "@pytest.mark.integration()"),
    (re.compile(r"^\s*@pytest\.mark\.unit\s*$"), "@pytest.mark.unit()"),
]


def fix_file(path: Path) -> bool:
    original = path.read_text()
    lines = original.splitlines()
    changed = False
    for i, line in enumerate(lines):
        for pattern, replacement in DECORATOR_MAP:
            if pattern.match(line):
                if line.strip() != replacement:
                    # Preserve indentation
                    indent = line[: len(line) - len(line.lstrip())]
                    lines[i] = indent + replacement
                    changed = True
                break
    if changed:
        path.write_text("\n".join(lines) + ("\n" if original.endswith("\n") else ""))
    return changed


def main() -> None:
    root = Path(__file__).resolve().parents[1]  # apps/api
    tests_dir = root / "tests"
    changed_files: list[Path] = [p for p in tests_dir.rglob("*.py") if fix_file(p)]
    if changed_files:
        print(f"Updated {len(changed_files)} files for PT023:")
        for p in changed_files:
            print(" -", p.relative_to(root))
    else:
        print("No PT023 changes needed.")


if __name__ == "__main__":
    main()
