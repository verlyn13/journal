// Surface Components with Materiality

import type React from 'react';
import { forwardRef } from 'react';
import type { SurfaceProps } from './types';
import { getElevationStyles } from './elevation';
import { getTextureStyles } from './textures';

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      variant = 'flat',
      elevation = 0,
      texture = 'none',
      vibrant = false,
      interactive = false,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    const elevationStyles = getElevationStyles(elevation);
    const textureStyles = getTextureStyles(texture);

    const surfaceClasses = [
      'surface',
      `surface--${variant}`,
      vibrant && 'surface--vibrant',
      interactive && 'surface--interactive',
      texture !== 'none' && `texture-${texture}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const surfaceStyles: React.CSSProperties = {
      ...elevationStyles,
      ...textureStyles,
      position: 'relative',
      backgroundColor: vibrant ? 'rgba(255, 255, 255, 0.85)' : 'var(--surface-primary)',
      backdropFilter: vibrant ? 'blur(20px) saturate(180%)' : undefined,
      WebkitBackdropFilter: vibrant ? 'blur(20px) saturate(180%)' : undefined,
      transition: interactive ? 'transform 200ms ease, box-shadow 200ms ease' : undefined,
    };

    return (
      <div
        ref={ref}
        className={surfaceClasses}
        style={surfaceStyles}
        data-elevation={elevation}
        data-variant={variant}
        data-interactive={interactive ? 'true' : 'false'}
        {...props}
      >
        {texture !== 'none' && (
          <div
            className="surface__texture"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.4,
              mixBlendMode: 'multiply',
              backgroundImage: textureStyles.backgroundImage,
              backgroundSize: textureStyles.backgroundSize,
            }}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    );
  },
);

Surface.displayName = 'Surface';

// Card component built on Surface
export const Card = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ elevation = 1, interactive = true, className = '', ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        variant="raised"
        elevation={elevation}
        interactive={interactive}
        className={`card ${className}`.trim()}
        {...props}
      />
    );
  },
);

Card.displayName = 'Card';

// Paper component for editor backgrounds
export const Paper = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ texture = 'paper', className = '', ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        variant="flat"
        elevation={0}
        texture={texture}
        className={`paper ${className}`.trim()}
        {...props}
      />
    );
  },
);

Paper.displayName = 'Paper';

// Floating action surface
export const FloatingPanel = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ elevation = 3, vibrant = false, className = '', ...props }, ref) => {
    return (
      <Surface
        ref={ref}
        variant="floating"
        elevation={elevation}
        vibrant={vibrant}
        className={`floating-panel ${className}`.trim()}
        {...props}
      />
    );
  },
);

FloatingPanel.displayName = 'FloatingPanel';
