#!/usr/bin/env python3
# Converts FastAPI Depends/Query style to Annotated[...] style for function parameters.
# Example:  x: int = Query(0)  ->  x: Annotated[int, Query(0)]
#           s: AsyncSession = Depends(get_session) -> s: Annotated[AsyncSession, Depends(get_session)]
#
# Idempotent: running twice makes no further changes.

import sys, pathlib, libcst as cst, libcst.matchers as m
from libcst.metadata import PositionProvider

FASTAPI_CALLS = {"Depends", "Query", "Path", "Header", "Cookie", "Body", "Security"}


class AnnotateTransformer(cst.CSTTransformer):
    METADATA_DEPENDENCIES = (PositionProvider,)

    def __init__(self):
        self.modified = False
        self.need_annotated_import = False

    def leave_Param(self, original: cst.Param, updated: cst.Param) -> cst.Param:
        # Only consider params like "x: Type = Query(...)" or "db: T = Depends(...)"
        if not isinstance(updated.default, (cst.Call,)):
            return updated

        call = updated.default
        if not isinstance(call.func, (cst.Name, cst.Attribute)):
            return updated

        callee = call.func.value if isinstance(call.func, cst.Attribute) else call.func.value
        callee_name = (
            call.func.attr.value if isinstance(call.func, cst.Attribute) else call.func.value
        )
        if callee_name not in FASTAPI_CALLS:
            return updated

        # Skip if already Annotated[...] (i.e., annotation already `Subscript` with value "Annotated")
        if isinstance(updated.annotation, cst.Annotation) and isinstance(
            updated.annotation.annotation, cst.Subscript
        ):
            sub = updated.annotation.annotation
            if isinstance(sub.value, cst.Name) and sub.value.value == "Annotated":
                return updated  # already good

        # Must have a type annotation to wrap
        if not isinstance(updated.annotation, cst.Annotation):
            return updated

        base_type = updated.annotation.annotation

        # Build Annotated[<type>, <Call(...args...)>]
        new_ann = cst.Subscript(
            value=cst.Name("Annotated"),
            slice=[
                cst.SubscriptElement(cst.Index(base_type)),
                cst.SubscriptElement(cst.Index(call)),
            ],
        )
        self.need_annotated_import = True
        self.modified = True

        # Keep the default for compatibility but move spec to Annotated
        return updated.with_changes(
            annotation=cst.Annotation(new_ann),
            # Note: Keep default=call to maintain backwards compatibility during migration
        )

    def leave_Module(self, original: cst.Module, updated: cst.Module) -> cst.Module:
        if not self.need_annotated_import:
            return updated

        # Ensure "from typing import Annotated" is present
        has_annotated = False
        new_body = []
        for stmt in updated.body:
            new_body.append(stmt)
            if m.matches(
                stmt, m.SimpleStatementLine(body=[m.ImportFrom(module=m.Name("typing"))])
            ) and isinstance(stmt.body[0], cst.ImportFrom):
                imp: cst.ImportFrom = stmt.body[0]
                names = imp.names
                items = [
                    n.name.value for n in (names if isinstance(names, cst.ImportStar) else [*names])
                ]
                if isinstance(names, cst.ImportStar):
                    has_annotated = True
                else:
                    if "Annotated" in items:
                        has_annotated = True

        if has_annotated:
            return updated

        import_line = cst.parse_statement("from typing import Annotated\n")
        # Insert typing import near the top, after future imports if any
        insert_at = 0
        for i, stmt in enumerate(new_body[:5]):
            if isinstance(stmt, cst.SimpleStatementLine):
                code = stmt.code.strip()
                if code.startswith("from __future__"):
                    insert_at = i + 1
        new_body.insert(insert_at, import_line)
        return updated.with_changes(body=new_body)


def transform_file(path: pathlib.Path):
    code = path.read_text(encoding="utf-8")
    try:
        mod = cst.parse_module(code)
        wrapper = cst.MetadataWrapper(mod)
        tx = AnnotateTransformer()
        new_mod = wrapper.visit(tx)
        if tx.modified:
            path.write_text(new_mod.code, encoding="utf-8")
            print(f"UPDATED  {path}")
    except Exception as e:
        print(f"SKIPPED  {path} ({e})")


if __name__ == "__main__":
    root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    targets = list(root.rglob("app/**/*.py"))
    for p in targets:
        transform_file(p)
