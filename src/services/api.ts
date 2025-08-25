import { Cita, Cumpleanos } from '../types';

const API_BASE = 'https://intelety-n8n.uryun4.easypanel.host/webhook/altika';

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('altika_token', token);
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('altika_token');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('altika_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const apiService = {
  async login(email: string, password: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        throw new Error(`Error en login: ${response.status}`);
      }
      
      const data = await response.json();
      const token = data[0]?.token;
      
      if (!token) {
        throw new Error('Token no recibido del servidor');
      }
      
      setAuthToken(token);
      return token;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  async getCitas(): Promise<Cita[]> {
    try {
      const response = await fetch(`${API_BASE}/citas`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching citas: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching citas:', error);
      throw error;
    }
  },

  async getCumpleanos(): Promise<Cumpleanos[]> {
    try {
      const response = await fetch(`${API_BASE}/cumpleaños`, {
        headers: {
          ...getAuthHeaders(),
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching cumpleaños: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cumpleaños:', error);
      throw error;
    }
  }
};