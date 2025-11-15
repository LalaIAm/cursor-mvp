/**
 * Auth utility functions
 * Note: Auth state is now managed via AuthContext
 * TODO: Migrate to Redux Toolkit or Zustand when available
 */

export interface User {
  id: string;
  email: string;
}

/**
 * Check if user is authenticated
 * @deprecated Use useAuth hook from AuthContext instead
 * This function is kept for backward compatibility with components that haven't migrated yet
 */
export const isAuthenticated = (): boolean => {
  // This is a fallback for components that haven't migrated to useAuth yet
  // In practice, components should use the useAuth hook
  return false;
};

/**
 * Get current user
 * @deprecated Use useAuth hook from AuthContext instead
 */
export const getCurrentUser = (): User | null => {
  // This is a fallback for components that haven't migrated to useAuth yet
  // In practice, components should use the useAuth hook
  return null;
};

/**
 * Redirect authenticated users away from public routes
 * @deprecated Use useAuth hook from AuthContext instead
 */
export const shouldRedirectToDashboard = (): boolean => {
  return isAuthenticated();
};

