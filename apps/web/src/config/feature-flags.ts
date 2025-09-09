/**
 * Feature flags for React 19 migration
 * These flags allow progressive rollout of React 19 features
 */

export const featureFlags = {
  // React Compiler - opt-in via environment variable
  reactCompiler: process.env.ENABLE_REACT_COMPILER === 'true',
  
  // React 19 specific features
  react19: {
    // Use new error boundaries
    errorBoundaries: true,
    
    // Enable React DevTools Profiler integration
    profiler: process.env.NODE_ENV === 'development',
    
    // Use automatic batching optimizations
    automaticBatching: true,
    
    // Enable concurrent features
    concurrent: true,
    
    // StrictMode behavior (double-render in dev)
    strictMode: process.env.NODE_ENV === 'development',
  },
  
  // Performance optimizations
  performance: {
    // Lazy load heavy components
    lazyLoading: true,
    
    // Code splitting for routes
    codeSplitting: true,
    
    // Prefetch critical resources
    prefetching: true,
  },
  
  // Development features
  development: {
    // Show performance metrics in dev
    showMetrics: process.env.NODE_ENV === 'development',
    
    // Enable debug logging
    debugLogging: process.env.DEBUG === 'true',
    
    // React Compiler logging
    compilerLogging: process.env.REACT_COMPILER_DEBUG === 'true',
  },
} as const;

// Helper to check if React Compiler is enabled
export const isReactCompilerEnabled = () => featureFlags.reactCompiler;

// Helper to check if we're using React 19 features
export const isReact19Enabled = () => true; // Always true after migration

// Log feature flags in development
if (process.env.NODE_ENV === 'development') {
  console.log('Feature Flags:', {
    reactCompiler: featureFlags.reactCompiler,
    react19Features: featureFlags.react19,
  });
}