export interface Cita {
  fila_original_excel: number;
  Paciente: string;
  Fecha: string;
  Hora: string;
  Odontologo: string;
  Actividad: string;
  Celular: string;
  Celular_valido: string;
}

export interface Cumpleanos {
  fila_original_excel: number;
  Paciente: string;
  Genero: string;
  Cumple: string;
  Mes: number;
  Dia: number;
  Celular: string;
  Celular_valido: string;
}

export interface User {
  email: string;
  name: string;
}