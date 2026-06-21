import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/auth.interface';
import { NotificacionResponse } from '../interfaces/notificacion.interface';

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/notificaciones';

  listar(): Observable<NotificacionResponse[]> {
    return this.http.get<ApiResponse<NotificacionResponse[]>>(this.base).pipe(map(r => r.data));
  }

  pendientes(): Observable<NotificacionResponse[]> {
    return this.http.get<ApiResponse<NotificacionResponse[]>>(`${this.base}/pendientes`).pipe(map(r => r.data));
  }

  generarAutomaticas(): Observable<NotificacionResponse[]> {
    return this.http.post<ApiResponse<NotificacionResponse[]>>(`${this.base}/generar-automaticas`, {}).pipe(map(r => r.data));
  }
}
