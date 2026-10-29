import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthSession, EmployeeProfile, TenantContext } from '../types';
import { secureStorage } from '../services/storage/secureStorage';
import { apiClient } from '../services/api/client';

interface AuthContextType {
  session: AuthSession | null;
  employee: EmployeeProfile | null;
  tenant: TenantContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateEmployeeLocal: (updated: EmployeeProfile) => void;
  isMockMode: boolean;
  toggleMockMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMockMode, setIsMockMode] = useState<boolean>(apiClient.getIsDevMockMode());

  const loadSavedSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await secureStorage.getSession();
      if (saved) {
        setSession(saved);
      } else {
        // Auto-bootstrap demo session if in development mode so preview works immediately
        if (apiClient.getIsDevMockMode()) {
          const demoSession = await apiClient.login('zayd.ahmed@intelysol.com');
          await secureStorage.setSession(demoSession);
          setSession(demoSession);
        }
      }
    } catch (err) {
      console.warn('Session load warning:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSavedSession();

    const handleSessionExpired = () => {
      setSession(null);
    };

    window.addEventListener('intelysol:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('intelysol:session-expired', handleSessionExpired);
    };
  }, [loadSavedSession]);

  const login = async (identifier: string, password?: string) => {
    setIsLoading(true);
    try {
      const newSession = await apiClient.login(identifier, password);
      await secureStorage.setSession(newSession);
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!session) return;
    try {
      const updated = await apiClient.getProfile();
      const updatedSession: AuthSession = {
        ...session,
        employee: updated,
      };
      await secureStorage.setSession(updatedSession);
      setSession(updatedSession);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateEmployeeLocal = (updated: EmployeeProfile) => {
    if (!session) return;
    const updatedSession: AuthSession = {
      ...session,
      employee: updated,
    };
    secureStorage.setSession(updatedSession);
    setSession(updatedSession);
  };

  const toggleMockMode = (val: boolean) => {
    apiClient.setDevMockMode(val);
    setIsMockMode(val);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        employee: session?.employee || null,
        tenant: session?.tenant || null,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
        refreshProfile,
        updateEmployeeLocal,
        isMockMode,
        toggleMockMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
