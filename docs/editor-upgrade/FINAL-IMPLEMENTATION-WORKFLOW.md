---
id: final-implementation-workflow
title: Final Editor Upgrade Implementation Workflow
type: reference
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- python
- typescript
- react
priority: medium
status: approved
visibility: internal
schema_version: v1
last_verified: '2025-09-09'
---

# Final Editor Upgrade Implementation Workflow

## Personal Journal Application - TipTap → CodeMirror/Markdown Migration

### September 2025 - Pragmatic Approach for Single-User Application

***

## Context & Scope

**Application**: Personal journal with single user (no production users to migrate)\
**Current Stack**: TipTap WYSIWYG (\~2.55MB bundle) with Monaco, Math, SlashCommands\
**Target Stack**: CodeMirror 6 + react-markdown (\~600KB bundle)\
**Timeline**: 2-3 weeks total (not 10 weeks - this is a personal project)\
**Risk Level**: Low (single user, can rollback anytime)

***

## Phase 1: Core Implementation (3-4 days)

### Day 1: Setup & Dependencies

```bash
# Install new dependencies
cd apps/web
bun add @uiw/react-codemirror @codemirror/lang-markdown @codemirror/theme-one-dark
bun add react-markdown remark-gfm remark-math remark-breaks
bun add rehype-katex rehype-highlight rehype-sanitize
bun add turndown  # For HTML conversion in browser
bun add katex

# Keep TipTap installed for now (parallel running)
```

### Day 2: Create MarkdownEditor Component

```typescript
// apps/web/src/components/editor/MarkdownEditor.tsx
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import TurndownService from 'turndown';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

// Extend schema for KaTeX and syntax highlighting
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes.div || []), ['className', 'math', 'math-display']],
    span: [
      ...(defaultSchema.attributes.span || []),
      ['className', 'math', 'math-inline', /^hljs-.*/]
    ],
    code: [
      ...(defaultSchema.attributes.code || []),
      ['className', /^language-.*/]
    ]
  }
};

interface MarkdownEditorProps {
  selectedEntry?: {
    id: string;
    title: string;
    content: string;
    format?: 'html' | 'markdown';
  };
  onSave?: (content: string, title: string, format: 'markdown') => void;
  saving?: boolean;
}

export function MarkdownEditor({ selectedEntry, onSave, saving }: MarkdownEditorProps) {
  const [title, setTitle] = useState(selectedEntry?.title || 'Untitled');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [hasChanges, setHasChanges] = useState(false);

  // Convert HTML to Markdown on mount if needed
  useEffect(() => {
    if (!selectedEntry) return;
    
    if (selectedEntry.format === 'html' || !selectedEntry.format) {
      // Convert HTML to Markdown
      const turndown = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        emDelimiter: '_'
      });
      
      // Preserve line breaks
      turndown.addRule('lineBreaks', {
        filter: 'br',
        replacement: () => '  \n'
      });
      
      const markdown = turndown.turndown(selectedEntry.content);
      setContent(markdown);
    } else {
      setContent(selectedEntry.content);
    }
  }, [selectedEntry]);

  // Save handler
  const handleSave = useCallback(() => {
    if (!onSave || !hasChanges) return;
    onSave(content, title, 'markdown');
    setHasChanges(false);
  }, [content, title, hasChanges, onSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="markdown-editor">
      {/* Header */}
      <header className="editor-header">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setHasChanges(true);
          }}
          className="title-input"
          placeholder="Entry title..."
        />
        <div className="editor-actions">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="save-button"
          >
            {saving ? 'Saving...' : hasChanges ? 'Save' : 'Saved'}
          </button>
          <div className="view-toggle">
            <button onClick={() => setViewMode('edit')} className={viewMode === 'edit' ? 'active' : ''}>
              Edit
            </button>
            <button onClick={() => setViewMode('split')} className={viewMode === 'split' ? 'active' : ''}>
              Split
            </button>
            <button onClick={() => setViewMode('preview')} className={viewMode === 'preview' ? 'active' : ''}>
              Preview
            </button>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <div className={`editor-content view-${viewMode}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="editor-pane">
            <CodeMirror
              value={content}
              onChange={(val) => {
                setContent(val);
                setHasChanges(true);
              }}
              theme={oneDark}
              extensions={[
                markdown(),
                EditorView.lineWrapping,
              ]}
              height="100%"
            />
          </div>
        )}
        
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="preview-pane">
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
                rehypePlugins={[
                  [rehypeSanitize, sanitizeSchema],
                  rehypeKatex,
                  [rehypeHighlight, { detect: false }]
                ]}
              >
                {content}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Day 3: Backend Migration Support

```python
# apps/api/app/utils/markdown_converter.py
import subprocess
import json
from typing import Optional

def convert_html_to_markdown(html: str) -> str:
    """
    Convert HTML to Markdown using Node.js Turndown service
    For a personal app, we can use subprocess to call Node
    """
    try:
        # Use the Node script we'll create
        result = subprocess.run(
            ['node', 'scripts/html-to-markdown.js'],
            input=html,
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.stdout
    except Exception as e:
        # Fallback to simple conversion
        from markdownify import markdownify
        return markdownify(html)

# apps/api/app/api/entries.py
@router.get("/{entry_id}")
def get_entry(entry_id: UUID, db: Session = Depends(get_db)):
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    
    # Return format info so frontend knows
    return {
        **entry.__dict__,
        "format": entry.content_format or "html"
    }

@router.put("/{entry_id}")
def update_entry(
    entry_id: UUID,
    content: str,
    title: str,
    format: str = "markdown",  # New parameter
    db: Session = Depends(get_db)
):
    entry = db.query(Entry).filter(Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    
    entry.content = content
    entry.title = title
    entry.content_format = format
    entry.updated_at = datetime.utcnow()
    
    db.commit()
    return entry
```

### Day 4: Database Migration

```sql
-- apps/api/alembic/versions/xxx_add_markdown_support.py
"""Add markdown support

Revision ID: xxx
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add format column
    op.add_column('entries', 
        sa.Column('content_format', sa.String(10), server_default='html')
    )
    
    # Add markdown content column temporarily for dual storage
    op.add_column('entries',
        sa.Column('content_markdown', sa.Text(), nullable=True)
    )

def downgrade():
    op.drop_column('entries', 'content_format')
    op.drop_column('entries', 'content_markdown')
```

***

## Phase 2: Integration & Testing (2-3 days)

### Day 5: Feature Flag & Parallel Running

```typescript
// apps/web/src/config/features.ts
export const useMarkdownEditor = () => {
  // For personal use, just use localStorage
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem('use-markdown-editor') === 'true';
  });
  
  const toggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('use-markdown-editor', String(newValue));
    window.location.reload(); // Simple reload for switch
  };
  
  return { enabled, toggle };
};

// apps/web/src/components/JournalApp.tsx
import { JournalEditor } from './editor/JournalEditor';
import { MarkdownEditor } from './editor/MarkdownEditor';
import { useMarkdownEditor } from '../config/features';

export function JournalApp() {
  const { enabled: useMarkdown, toggle } = useMarkdownEditor();
  
  return (
    <div>
      {/* Editor toggle in settings */}
      <button onClick={toggle}>
        Switch to {useMarkdown ? 'Classic' : 'Markdown'} Editor
      </button>
      
      {/* Conditional rendering */}
      {useMarkdown ? (
        <MarkdownEditor {...props} />
      ) : (
        <JournalEditor {...props} />
      )}
    </div>
  );
}
```

### Day 6: Node.js Conversion Script

```javascript
// scripts/html-to-markdown.js
const TurndownService = require('turndown');

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_'
});

// Custom rules for better conversion
turndown.addRule('lineBreaks', {
  filter: 'br',
  replacement: () => '  \n'
});

// Read from stdin
let html = '';
process.stdin.on('data', chunk => {
  html += chunk;
});

process.stdin.on('end', () => {
  const markdown = turndown.turndown(html);
  process.stdout.write(markdown);
});
```

### Day 7: Migration Script for Existing Entries

```python
# scripts/migrate_entries.py
"""
One-time migration script for existing entries
Run manually when ready: python scripts/migrate_entries.py
"""
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.models import Entry
from app.utils.markdown_converter import convert_html_to_markdown
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_entries():
    engine = create_engine(DATABASE_URL)
    db = Session(engine)
    
    try:
        entries = db.query(Entry).filter(
            Entry.content_format == None  # Only unmigrated
        ).all()
        
        logger.info(f"Found {len(entries)} entries to migrate")
        
        for i, entry in enumerate(entries):
            try:
                # Convert HTML to Markdown
                markdown = convert_html_to_markdown(entry.content)
                
                # Store both versions during transition
                entry.content_markdown = markdown
                entry.content_format = 'dual'
                
                if i % 10 == 0:
                    db.commit()
                    logger.info(f"Migrated {i}/{len(entries)} entries")
                    
            except Exception as e:
                logger.error(f"Failed to migrate entry {entry.id}: {e}")
                entry.content_format = 'html'  # Mark as HTML only
        
        db.commit()
        logger.info("Migration complete!")
        
    finally:
        db.close()

if __name__ == "__main__":
    migrate_entries()
```

***

## Phase 3: Optimization & Cleanup (2-3 days)

### Day 8: Bundle Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'editor': [
            '@codemirror/state',
            '@codemirror/view',
            '@codemirror/lang-markdown'
          ],
          'markdown': [
            'react-markdown',
            'remark-gfm',
            'remark-math',
            'remark-breaks'
          ],
          'rendering': [
            'rehype-katex',
            'rehype-highlight',
            'rehype-sanitize'
          ],
          'math': ['katex']
        }
      }
    }
  }
});
```

### Day 9: Styles & Polish

```css
/* apps/web/src/components/editor/MarkdownEditor.css */
.markdown-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.editor-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.editor-content.view-edit .editor-pane {
  width: 100%;
}

.editor-content.view-preview .preview-pane {
  width: 100%;
}

.editor-content.view-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border-color);
}

.editor-pane,
.preview-pane {
  overflow-y: auto;
  padding: 1rem;
  background: var(--bg-primary);
}

/* Mobile: default to single pane */
@media (max-width: 768px) {
  .editor-content.view-split {
    grid-template-columns: 1fr;
  }
  
  .editor-content.view-split .preview-pane {
    display: none;
  }
}

/* Markdown content styles */
.preview-pane .prose {
  max-width: 70ch;
  margin: 0 auto;
}

/* KaTeX overrides for consistent sizing */
.katex {
  font-size: 1.1em;
}

/* Code highlighting */
.hljs {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 0.5rem;
}
```

### Day 10: Testing & Verification

```typescript
// apps/web/src/components/editor/__tests__/MarkdownEditor.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownEditor } from '../MarkdownEditor';

describe('MarkdownEditor', () => {
  it('converts HTML to Markdown on load', async () => {
    const htmlEntry = {
      id: '123',
      title: 'Test',
      content: '<h1>Hello</h1><p>World</p>',
      format: 'html' as const
    };
    
    render(<MarkdownEditor selectedEntry={htmlEntry} />);
    
    await waitFor(() => {
      const editor = screen.getByRole('textbox');
      expect(editor).toHaveValue('# Hello\n\nWorld');
    });
  });
  
  it('saves in Markdown format', async () => {
    const onSave = Vitest.fn();
    render(<MarkdownEditor onSave={onSave} />);
    
    const editor = screen.getByRole('textbox');
    await userEvent.type(editor, '# Test\n\nContent');
    
    await userEvent.keyboard('{Control>}s{/Control}');
    
    expect(onSave).toHaveBeenCalledWith(
      '# Test\n\nContent',
      expect.any(String),
      'markdown'
    );
  });
  
  it('renders math correctly', () => {
    const { container } = render(
      <MarkdownEditor 
        selectedEntry={{
          id: '123',
          title: 'Math',
          content: 'Inline $E = mc^2$ and block:\n\n$$\\int_0^\\infty e^{-x^2} dx$$',
          format: 'markdown'
        }}
      />
    );
    
    expect(container.querySelector('.katex')).toBeInTheDocument();
  });
});
```

***

## Phase 4: Switchover (1 day)

### Day 11: Final Migration & Cleanup

```bash
# 1. Run migration script
cd apps/api
uv run python scripts/migrate_entries.py

# 2. Test both editors work
# - Create new entry in Markdown editor
# - Edit old entry (should convert)
# - Switch between editors

# 3. Make Markdown the default
# Update localStorage or set feature flag

# 4. Remove TipTap (when comfortable)
cd apps/web
bun remove @tiptap/react @tiptap/starter-kit @tiptap/extension-*
rm -rf src/components/editor/BubbleToolbar*
rm -rf src/components/editor/extensions/CodeBlockMonaco*
rm -rf src/components/editor/extensions/SlashCommands*

# 5. Clean up bundle
bun run build
# Verify size reduction
```

***

## Rollback Plan (if needed)

Since this is a personal app, rollback is simple:

```bash
# 1. Toggle back to classic editor
# Just change localStorage flag

# 2. If data issues:
# The original HTML is preserved in the database

# 3. Nuclear option:
git revert <commit-hash>
bun install
```

***

## Key Decisions for Personal Use

1. **No complex migration**: Just convert on-the-fly when opening old entries
2. **Simple feature flag**: localStorage instead of complex system
3. **Keep both editors temporarily**: Can switch back anytime
4. **No A/B testing**: Just use it and see how it feels
5. **Minimal backend changes**: Add format field, keep it simple
6. **Quick timeline**: 2 weeks not 10 weeks

***

## Success Criteria

- [ ] Bundle size < 700KB (from 2.55MB)
- [ ] All existing entries open without data loss
- [ ] Math rendering works ($E = mc^2$)
- [ ] Code highlighting works
- [ ] Save/load cycle works
- [ ] Can switch back to old editor if needed

***

## Next Actions

1. **Today**: Install dependencies, create MarkdownEditor component
2. **Tomorrow**: Test with a few entries, verify conversion works
3. **This week**: Use in parallel, fix any issues
4. **Next week**: Switch fully to Markdown, remove TipTap

***

*This is a pragmatic approach for a personal journal. We're not overthinking it - just building a better editor that's lighter and more maintainable.*
