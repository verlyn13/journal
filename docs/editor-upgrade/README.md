# Editor Upgrade Documentation
## TipTap → CodeMirror/Markdown Migration

This folder contains the final implementation plan and reference materials for migrating from TipTap WYSIWYG to a CodeMirror/Markdown dual-pane editor.

## Primary Document

- **[FINAL-IMPLEMENTATION-WORKFLOW.md](./FINAL-IMPLEMENTATION-WORKFLOW.md)** - The complete, actionable implementation plan (2-3 week timeline)

## Reference Materials

- **[reference/security-and-corrections.md](./reference/security-and-corrections.md)** - Critical security fixes and technical corrections (rehype-sanitize vs DOMPurify, etc.)
- **[reference/example-implementation.jsx](./reference/example-implementation.jsx)** - Working example of the markdown editor component

## Archived Analysis

The `archive/` folder contains earlier analysis documents that led to the final plan but are no longer needed for implementation.

## Quick Start

1. Read `FINAL-IMPLEMENTATION-WORKFLOW.md`
2. Follow the day-by-day implementation plan
3. Reference `security-and-corrections.md` for critical fixes
4. Use `example-implementation.jsx` as a code template

## Key Decisions

- **Stack**: CodeMirror 6 + react-markdown
- **Bundle Target**: ~600KB (from 2.55MB)
- **Timeline**: 2-3 weeks (personal app scale)
- **Migration**: On-the-fly HTML→Markdown conversion
- **Rollback**: Simple localStorage flag toggle