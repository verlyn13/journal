#!/usr/bin/env python3
"""
Extract OpenAPI specification from FastAPI application.
"""

import json
from pathlib import Path
import sys


# Add app to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from app.main import app

    # Get OpenAPI schema
    openapi_schema = app.openapi()

    # Save to file
    output_dir = Path(__file__).parent.parent / "docs" / "_generated" / "api"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_file = output_dir / "openapi.json"
    with open(output_file, "w") as f:
        json.dump(openapi_schema, f, indent=2)

    print(f"OpenAPI spec extracted to: {output_file}")

    # Also save a markdown version
    md_file = output_dir / "openapi.md"
    with open(md_file, "w") as f:
        f.write("# API Specification\n\n")
        f.write(f"**Title**: {openapi_schema.get('info', {}).get('title', 'Journal API')}\n")
        f.write(f"**Version**: {openapi_schema.get('info', {}).get('version', '0.1.0')}\n\n")

        if "paths" in openapi_schema:
            f.write("## Endpoints\n\n")
            for path, methods in openapi_schema["paths"].items():
                f.write(f"### {path}\n\n")
                for method, details in methods.items():
                    f.write(f"**{method.upper()}**\n")
                    if "summary" in details:
                        f.write(f"- {details['summary']}\n")
                    if "description" in details:
                        f.write(f"- {details['description']}\n")
                    f.write("\n")

    print(f"OpenAPI markdown saved to: {md_file}")

except ImportError as e:
    print(f"Error importing FastAPI app: {e}")
    sys.exit(1)
except Exception as e:
    print(f"Error extracting OpenAPI: {e}")
    sys.exit(1)
