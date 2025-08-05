import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { getUser, login as apiLogin , register as apiRegister} from '@/services/auth';
import { getToken, setToken } from '@/services/TokenService';

type User = {
  id: number;
  name: string;
  email: string;
  // Add any other user fields you expect
};

type LoginCredentials = {
  email: string;
  password: string;
  device_name: string;
};
type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  device_name: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  const login = async (credentials: LoginCredentials) => {
    await apiLogin(credentials);
    const userData = await getUser();
    setUser(userData);
  };

  const logout = async () => {
    await setToken(null);
    setUser(null);
  };
    
  const register = async (credentials: RegisterCredentials) => {
    await apiRegister(credentials);  // call register service
    const userData = await getUser();
    setUser(userData);
  };

  useEffect(() => {
    const init = async () => {
      const token = await getToken();
      if (token) {
        try {
          const userData = await getUser();
          setUser(userData);
        } catch (e) {
          console.log('Token invalid or expired:', e);
          await setToken(null);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
