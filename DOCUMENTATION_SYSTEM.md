# Documentation System Guide
**Last Updated**: 2025-01-18
**Status**: Production-Ready

## Quick Start for AI Agents

### Key Commands
```bash
# Validate all documentation
make docs-validate

# Fix documentation issues
make docs-fix

# Generate documentation graph
python scripts/build_docs_graph.py

# Check documentation coverage
python scripts/check_doc_coverage.py
```

### Key Files
- **docs/taxonomy.yaml**: Documentation classification system
- **docs/relationships.json**: Inter-document relationships
- **docs/.validator_config.yaml**: Validation configuration
- **scripts/validate_documentation.py**: Main validator
- **scripts/build_docs_graph.py**: Graph builder

## Documentation Structure

```
docs/
├── INDEX.md                 # Master index (auto-generated)
├── taxonomy.yaml           # Classification system
├── relationships.json      # Document relationships
├── .validator_config.yaml  # Validator configuration
├── _generated/            # Auto-generated reports
│   ├── dashboard.html     # Visual documentation dashboard
│   ├── graph.json        # Documentation graph data
│   └── reports/          # Validation reports
├── api/                  # API documentation
├── guides/               # How-to guides
├── implementation/       # Implementation details
├── planning/             # Project planning
├── security/             # Security documentation
├── testing/              # Test documentation
└── workflows/            # Workflow documentation
```

## Documentation Standards

### Required Frontmatter
Every markdown file must have:
```yaml
---
title: Document Title
category: [development|deployment|infrastructure|planning|reference|testing]
subcategory: Specific subcategory
status: [active|deprecated|draft|archived]
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [comma, separated, tags]
---
```

### Validation Rules
1. **Frontmatter**: All required fields must be present
2. **Categories**: Must match taxonomy.yaml definitions
3. **Tags**: Must be from approved list
4. **Relationships**: Referenced documents must exist
5. **No Orphans**: All docs must have relationships

## Available Tools

### 1. Documentation Validator
```bash
python scripts/validate_documentation.py [--fix] [--verbose]
```
- Validates frontmatter
- Checks taxonomy compliance
- Verifies relationships
- Identifies orphaned documents

### 2. Graph Builder
```bash
python scripts/build_docs_graph.py
```
- Creates visual documentation graph
- Generates interactive dashboard
- Exports to JSON for analysis

### 3. Coverage Checker
```bash
python scripts/check_doc_coverage.py
```
- Reports documentation coverage
- Identifies undocumented areas
- Suggests improvements

### 4. Index Generator
```bash
python scripts/generate_doc_index.py
```
- Creates master index
- Organizes by category
- Updates automatically

## Common Tasks

### Adding New Documentation
1. Create file in appropriate directory
2. Add required frontmatter
3. Update relationships.json if linking to other docs
4. Run `make docs-validate` to verify
5. Commit changes

### Fixing Documentation Issues
```bash
# Automatic fix with validation
make docs-fix

# Manual validation
python scripts/validate_documentation.py --verbose

# Fix specific issues
python scripts/fix_frontmatter.py
```

### Updating Documentation Graph
```bash
# Rebuild graph and dashboard
python scripts/build_docs_graph.py

# View dashboard
open docs/_generated/dashboard.html
```

## Integration Points

### Pre-commit Hooks
- Validates documentation on commit
- Fixes frontmatter automatically
- Prevents broken relationships

### CI/CD Pipeline
- GitHub Actions workflow: `.github/workflows/documentation-validate.yml`
- Runs on all PR changes to docs/
- Generates status badge

### Make Targets
```bash
make docs-validate  # Run full validation
make docs-fix      # Auto-fix issues
make docs-status   # Show documentation status
make docs-graph    # Generate documentation graph
```

## Troubleshooting

### Common Issues
1. **Missing Frontmatter**: Run `make docs-fix`
2. **Invalid Category**: Check taxonomy.yaml for valid categories
3. **Orphaned Documents**: Add to relationships.json
4. **Broken Links**: Update references in relationships.json

### Debug Mode
```bash
# Verbose validation
python scripts/validate_documentation.py --verbose

# Dry-run fixes
python scripts/fix_frontmatter.py --dry-run
```

## For Maintainers

### Adding New Categories
1. Edit `docs/taxonomy.yaml`
2. Add category definition
3. Run validation to update all docs
4. Commit changes

### Updating Validation Rules
1. Edit `docs/.validator_config.yaml`
2. Modify rules as needed
3. Test with `make docs-validate`
4. Update this guide if needed

## Related Documentation
- [Documentation Contribution Guide](docs/guides/documentation-contribution-guide.md)
- [Documentation Templates](docs/templates/)
- [Documentation Metrics](docs/guides/documentation-metrics.md)