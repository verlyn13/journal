import type { Config } from 'tailwindcss'
import { tokens } from './src/lib/design-tokens'

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sanctuary theme colors with design tokens
        sanctuary: {
          // Dawn Mode (Light)
          sand: tokens.color.dawn.background.primary,
          'stone-blue': tokens.color.dawn.accent.primary,
          // Dusk Mode (Dark) - will be applied via CSS variables
          evergreen: tokens.color.dusk.background.primary,
          'burnished-gold': tokens.color.dusk.accent.primary,
          
          // Semantic color mapping
          'bg-primary': 'var(--sanctuary-background-primary)',
          'bg-secondary': 'var(--sanctuary-background-secondary)',
          'bg-tertiary': 'var(--sanctuary-background-tertiary)',
          'text-primary': 'var(--sanctuary-text-primary)',
          'text-secondary': 'var(--sanctuary-text-secondary)',
          'accent': 'var(--sanctuary-accent-primary)',
          'accent-hover': 'var(--sanctuary-accent-hover)',
          'border': 'var(--sanctuary-border)'
        }
      },
      
      spacing: tokens.spacing,
      boxShadow: tokens.elevation,
      
      transitionTimingFunction: {
        panel: tokens.motion.panel,
        emphasis: tokens.motion.emphasis
      },
      
      fontFamily: {
        sans: tokens.typography.fonts.ui.split(','),
        serif: tokens.typography.fonts.content.split(','),
        mono: tokens.typography.fonts.code.split(',')
      },
      
      fontSize: tokens.typography.sizes,
      
      screens: {
        tablet: `${tokens.breakpoints.tablet}px`,
        desktop: `${tokens.breakpoints.desktop}px`,
        wide: `${tokens.breakpoints.wide}px`
      },
      
      maxWidth: {
        prose: '70ch' // Optimal reading width
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
} satisfies Config