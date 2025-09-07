// Glass Morphism Effects

import type React from 'react';
import { forwardRef } from 'react';
import type { GlassProps } from './types';

const blurValues = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
};

export const Glass = forwardRef<HTMLDivElement, GlassProps>(
  (
    { blur = 'md', opacity = 0.8, saturation = 1.5, tint, className = '', children, ...props },
    ref,
  ) => {
    const glassStyles: React.CSSProperties = {
      backgroundColor: tint
        ? `rgba(${hexToRgba(tint)}, ${opacity})`
        : `rgba(255, 255, 255, ${opacity})`,
      backdropFilter: `blur(${blurValues[blur]}) saturate(${saturation * 100}%)`,
      WebkitBackdropFilter: `blur(${blurValues[blur]}) saturate(${saturation * 100}%)`,
      border: '1px solid rgba(255, 255, 255, 0.18)',
    };

    return (
      <div ref={ref} className={`glass ${className}`} style={glassStyles} {...props}>
        {children}
      </div>
    );
  },
);

Glass.displayName = 'Glass';

// Frosted glass variant
export const FrostedGlass = forwardRef<HTMLDivElement, GlassProps>(
  ({ blur = 'lg', opacity = 0.95, saturation = 1.2, ...props }, ref) => {
    return <Glass ref={ref} blur={blur} opacity={opacity} saturation={saturation} {...props} />;
  },
);

FrostedGlass.displayName = 'FrostedGlass';

// Acrylic material (Windows 11 style)
export const Acrylic = forwardRef<HTMLDivElement, GlassProps>(
  ({ blur = 'xl', opacity = 0.6, tint = '#f3f3f3', ...props }, ref) => {
    return (
      <Glass ref={ref} blur={blur} opacity={opacity} tint={tint} className="acrylic" {...props} />
    );
  },
);

Acrylic.displayName = 'Acrylic';

// Helper function to convert hex to rgba values
function hexToRgba(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '255, 255, 255';

  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

// Generate glass morphism CSS
export function generateGlassCSS(): string {
  return `
    .glass {
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      box-shadow: 
        0 8px 32px 0 rgba(31, 38, 135, 0.37),
        inset 0 0 0 1px rgba(255, 255, 255, 0.18);
    }
    
    .glass::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0) 100%
      );
      pointer-events: none;
    }
    
    .acrylic {
      background-image: 
        linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.05) 0%,
          rgba(255, 255, 255, 0) 40%
        ),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' seed='5'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
      background-size: auto, 200px 200px;
    }
    
    @supports not (backdrop-filter: blur(1px)) {
      .glass {
        background-color: rgba(255, 255, 255, 0.95);
      }
    }
    
    @media (prefers-reduced-motion: reduce) {
      .glass,
      .glass::before {
        transition: none;
      }
    }
  `;
}

// Check if backdrop-filter is supported
export function supportsBackdropFilter(): boolean {
  if (typeof window === 'undefined') return false;
  const override = (window as unknown as { __BACKDROP_SUPPORT_OVERRIDE__?: boolean })
    .__BACKDROP_SUPPORT_OVERRIDE__;
  if (typeof override === 'boolean') return override;
  const css = (
    window as unknown as { CSS?: { supports?: (prop: string, value: string) => boolean } }
  ).CSS;
  const hasCssSupports = !!css && typeof css.supports === 'function';
  if (!hasCssSupports) return false;
  return (
    css!.supports!('backdrop-filter', 'blur(1px)') ||
    css!.supports!('-webkit-backdrop-filter', 'blur(1px)')
  );
}
