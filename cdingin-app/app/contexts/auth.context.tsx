import axios from 'axios';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthContextType, UserResponse } from '~/types/auth.type';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      // Panggil endpoint yang dilindungi untuk memeriksa status login
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/me`,
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, isLoading, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook untuk mempermudah penggunaan context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
