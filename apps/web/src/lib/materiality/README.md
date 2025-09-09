# Materiality System v2.0

A comprehensive visual depth and surface effect system for creating rich, tactile interfaces with Material Design 3 principles.

## Features

- 🎨 **Surface Components**: Flat, raised, sunken, and floating variants
- 📐 **Elevation System**: 6-level depth with realistic shadows
- 🖼️ **Texture Library**: Paper, canvas, linen, noise, and grain effects
- 🪟 **Glass Morphism**: Blur, tint, and transparency effects
- ♿ **Accessibility**: WCAG AA compliant with reduced motion support
- 🎯 **Interactive States**: Hover and press elevation changes
- 🌊 **Ripple Effects**: Material Design ripple animations

## Installation

```typescript
import { 
  Surface, 
  Card, 
  Glass,
  useElevation,
  useMateriality 
} from '@/lib/materiality';
```

## Basic Usage

### Surface Components

```tsx
// Basic surface
<Surface elevation={2} texture="paper">
  Content with depth and texture
</Surface>

// Interactive card
<Card elevation={1} interactive>
  <h3>Card Title</h3>
  <p>Card content with hover elevation</p>
</Card>

// Paper background for editor
<Paper texture="linen">
  <Editor />
</Paper>

// Floating panel with vibrant effect
<FloatingPanel elevation={3} vibrant>
  <Toolbar />
</FloatingPanel>
```

### Glass Morphism

```tsx
// Basic glass effect
<Glass blur="md" opacity={0.8}>
  <Navigation />
</Glass>

// Frosted glass variant
<FrostedGlass>
  <Modal />
</FrostedGlass>

// Windows 11 style acrylic
<Acrylic tint="#f3f3f3">
  <Sidebar />
</Acrylic>
```

### Elevation Hooks

```tsx
function InteractiveCard() {
  const { elevation, elevationStyles, elevationHandlers } = useElevation(1);
  
  return (
    <div 
      style={elevationStyles}
      {...elevationHandlers}
    >
      Current elevation: {elevation}
    </div>
  );
}
```

### Texture Management

```tsx
function TexturedSurface() {
  const { textureOpacity, textureStyles } = useTexture('paper', isDarkMode);
  
  return (
    <div style={textureStyles}>
      Paper texture with {textureOpacity} opacity
    </div>
  );
}
```

### Parallax Depth

```tsx
function ParallaxCard() {
  const { ref, parallaxStyles } = useParallax(2);
  
  return (
    <div ref={ref}>
      <div style={parallaxStyles}>
        Content moves with mouse
      </div>
    </div>
  );
}
```

### Ripple Effect

```tsx
function RippleButton() {
  const { rippleRef, createRipple } = useRipple();
  
  return (
    <button onClick={createRipple}>
      <span ref={rippleRef} className="ripple-container" />
      Click for ripple
    </button>
  );
}
```

## Elevation Levels

- **Level 0**: No elevation (flat)
- **Level 1**: Cards, list items (resting)
- **Level 2**: Cards (hover), raised buttons
- **Level 3**: Floating action buttons, tooltips
- **Level 4**: Navigation drawers, modals
- **Level 5**: Dialogs, popovers (highest)

## Texture Types

- **none**: No texture
- **paper**: Subtle fiber pattern for documents
- **canvas**: Woven pattern for creative surfaces
- **linen**: Cross-hatch for premium feel
- **noise**: Random dots for subtle variation
- **grain**: Film grain for vintage effect

## Glass Blur Levels

- **none**: No blur (0px)
- **sm**: Subtle blur (4px)
- **md**: Medium blur (8px)
- **lg**: Strong blur (16px)
- **xl**: Maximum blur (24px)

## Configuration

```tsx
function App() {
  const materiality = useMateriality({
    elevationScale: 1.2,      // Scale all elevations
    textureOpacity: 0.8,       // Global texture opacity
    glassBlur: 12,             // Default glass blur
    vibrantIntensity: 1.5,     // Vibrant effect strength
    reducedMotion: false,      // Override motion preference
  });
  
  return (
    <MaterialityProvider config={materiality}>
      <YourApp />
    </MaterialityProvider>
  );
}
```

## CSS Variables

The system exposes CSS variables for customization:

```css
:root {
  --elevation-scale: 1;
  --texture-opacity: 0.4;
  --glass-blur: 8px;
  --vibrant-intensity: 1;
  --ripple-color: currentColor;
}
```

## Accessibility

- All elevations meet WCAG AA contrast requirements
- Textures automatically reduce opacity in dark mode
- Glass effects have fallbacks for unsupported browsers
- Respects `prefers-reduced-motion` for animations
- Proper ARIA attributes for decorative elements

## Performance

- Textures use optimized SVG patterns
- Elevation shadows are GPU-accelerated
- Glass effects use native `backdrop-filter`
- Lazy loading for texture patterns
- Minimal runtime calculations

## Browser Support

- Modern browsers with CSS custom properties
- `backdrop-filter` for glass effects (with fallbacks)
- CSS Grid and Flexbox for layouts
- SVG for texture patterns

## Testing

```bash
bun test src/lib/materiality
```

## License

Part of the Journal application - All rights reserved
