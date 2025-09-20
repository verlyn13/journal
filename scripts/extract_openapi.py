#!/usr/bin/env python3
import json
from pathlib import Path
import sys


sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api"))

from app.main import app


# Extract OpenAPI spec
openapi_spec = app.openapi()

# Save to file
output_file = Path(__file__).parent.parent / "docs" / "api" / "openapi.json"
output_file.parent.mkdir(parents=True, exist_ok=True)

with open(output_file, "w") as f:
    json.dump(openapi_spec, f, indent=2)

print(f"OpenAPI spec saved to {output_file}")
