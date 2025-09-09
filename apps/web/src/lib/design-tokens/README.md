# Design Token System v2.0

A comprehensive design token system for the Journal application providing consistent theming, spacing, typography, and motion across all components.

## Features

- 🎨 **Dual Theme Support**: Dawn (light) and Dusk (dark) modes
- 🎯 **Type Safety**: Full TypeScript support with branded types
- 🔄 **CSS Custom Properties**: Dynamic theme switching with CSS variables
- 📱 **Responsive**: Breakpoint tokens for consistent responsive design
- ⚡ **Performance**: Optimized token access and theme transitions

## Usage

### Basic Token Access

```tsx
import { tokens } from '@/lib/design-tokens'

// Access color tokens
const primaryBg = tokens.color.dawn.background.primary
const accentColor = tokens.color.dusk.accent.primary

// Access spacing tokens  
const padding = tokens.spacing.lg // 1.5rem
const margin = tokens.spacing['2xl'] // 3rem

// Access typography tokens
const fontStack = tokens.typography.fonts.content
const fontSize = tokens.typography.sizes.xl
```

### Theme Provider

```tsx
import { ThemeProvider } from '@/lib/theme/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultMode="dawn">
      <YourAppContent />
    </ThemeProvider>
  )
}
```

### Using Theme Hook

```tsx
import { useTheme } from '@/lib/theme/ThemeProvider'

function MyComponent() {
  const { mode, setMode, toggleMode } = useTheme()
  
  return (
    <div>
      <p>Current theme: {mode}</p>
      <button onClick={toggleMode}>Toggle Theme</button>
    </div>
  )
}
```

### Theme Toggle Components

```tsx
import { ThemeToggle, ThemeSegmentedControl } from '@/lib/theme/ThemeToggle'

// Simple toggle button
<ThemeToggle />

// Select dropdown
<ThemeToggle variant="select" />

// Segmented control (design-forward)
<ThemeSegmentedControl />
```

### CSS Custom Properties

The system automatically generates CSS custom properties that can be used in CSS or Tailwind:

```css
/* Generated CSS variables */
:root {
  --sanctuary-background-primary: #f5f3f0;
  --sanctuary-text-primary: #41454c;
  --sanctuary-accent-primary: #a8b5c5;
  /* ... */
}

/* Usage in CSS */
.my-element {
  background: var(--sanctuary-background-primary);
  color: var(--sanctuary-text-primary);
}
```

### Tailwind Integration

The tokens are integrated with Tailwind CSS for seamless usage:

```tsx
// Using semantic color classes
<div className="bg-sanctuary-bg-primary text-sanctuary-text-primary">
  <h1 className="text-sanctuary-accent">Hello World</h1>
</div>

// Using spacing tokens
<div className="p-lg m-xl">Content</div>

// Using typography tokens
<p className="font-content text-lg">Article content</p>
```

## Token Categories

### Colors

**Dawn Mode (Light Theme)**

- Background: Sand tones (#f5f3f0, #eae8e3, #dde3ea)
- Text: Dark grays (#41454c, #6b7280)
- Accent: Stone blue (#a8b5c5, #8fa5b8)

**Dusk Mode (Dark Theme)**

- Background: Deep blues and grays (#2c303a, #383d4a, #505668)
- Text: Light grays (#d4d6d9, #9ca3af)
- Accent: Burnished gold (#d4af8b, #c19b76)

### Spacing

8px base unit with systematic scale:

- `xs`: 4px, `sm`: 8px, `md`: 16px, `lg`: 24px, `xl`: 32px, `2xl`: 48px
- Custom: `18` (72px), `22` (88px) for generous spacing

### Elevation

Three-tier shadow system for depth:

- `sm`: Subtle lift for cards
- `md`: Modal and dropdown shadows
- `lg`: High-emphasis overlays

### Motion

Purposeful animation timing:

- `panel`: Material-inspired panel animations
- `emphasis`: Attention-drawing motions
- `standard`: General transitions (200ms)
- `slow`: Complex state changes (300ms)

### Typography

Three font stacks:

- `ui`: Inter (interface elements)
- `content`: Lora (reading content)
- `code`: JetBrains Mono (code blocks)

### Breakpoints

Mobile-first responsive design:

- `mobile`: 0px, `tablet`: 768px, `desktop`: 1280px, `wide`: 1920px

## Advanced Usage

### CSS Variable Generation

```tsx
import { generateCSSVariables } from '@/lib/design-tokens'

// Generate CSS variables for a theme
const dawnVars = generateCSSVariables('dawn')
const duskVars = generateCSSVariables('dusk')
```

### Type Safety

```tsx
import type { ThemeMode, ColorCategory, SpacingSize } from '@/lib/design-tokens'

function getColorValue(theme: ThemeMode, category: ColorCategory) {
  return tokens.color[theme][category]
}
```

## Migration from Previous System

The v2.0 design token system replaces the previous ad-hoc color definitions. Key changes:

1. **Semantic naming**: `sanctuary-bg-primary` instead of specific color names
2. **Theme-aware**: Automatic light/dark mode support
3. **CSS variables**: Dynamic theme switching without page reload
4. **Type safety**: Full TypeScript integration
5. **Extended palette**: More nuanced color options

## Performance Considerations

- CSS custom properties update efficiently without re-parsing
- Theme transitions are optimized to prevent layout thrashing
- Token objects are marked as `const` for tree-shaking
- Minimal runtime overhead with compile-time token resolution

## Accessibility

- WCAG AAA compliant color contrast ratios
- Respects `prefers-color-scheme` media query
- Smooth theme transitions with reduced motion support
- Focus indicators using accent colors with sufficient contrast
