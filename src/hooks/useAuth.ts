import { useState, useEffect } from 'react';
import { User } from '../types';
import { apiService, getAuthToken, clearAuthToken } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      // Decode JWT to get user info (basic decode, in production use a proper JWT library)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = { 
          email: payload.email || 'Usuario', 
          name: payload.name || 'Usuario Altika' 
        };
        setUser(userData);
      } catch (error) {
        console.error('Error decoding token:', error);
        clearAuthToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await apiService.login(email, password);
      
      // Decode token to get user info
      const token = getAuthToken();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = { 
          email: payload.email || email, 
          name: payload.name || 'Usuario Altika' 
        };
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthToken();
  };

  return { user, login, logout, isLoading };
};