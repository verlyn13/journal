---
id: reference-docs
title: "\U0001F4DA Documentation Management System"
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- reference
- typescript
priority: medium
status: approved
visibility: internal
schema_version: v1
---

# 📚 Documentation Management System

A comprehensive documentation fetching and management system for **Biome v2.2.2** and **Bun 1.2.21** projects.

## 🎯 Overview

This documentation system provides automated tools to:

- **Fetch** essential documentation from official Biome and Bun sources
- **Organize** docs into a clean, navigable structure
- **Convert** markdown to HTML for better viewing
- **Search** through documentation offline
- **Backup** and restore documentation versions
- **Serve** docs locally for team access

## 📁 Files Included

```
fetch-docs.ts    # TypeScript documentation fetcher script
docs.sh          # Shell script for documentation management
package.json     # bun scripts for all documentation tasks
Makefile         # Alternative Make-based interface
README.md        # This file
```

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Make scripts executable
chmod +x fetch-docs.ts docs.sh

# Fetch all documentation
bun run fetch-docs.ts

# Or use the shell script
./docs.sh fetch

# Or use bun scripts
bun run docs:fetch

# Or use Make
make docs-fetch
```

### 2. Directory Structure Created

```
docs/
├── INDEX.md              # Main navigation index
├── README.md             # Documentation readme
├── biome/                # Biome documentation
│   ├── guides/           # Getting started guides
│   ├── reference/        # API reference
│   ├── recipes/          # Common patterns
│   └── releases/         # Changelog
└── bun/                  # Bun documentation
    ├── getting-started/  # Installation & setup
    ├── configuration/    # Config files
    ├── features/         # Core features
    ├── api/              # API reference
    └── deployment/       # Production guides
```

## 🛠️ Usage Options

### Option 1: Using TypeScript Script Directly

```bash
# Fetch documentation
bun run fetch-docs.ts
```

### Option 2: Using Shell Script

```bash
# Show all commands
./docs.sh help

# Fetch latest docs
./docs.sh fetch

# Update docs (backup + fetch)
./docs.sh update

# Backup current docs
./docs.sh backup

# Search for a term
./docs.sh search "biome config"

# Serve docs locally
./docs.sh serve

# Convert to HTML
./docs.sh convert

# Check documentation integrity
./docs.sh check
```

### Option 3: Using bun Scripts

```bash
# Fetch documentation
bun run docs:fetch

# Update with backup
bun run docs:update

# Serve locally
bun run docs:serve

# Search docs
bun run docs:search -- "typescript"

# Check integrity
bun run docs:check

# Clean docs
bun run docs:clean
```

### Option 4: Using Makefile

```bash
# Show help
make help

# Fetch docs
make docs-fetch

# Update docs
make docs-update

# Serve docs
make docs-serve

# Full project setup with docs
make fresh
```

## 📖 Documentation Sources

### Biome v2.2.2

- **Getting Started Guide**
- **Configuration Guide**
- **Migration Guide**
- **Configuration Reference**
- **Linter Rules**
- **Formatter Options**
- **CLI Reference**
- **CI/CD Setup**
- **Changelog**

### Bun 1.2.21

- **Installation**
- **Package Manager**
- **bunfig.toml Configuration**
- **TypeScript Setup**
- **Bundler**
- **Testing**
- **SQL API**
- **HTTP Server**
- **Standalone Executables**

## 🔍 Features

### 1. **Smart Content Extraction**

- Removes navigation, headers, footers
- Converts HTML to clean markdown
- Preserves code blocks and formatting
- Maintains links and references

### 2. **Backup System**

- Timestamped backups
- Automatic cleanup (keeps last 5)
- Easy restore functionality
- Backup info tracking

### 3. **Search Capability**

```bash
# Search for specific terms
./docs.sh search "formatter"
./docs.sh search "bunfig"
```

### 4. **Local Server**

```bash
# Serve on http://localhost:5000
./docs.sh serve
```

### 5. **HTML Conversion** (requires pandoc)

```bash
# Convert all docs to HTML with navigation
./docs.sh convert
```

### 6. **Integrity Checking**

```bash
# Check for empty files, broken links, etc.
./docs.sh check
```

## 🔧 Configuration

### Customizing Documentation Sources

Edit `fetch-docs.ts` to add/remove documentation pages:

```typescript
const DOCS_SOURCES = {
  biome: {
    base: 'https://biomejs.dev',
    pages: [
      // Add your pages here
      { path: '/new-page/', name: 'new-page.md', category: 'guides' },
    ]
  },
  bun: {
    base: 'https://bun.sh',
    pages: [
      // Add your pages here
      { path: '/docs/new-feature', name: 'new-feature.md', category: 'features' },
    ]
  }
};
```

### Creating Custom Categories

Add new categories by creating directories:

```typescript
const dirs = [
  'docs/biome/your-category',
  'docs/bun/your-category',
];
```

## 📝 Integration with Git

### Add to .gitignore

```gitignore
# Documentation
docs/
docs-backup/
docs-html/

# Keep documentation tools
!fetch-docs.ts
!docs.sh
```

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Update documentation if needed
if [ -n "$(git diff --cached --name-only | grep -E '\.(json|toml|ts|tsx)$')" ]; then
  ./docs.sh check
fi
```

## 🎯 Best Practices

1. **Regular Updates**: Run `docs:update` weekly to keep docs current
2. **Team Sharing**: Use `docs:serve` to share docs locally
3. **Offline Access**: Keep fetched docs in repo for offline work
4. **Version Control**: Consider committing docs for team consistency
5. **CI Integration**: Add `docs:check` to CI pipeline

## 🚨 Troubleshooting

### Issue: Fetch fails with timeout

**Solution**: Increase retry count in `fetch-docs.ts`:

```typescript
await fetchPage(url, retries = 5)  // Increase retries
```

### Issue: HTML conversion requires pandoc

**Solution**: Install pandoc:

```bash
# macOS
brew install pandoc

# Ubuntu/Debian
sudo apt-get install pandoc

# Windows
choco install pandoc
```

### Issue: Permission denied

**Solution**: Make scripts executable:

```bash
chmod +x fetch-docs.ts docs.sh
```

## 📊 Performance

- **Fetch Time**: \~10-30 seconds for all docs
- **Storage**: \~5-10 MB for complete documentation
- **Search**: Instant grep-based search
- **Conversion**: \~5 seconds for HTML generation

## 🤝 Contributing

To add more documentation sources:

1. Fork the repository
2. Edit `DOCS_SOURCES` in `fetch-docs.ts`
3. Test with `bun run fetch-docs.ts`
4. Submit a pull request

## 📄 License

MIT License - Use freely in your projects

## 🔗 Official Documentation

Always refer to the official sources for the most current information:

- **Biome**: <https://biomejs.dev>
- **Bun**: <https://bun.sh/docs>

***

*Generated for Biome v2.2.2 and Bun 1.2.21*
