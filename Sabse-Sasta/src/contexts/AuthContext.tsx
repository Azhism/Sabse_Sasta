import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, profileAPI, setAuthToken, removeAuthToken, getToken } from '@/services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string, phone?: string, userType?: 'customer' | 'vendor') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Try to get user profile to verify token
          const userData = await profileAPI.get();
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.fullName || userData.name,
            phone: userData.phone,
            role: userData.role,
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          removeAuthToken();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    setAuthToken(response.token);
    setUser(response.user);
  };

  const register = async (email: string, password: string, fullName?: string, phone?: string, userType: 'customer' | 'vendor' = 'customer') => {
    const response = await authAPI.register({ email, password, fullName, phone, userType });
    setAuthToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const userData = await profileAPI.get();
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.fullName || userData.name,
        phone: userData.phone,
        role: userData.role,
      });
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

