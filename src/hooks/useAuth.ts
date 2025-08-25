import { useState, useEffect } from 'react';
import { User } from '../types';

const ADMIN_CREDENTIALS = {
  email: 'admin@altika.com',
  password: 'xactus'
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('altika_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const userData = { email, name: 'Administrador Altika' };
      setUser(userData);
      localStorage.setItem('altika_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('altika_user');
  };

  return { user, login, logout, isLoading };
};