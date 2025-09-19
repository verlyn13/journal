# Agent Task Specifications for Parallel Execution

## Quick Start

Each agent can be launched independently in parallel. Use these commands:

```bash
# Launch all agents in parallel (recommended with GNU parallel)
parallel -j 8 python scripts/run_agent.py --agent-id {} ::: 1 2 3 4 5 6 7 8

# Or launch individually in separate terminals/processes
python scripts/run_agent.py --agent-id 1  # Structure Architect
python scripts/run_agent.py --agent-id 2  # Metadata Engineer
python scripts/run_agent.py --agent-id 3  # Content Validator
python scripts/run_agent.py --agent-id 4  # API Specialist
python scripts/run_agent.py --agent-id 5  # Link Manager
python scripts/run_agent.py --agent-id 6  # Security Auditor
python scripts/run_agent.py --agent-id 7  # Quality Enhancer
python scripts/run_agent.py --agent-id 8  # Report Generator
```

## Agent 1: Structure Architect

**Primary Tasks:**
```bash
# Task 1.1: Analyze current structure
python scripts/reorganize_docs.py --dry-run > reports/structure_analysis.txt

# Task 1.2: Execute reorganization
python scripts/reorganize_docs.py --execute

# Task 1.3: Generate redirects
python scripts/generate_redirects.py

# Task 1.4: Build navigation
python scripts/build_navigation.py
```

## Agent 2: Metadata Engineer

**Primary Tasks:**
```bash
# Task 2.1: Analyze existing frontmatter
find docs -name "*.md" -exec grep -l "^---" {} \; > reports/has_frontmatter.txt

# Task 2.2: Generate frontmatter for all files
python scripts/add_frontmatter.py --auto --batch-size 25

# Task 2.3: Validate frontmatter
python scripts/validate_frontmatter.py

# Task 2.4: Update document IDs
python scripts/update_doc_ids.py
```

## Agent 3: Content Validator

**Primary Tasks:**
```bash
# Task 3.1: Load schemas and validate
python scripts/validate_docs.py > reports/validation_report.json

# Task 3.2: Check policy compliance
python scripts/check_policies.py > reports/policy_report.json

# Task 3.3: Check freshness
python scripts/check_freshness.py > reports/freshness_report.json

# Task 3.4: Validate required sections
python scripts/validate_sections.py
```

## Agent 4: API Specialist

**Primary Tasks:**
```bash
# Task 4.1: Extract OpenAPI spec
python scripts/extract_openapi.py > docs/api/openapi.json

# Task 4.2: Generate API documentation
python scripts/generate_api_docs.py

# Task 4.3: Validate endpoint coverage
python scripts/validate_api_coverage.py

# Task 4.4: Add examples
python scripts/add_api_examples.py
```

## Agent 5: Link & Reference Manager

**Primary Tasks:**
```bash
# Task 5.1: Scan all links
python scripts/scan_links.py > reports/links_report.json

# Task 5.2: Fix broken internal links
python scripts/fix_links.py --internal

# Task 5.3: Update relationships.json
python scripts/update_relationships.py

# Task 5.4: Validate external links
python scripts/validate_external_links.py --non-blocking
```

## Agent 6: Security Auditor

**Primary Tasks:**
```bash
# Task 6.1: Scan for secrets
python scripts/anonymize_docs.py --scan > reports/secrets_scan.json

# Task 6.2: Anonymize if needed
python scripts/anonymize_docs.py --execute

# Task 6.3: Check .env files
python scripts/check_env_files.py

# Task 6.4: Security compliance
python scripts/security_compliance.py
```

## Agent 7: Quality Enhancer

**Primary Tasks:**
```bash
# Task 7.1: Analyze content quality
python scripts/analyze_quality.py > reports/quality_report.json

# Task 7.2: Add missing sections
python scripts/add_missing_sections.py --priority-1

# Task 7.3: Fix token chunking
python scripts/fix_token_chunks.py

# Task 7.4: Add code languages and alt text
python scripts/enhance_content.py --add-languages --add-alt-text
```

## Agent 8: Report Generator

**Primary Tasks:**
```bash
# Task 8.1: Generate documentation index
python scripts/generate_doc_index.py

# Task 8.2: Check coverage
python scripts/check_doc_coverage.py

# Task 8.3: Generate comprehensive report
python scripts/generate_doc_report.py

# Task 8.4: Generate dashboard
python scripts/generate_dashboard.py > docs/_generated/dashboard.html
```

## Coordination Points

### Checkpoint 1 (after Agent 1 & 2 complete):
- All files reorganized
- All frontmatter added
- Ready for validation

### Checkpoint 2 (after Agent 3, 4, 5 complete):
- All validation complete
- API docs generated
- Links fixed

### Checkpoint 3 (after all agents):
- All tasks complete
- Reports generated
- Ready for final validation

## Parallel Execution Strategy

### Independent Tasks (can run simultaneously):
- Agent 1: Structure reorganization
- Agent 2: Frontmatter generation
- Agent 4: API documentation
- Agent 6: Security scanning

### Dependent Tasks (must wait for prerequisites):
- Agent 3: Needs frontmatter (Agent 2)
- Agent 5: Needs reorganization (Agent 1)
- Agent 7: Needs frontmatter (Agent 2)
- Agent 8: Needs all others complete

## Expected Output

Each agent produces:
1. Task completion status
2. Report files in `docs/_generated/reports/`
3. Updated documentation files
4. Progress log in `logs/agent_X.log`

## Monitoring

```bash
# Check all agent status
tail -f logs/agent_*.log

# Check specific agent
tail -f logs/agent_1.log

# Check overall progress
python scripts/monitor_progress.py

# View live dashboard
python -m http.server 8000 --directory docs/_generated
# Then open http://localhost:8000/dashboard.html
```

## Success Criteria

All agents must complete with:
- ✅ Zero critical errors
- ✅ All required tasks complete
- ✅ Reports generated
- ✅ Validation passing

## Rollback Plan

If any critical task fails:
1. Stop all agents: `pkill -f run_agent.py`
2. Restore backup: `cp -r docs.backup.* docs`
3. Review logs: `grep ERROR logs/agent_*.log`
4. Fix issue and restart