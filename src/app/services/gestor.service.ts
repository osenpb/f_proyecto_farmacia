import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/auth.interface';
import { OrdenRequest, OrdenResponse } from '../interfaces/orden.interface';
import { NotificacionResponse } from '../interfaces/notificacion.interface';

@Injectable({ providedIn: 'root' })
export class GestorService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/gestor';

  listarOrdenes(): Observable<OrdenResponse[]> {
    return this.http.get<ApiResponse<OrdenResponse[]>>(`${this.base}/ordenes`).pipe(map(r => r.data));
  }

  crearOrden(dto: OrdenRequest): Observable<number> {
    return this.http.post<ApiResponse<number>>(`${this.base}/ordenes`, dto).pipe(map(r => r.data));
  }

  aprobarOrden(id: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.base}/ordenes/${id}/aprobar`, {}).pipe(map(() => undefined));
  }

  rechazarOrden(id: number): Observable<void> {
    return this.http.put<ApiResponse<void>>(`${this.base}/ordenes/${id}/rechazar`, {}).pipe(map(() => undefined));
  }

  eliminarOrden(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/ordenes/${id}`).pipe(map(() => undefined));
  }

  generarOrdenDesdeNotificacion(idNotificacion: number, cantidad: number): Observable<number> {
    return this.http.post<ApiResponse<number>>(
      `${this.base}/ordenes/generar?idNotificacion=${idNotificacion}&cantidad=${cantidad}`, {}
    ).pipe(map(r => r.data));
  }

  listarNotificaciones(): Observable<NotificacionResponse[]> {
    return this.http.get<ApiResponse<NotificacionResponse[]>>(`${this.base}/notificaciones`).pipe(map(r => r.data));
  }
}
