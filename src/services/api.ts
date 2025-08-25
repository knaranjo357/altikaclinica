import { Cita, Cumpleanos } from '../types';

const API_BASE = 'https://intelety-n8n.uryun4.easypanel.host/webhook/altika';

export const apiService = {
  async getCitas(): Promise<Cita[]> {
    try {
      const response = await fetch(`${API_BASE}/citas`);
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
      const response = await fetch(`${API_BASE}/cumpleaños`);
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