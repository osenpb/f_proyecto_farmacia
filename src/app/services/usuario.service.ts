import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, UsuarioResponse, RegisterRequest } from '../interfaces/auth.interface';

export interface AdminEstadisticas {
  usuariosActivos: number;
  totalUsuarios: number;
  totalSedes: number;
  ordenesPendientes: number;
  totalOrdenes: number;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/admin/usuarios';
  private readonly registerUrl = 'http://localhost:8080/api/auth/register';

  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(this.base).pipe(map(r => r.data));
  }

  estadisticas(): Observable<AdminEstadisticas> {
    return this.http.get<ApiResponse<AdminEstadisticas>>(`${this.base}/estadisticas`).pipe(map(r => r.data));
  }

  crear(dto: RegisterRequest): Observable<UsuarioResponse> {
    return this.http.post<ApiResponse<void>>(this.registerUrl, dto)
      .pipe(map(() => null as unknown as UsuarioResponse));
  }

  actualizar(email: string, dto: RegisterRequest): Observable<UsuarioResponse> {
    return this.http.put<ApiResponse<UsuarioResponse>>(`${this.base}/${email}`, dto).pipe(map(r => r.data));
  }

  eliminar(email: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${email}`).pipe(map(() => undefined));
  }

  listarPendientes(): Observable<UsuarioResponse[]> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(`${this.base}/pendientes`).pipe(map(r => r.data));
  }

  aprobar(email: string): Observable<UsuarioResponse> {
    return this.http.patch<ApiResponse<UsuarioResponse>>(`${this.base}/${email}/aprobar`, {}).pipe(map(r => r.data));
  }
}
