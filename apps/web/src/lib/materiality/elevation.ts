// Elevation System - Material Design 3 inspired

import type { ElevationLevel, ElevationShadow } from './types';

// Elevation definitions following Material Design principles
const elevationShadows: Record<ElevationLevel, ElevationShadow[]> = {
  0: [],
  1: [
    { x: 0, y: 1, blur: 3, spread: 0, color: '#000000', opacity: 0.12 },
    { x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.24 },
  ],
  2: [
    { x: 0, y: 3, blur: 6, spread: 0, color: '#000000', opacity: 0.16 },
    { x: 0, y: 3, blur: 6, spread: 0, color: '#000000', opacity: 0.23 },
  ],
  3: [
    { x: 0, y: 10, blur: 20, spread: 0, color: '#000000', opacity: 0.19 },
    { x: 0, y: 6, blur: 6, spread: 0, color: '#000000', opacity: 0.23 },
  ],
  4: [
    { x: 0, y: 14, blur: 28, spread: 0, color: '#000000', opacity: 0.25 },
    { x: 0, y: 10, blur: 10, spread: 0, color: '#000000', opacity: 0.22 },
  ],
  5: [
    { x: 0, y: 19, blur: 38, spread: 0, color: '#000000', opacity: 0.30 },
    { x: 0, y: 15, blur: 12, spread: 0, color: '#000000', opacity: 0.22 },
  ],
};

// Generate box-shadow CSS string
export function getElevationStyles(level: ElevationLevel): React.CSSProperties {
  const shadows = elevationShadows[level];
  
  if (!shadows || shadows.length === 0) {
    return {};
  }

  const boxShadow = shadows
    .map(shadow => 
      `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${hexToRgb(shadow.color)}, ${shadow.opacity})`
    )
    .join(', ');

  return { boxShadow };
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// Get elevation for hover state
export function getHoverElevation(currentLevel: ElevationLevel): ElevationLevel {
  return Math.min(currentLevel + 1, 5) as ElevationLevel;
}

// Get elevation for pressed state
export function getPressedElevation(currentLevel: ElevationLevel): ElevationLevel {
  return Math.max(currentLevel - 1, 0) as ElevationLevel;
}

// Animated elevation transition
export function getElevationTransition(duration = 200): React.CSSProperties {
  return {
    transition: `box-shadow ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };
}

// Generate elevation classes for CSS
export function generateElevationCSS(): string {
  const css: string[] = [];
  
  for (const [level, shadows] of Object.entries(elevationShadows)) {
    if (shadows.length === 0) continue;
    
    const boxShadow = shadows
      .map(shadow => 
        `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px rgba(${hexToRgb(shadow.color)}, ${shadow.opacity})`
      )
      .join(', ');
    
    css.push(`.elevation-${level} { box-shadow: ${boxShadow}; }`);
  }
  
  return css.join('\n');
}

// Check if elevation is accessible (has enough contrast)
export function isElevationAccessible(
  level: ElevationLevel,
  backgroundColor: string
): boolean {
  // Simple check - in production, use a proper contrast calculation
  // Higher elevations need lighter backgrounds for visibility
  return level <= 3 || isLightColor(backgroundColor);
}

function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}