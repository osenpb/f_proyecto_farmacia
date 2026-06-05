export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  dni?: string;
  rolId?: number;
  sedeId?: number;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
  activo: boolean;
  rol: string;
  idSede: number;
  sede: string;
}

export interface AuthResponse {
  usuario: UsuarioResponse;
  token: string;
}

export interface ApiResponse<T> {
  data: T;
  mensaje?: string;
  success: boolean;
}
