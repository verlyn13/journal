/**
 * Feature flags for React 19 migration
 * These flags allow progressive rollout of React 19 features
 */

// Rollout percentages for gradual deployment
const ROLLOUT_CONFIG = {
  reactCompiler: {
    // Percentage of users to enable React Compiler for
    percentage: parseInt(process.env.REACT_COMPILER_ROLLOUT_PERCENT || '0', 10),
    // Force enable/disable via environment
    forceEnable: process.env.ENABLE_REACT_COMPILER === 'true',
    forceDisable: process.env.DISABLE_REACT_COMPILER === 'true',
  },
};

// Simple hash function for consistent user bucketing
const hashUserId = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100;
};

// Get user ID for feature flag bucketing (fallback to session/local storage)
const getUserId = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  // Try to get user ID from auth state, fallback to persistent session ID
  let userId = localStorage.getItem('feature-flag-user-id');
  if (!userId) {
    userId = `anon-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('feature-flag-user-id', userId);
  }
  return userId;
};

// Check if user should be in rollout based on percentage
const isUserInRollout = (percentage: number, userId = getUserId()): boolean => {
  if (percentage === 0) return false;
  if (percentage >= 100) return true;
  return hashUserId(userId) < percentage;
};

export const featureFlags = {
  // React Compiler - with gradual rollout support
  reactCompiler: (() => {
    const config = ROLLOUT_CONFIG.reactCompiler;
    if (config.forceDisable) return false;
    if (config.forceEnable) return true;
    return isUserInRollout(config.percentage);
  })(),
  
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

// Export rollout utilities for debugging
export const rolloutUtils = {
  getUserId,
  hashUserId,
  isUserInRollout,
  ROLLOUT_CONFIG,
};

// Log feature flags and rollout info
if (typeof window !== 'undefined') {
  const rolloutInfo = {
    userId: getUserId(),
    reactCompilerRollout: {
      enabled: featureFlags.reactCompiler,
      percentage: ROLLOUT_CONFIG.reactCompiler.percentage,
      forceEnabled: ROLLOUT_CONFIG.reactCompiler.forceEnable,
      userHash: hashUserId(getUserId()),
    },
  };
  
  console.log('🎛️ Feature Flags:', {
    reactCompiler: featureFlags.reactCompiler,
    react19Features: featureFlags.react19,
  });
  
  if (import.meta.env.DEV) {
    console.log('🎯 Rollout Info:', rolloutInfo);
  }
}