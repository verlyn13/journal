// Materiality Type Definitions

export interface SurfaceProps {
  variant?: 'flat' | 'raised' | 'sunken' | 'floating';
  elevation?: ElevationLevel;
  texture?: TextureType;
  vibrant?: boolean;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type TextureType = 'none' | 'paper' | 'canvas' | 'linen' | 'noise' | 'grain';

export interface GlassProps {
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  saturation?: number;
  tint?: string;
  className?: string;
  children?: React.ReactNode;
}

export interface MaterialityConfig {
  elevationScale?: number;
  textureOpacity?: number;
  glassBlur?: number;
  vibrantIntensity?: number;
  reducedMotion?: boolean;
}

export interface ElevationShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

export interface MaterialTheme {
  surfaces: {
    primary: string;
    secondary: string;
    tertiary: string;
    accent: string;
  };
  elevations: Record<ElevationLevel, ElevationShadow[]>;
  glass: {
    blur: Record<string, string>;
    tint: Record<string, string>;
  };
  textures: Record<TextureType, string>;
}
