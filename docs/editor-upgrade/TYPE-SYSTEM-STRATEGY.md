# Type System Strategy
## Systematic Approach to TypeScript Types in the Journal Project

---

## Core Principles

### 1. **Single Source of Truth**
Every data structure has ONE canonical type definition, not scattered duplicates.

### 2. **Type Hierarchy**
```
Domain Types (business logic)
    ↓
Application Types (app-specific)
    ↓
Component Types (UI contracts)
    ↓
Utility Types (helpers)
```

### 3. **No Implicit Any**
TypeScript strict mode enforced - everything must be typed.

---

## Type Organization Structure

```
apps/web/src/types/
├── index.ts           # Re-exports all types
├── domain/            # Business domain types
│   ├── entry.ts       # Entry, EntryFormat, EntryStatus
│   ├── user.ts        # User, UserRole, UserPreferences
│   └── index.ts      # Domain re-exports
├── api/               # API contracts
│   ├── requests.ts    # Request DTOs
│   ├── responses.ts   # Response DTOs
│   ├── errors.ts      # Error types
│   └── index.ts      # API re-exports
├── ui/                # UI-specific types
│   ├── editor.ts      # EditorState, EditorMode
│   ├── forms.ts       # Form types
│   └── index.ts      # UI re-exports
└── utils/             # Utility types
    ├── guards.ts      # Type guards
    ├── branded.ts     # Branded types
    └── index.ts      # Utils re-exports
```

---

## Type Definition Standards

### 1. **Domain Types (Canonical)**

```typescript
// apps/web/src/types/domain/entry.ts
// This is THE definition of an Entry - all other types derive from this

export interface Entry {
  id: string;
  title: string;
  content: string;
  format: EntryFormat;
  markdown?: string;  // Optional during migration
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type EntryFormat = 'html' | 'markdown';

export interface EntryMetadata {
  wordCount: number;
  characterCount: number;
  readingTime: number;
}

// Type guards for runtime validation
export function isEntry(obj: unknown): obj is Entry {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'content' in obj &&
    'format' in obj
  );
}
```

### 2. **API Types (Contract)**

```typescript
// apps/web/src/types/api/responses.ts
// These match the backend exactly

import type { Entry } from '../domain/entry';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface EntryResponse extends ApiResponse<Entry> {}

export interface EntriesListResponse extends ApiResponse<{
  entries: Entry[];
  total: number;
  page: number;
  pageSize: number;
}> {}

// Request types
export interface CreateEntryRequest {
  title: string;
  content: string;
  format: EntryFormat;
}

export interface UpdateEntryRequest extends Partial<CreateEntryRequest> {
  id: string;
}
```

### 3. **Component Types (UI Contracts)**

```typescript
// apps/web/src/types/ui/editor.ts
// Props and state for UI components

import type { Entry, EntryFormat } from '../domain/entry';

export interface EditorProps {
  entry?: Entry;
  onChange: (content: string) => void;
  onSave: (content: string, title: string) => Promise<void>;
  readOnly?: boolean;
}

export interface EditorState {
  content: string;
  format: EntryFormat;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  errors: EditorError[];
}

export interface EditorError {
  type: 'validation' | 'save' | 'conversion';
  message: string;
  field?: string;
}

// Discriminated unions for state machines
export type EditorMode = 
  | { type: 'idle' }
  | { type: 'editing'; startTime: Date }
  | { type: 'saving' }
  | { type: 'error'; error: EditorError };
```

### 4. **Utility Types**

```typescript
// apps/web/src/types/utils/branded.ts
// Branded types for type safety

export type Brand<K, T> = K & { __brand: T };

export type UUID = Brand<string, 'UUID'>;
export type Email = Brand<string, 'Email'>;
export type Markdown = Brand<string, 'Markdown'>;
export type HTML = Brand<string, 'HTML'>;

// Conversion functions that validate
export function toUUID(str: string): UUID {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(str)) {
    throw new Error(`Invalid UUID: ${str}`);
  }
  return str as UUID;
}

export function toMarkdown(str: string): Markdown {
  // Could add validation
  return str as Markdown;
}
```

---

## Type Import Strategy

### 1. **Always Use Type Imports**

```typescript
// Good - explicit type imports
import type { Entry, EntryFormat } from '@/types/domain/entry';

// Bad - mixed imports
import { Entry, isEntry } from '@/types/domain/entry';

// Good - separate type and value imports
import type { Entry } from '@/types/domain/entry';
import { isEntry } from '@/types/domain/entry';
```

### 2. **Path Aliases**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/types/*": ["./src/types/*"],
      "@/domain/*": ["./src/types/domain/*"],
      "@/api/*": ["./src/types/api/*"],
      "@/ui/*": ["./src/types/ui/*"]
    }
  }
}
```

### 3. **Barrel Exports**

```typescript
// apps/web/src/types/index.ts
// Central export point

export type {
  // Domain
  Entry,
  EntryFormat,
  User,
  UserRole,
  
  // API
  ApiResponse,
  ApiError,
  CreateEntryRequest,
  UpdateEntryRequest,
  
  // UI
  EditorProps,
  EditorState,
  EditorMode
} from './domain';

export {
  // Type guards
  isEntry,
  isUser,
  
  // Branded type functions
  toUUID,
  toMarkdown,
  toHTML
} from './utils';
```

---

## Type Fixing Strategy

### 1. **Automated Type Generation**

```json
// package.json
{
  "scripts": {
    "types:generate": "bun run types:api && bun run types:check",
    "types:api": "openapi-typescript http://localhost:8000/openapi.json -o src/types/generated/api.ts",
    "types:check": "tsc --noEmit",
    "types:coverage": "typescript-coverage-report"
  }
}
```

### 2. **Type-Safe API Client**

```typescript
// apps/web/src/lib/api-client.ts
import type { ApiResponse } from '@/types/api/responses';

class TypedApiClient {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(url);
    const data = await response.json();
    
    // Runtime validation
    if (!this.isApiResponse(data)) {
      throw new Error('Invalid API response');
    }
    
    return data as ApiResponse<T>;
  }
  
  private isApiResponse(obj: unknown): obj is ApiResponse<unknown> {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'success' in obj &&
      'data' in obj
    );
  }
}

export const api = new TypedApiClient();
```

### 3. **Type Coercion at Boundaries**

```typescript
// apps/web/src/lib/entry-mapper.ts
import type { Entry } from '@/types/domain/entry';
import { toUUID, toMarkdown } from '@/types/utils/branded';

export function normalizeEntry(raw: unknown): Entry {
  // Validate and coerce at the boundary
  if (!isValidEntry(raw)) {
    throw new Error('Invalid entry data');
  }
  
  return {
    id: toUUID(raw.id),
    title: String(raw.title || 'Untitled'),
    content: String(raw.content || ''),
    format: raw.format === 'markdown' ? 'markdown' : 'html',
    markdown: raw.markdown ? toMarkdown(raw.markdown) : undefined,
    createdAt: new Date(raw.created_at),
    updatedAt: new Date(raw.updated_at),
    userId: toUUID(raw.user_id)
  };
}

function isValidEntry(obj: unknown): obj is Record<string, unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'content' in obj
  );
}
```

---

## Type Error Resolution Workflow

### 1. **Identify Pattern**

```typescript
// Common type errors and fixes

// Error: Object is possibly 'null'
// Fix: Add null check or non-null assertion
if (!editor) return;
editor.focus();  // Safe now

// Error: Property 'x' does not exist on type 'never'
// Fix: Narrow the type first
if (state.type === 'editing') {
  console.log(state.startTime);  // TypeScript knows this is EditingState
}

// Error: Type 'string' is not assignable to type 'UUID'
// Fix: Use branded type converter
const id = toUUID(rawId);  // Validates and brands
```

### 2. **Create Type Guard**

```typescript
// When you see repeated type assertions, create a guard
function isMarkdownEntry(entry: Entry): entry is Entry & { markdown: string } {
  return entry.format === 'markdown' && entry.markdown !== undefined;
}

// Usage
if (isMarkdownEntry(entry)) {
  // TypeScript knows markdown exists here
  renderMarkdown(entry.markdown);
}
```

### 3. **Document Type Decisions**

```typescript
// apps/web/src/types/DECISIONS.md
/*
## Type Decisions Log

### 2025-09-01: Branded Types for IDs
- Decision: Use branded types for UUIDs
- Reason: Prevent string mix-ups between different ID types
- Impact: Must use toUUID() at API boundaries

### 2025-09-01: Separate API and Domain Types
- Decision: Keep API types separate from domain types
- Reason: API might change independently of domain model
- Impact: Need mapping layer at boundaries
*/
```

---

## Testing Types

### 1. **Type Tests**

```typescript
// apps/web/src/types/__tests__/type-tests.ts
import { expectType } from 'tsd';
import type { Entry, EntryFormat } from '../domain/entry';

// Test that types work as expected
expectType<Entry>({
  id: 'uuid',
  title: 'Test',
  content: 'Content',
  format: 'markdown',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 'user-id'
});

// Test that invalid types fail
// @ts-expect-error - format must be 'html' | 'markdown'
const invalid: EntryFormat = 'pdf';
```

### 2. **Runtime Validation Tests**

```typescript
// apps/web/src/types/__tests__/guards.test.ts
import { describe, it, expect } from 'vitest';
import { isEntry } from '../domain/entry';

describe('Type Guards', () => {
  it('validates valid entries', () => {
    const valid = {
      id: 'uuid',
      content: 'test',
      format: 'markdown'
    };
    
    expect(isEntry(valid)).toBe(true);
  });
  
  it('rejects invalid entries', () => {
    expect(isEntry(null)).toBe(false);
    expect(isEntry({})).toBe(false);
    expect(isEntry({ id: 'uuid' })).toBe(false);
  });
});
```

---

## Migration Strategy for Existing Code

### Phase 1: Audit Current Types
```bash
# Find all 'any' types
grep -r "any" --include="*.ts" --include="*.tsx" apps/web/src

# Find all implicit any (missing types)
npx tsc --noImplicitAny --noEmit

# Generate type coverage report
npx typescript-coverage-report
```

### Phase 2: Create Canonical Types
1. Define domain types in `types/domain/`
2. Define API types from OpenAPI spec
3. Define UI component props/state types

### Phase 3: Incremental Migration
```typescript
// Step 1: Add type imports
import type { Entry } from '@/types/domain/entry';

// Step 2: Replace inline types
// Before
interface Props {
  entry: { id: string; content: string };
}

// After
interface Props {
  entry: Entry;
}

// Step 3: Add type guards at boundaries
const entry = normalizeEntry(apiResponse.data);
```

### Phase 4: Enable Strict Mode
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## Type System Maintenance

### 1. **Regular Audits**
```json
// package.json
{
  "scripts": {
    "types:audit": "bun run types:coverage && bun run types:unused",
    "types:coverage": "typescript-coverage-report",
    "types:unused": "ts-prune"
  }
}
```

### 2. **Type Documentation**
- Document why complex types exist
- Document type migration decisions
- Keep DECISIONS.md updated

### 3. **Type Reviews**
- Review type changes in PRs
- Ensure single source of truth
- Prevent type duplication

---

## Benefits of This Strategy

1. **Predictable**: Know where every type lives
2. **Maintainable**: Single source of truth
3. **Type-Safe**: Branded types prevent mixups
4. **Testable**: Type guards can be tested
5. **Scalable**: Clear hierarchy and organization
6. **Automated**: Generate from OpenAPI, validate at build

---

*This strategy ensures types are assets, not liabilities. Follow it consistently for a maintainable codebase.*