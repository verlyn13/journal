// Texture System - Subtle surface textures

import type { TextureType } from './types';

// Base64 encoded texture patterns (small, tileable)
const texturePatterns: Record<TextureType, string> = {
  none: '',
  
  // Paper texture - subtle fiber pattern
  paper: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5' result='noise' seed='1'/%3E%3CfeDiffuseLighting in='noise' lighting-color='white' surfaceScale='1'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23paper)' opacity='0.4'/%3E%3C/svg%3E`,
  
  // Canvas texture - woven pattern
  canvas: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23000' stroke-width='0.5' opacity='0.1'/%3E%3Cpath d='M0 10h40M10 0v40M0 30h40M30 0v40' stroke='%23000' stroke-width='0.25' opacity='0.05'/%3E%3C/svg%3E`,
  
  // Linen texture - cross-hatch pattern
  linen: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpattern id='linen' patternUnits='userSpaceOnUse' width='60' height='60'%3E%3Cpath d='M0,30 l60,0' stroke='%23000' stroke-width='0.5' opacity='0.05'/%3E%3Cpath d='M30,0 l0,60' stroke='%23000' stroke-width='0.5' opacity='0.05'/%3E%3Cpath d='M0,15 l30,0 M30,45 l30,0' stroke='%23000' stroke-width='0.25' opacity='0.03'/%3E%3Cpath d='M15,0 l0,30 M45,30 l0,30' stroke='%23000' stroke-width='0.25' opacity='0.03'/%3E%3C/pattern%3E%3Crect width='60' height='60' fill='url(%23linen)'/%3E%3C/svg%3E`,
  
  // Noise texture - random dots
  noise: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' seed='5'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E`,
  
  // Grain texture - film grain effect
  grain: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='grain'%3E%3CfeTurbulence baseFrequency='0.6' type='fractalNoise' numOctaves='1' seed='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23grain)' opacity='0.03'/%3E%3C/svg%3E`,
};

// Texture sizes for different patterns
const textureSizes: Record<TextureType, string> = {
  none: '',
  paper: '100px 100px',
  canvas: '40px 40px',
  linen: '60px 60px',
  noise: '200px 200px',
  grain: '300px 300px',
};

export function getTextureStyles(type: TextureType): React.CSSProperties {
  if (type === 'none' || !texturePatterns[type]) {
    return {};
  }

  return {
    backgroundImage: `url("${texturePatterns[type]}")`,
    backgroundRepeat: 'repeat',
    backgroundSize: textureSizes[type],
  };
}

// Generate texture CSS classes
export function generateTextureCSS(): string {
  const css: string[] = [];
  
  for (const [type, pattern] of Object.entries(texturePatterns)) {
    if (type === 'none' || !pattern) continue;
    
    css.push(`
      .texture-${type} {
        position: relative;
      }
      
      .texture-${type}::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("${pattern}");
        background-repeat: repeat;
        background-size: ${textureSizes[type as TextureType]};
        opacity: 0.4;
        pointer-events: none;
        mix-blend-mode: multiply;
      }
    `);
  }
  
  return css.join('\n');
}

// Get texture opacity based on theme
export function getTextureOpacity(
  type: TextureType,
  isDarkMode: boolean
): number {
  if (type === 'none') return 0;
  
  // Reduce texture opacity in dark mode for better readability
  const baseOpacity = {
    paper: 0.4,
    canvas: 0.3,
    linen: 0.25,
    noise: 0.02,
    grain: 0.03,
  };
  
  return isDarkMode 
    ? baseOpacity[type] * 0.5 
    : baseOpacity[type];
}

// Check if texture provides enough contrast
export function isTextureAccessible(
  type: TextureType,
  textColor: string,
  backgroundColor: string
): boolean {
  // Simple check - ensure texture doesn't reduce contrast too much
  const textureOpacity = getTextureOpacity(type, false);
  
  // If texture is too opaque, it might affect readability
  return textureOpacity < 0.5;
}