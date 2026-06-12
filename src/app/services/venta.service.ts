import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/auth.interface';
import { VentaRequest, VentaResponse } from '../interfaces/venta.interface';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/ventas';

  procesarVenta(request: VentaRequest): Observable<VentaResponse> {
    return this.http.post<ApiResponse<VentaResponse>>(this.base, request).pipe(map(r => r.data));
  }

  listarVentas(): Observable<VentaResponse[]> {
    return this.http.get<ApiResponse<VentaResponse[]>>(this.base).pipe(map(r => r.data));
  }
}
