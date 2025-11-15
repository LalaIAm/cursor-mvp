import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/utils/auth';

/**
 * Auth context state
 */
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

/**
 * Auth context actions
 */
interface AuthContextType extends AuthState {
  setAuth: (user: User | null) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component
 * Manages global authentication state
 * TODO: Migrate to Redux Toolkit or Zustand when available
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  // Initialize auth state from session
  // In a real app, this would check with the backend to verify session validity
  useEffect(() => {
    // For now, we'll check if there's a user in memory
    // The actual session check will be done via API calls
    setAuthState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const setAuth = (user: User | null) => {
    setAuthState({
      isAuthenticated: !!user,
      user,
      isLoading: false,
    });
  };

  const clearAuth = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        setAuth,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

