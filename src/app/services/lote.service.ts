import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/auth.interface';
import { LoteRequest, LoteResponse, LoteStockResponse } from '../interfaces/lote.interface';

@Injectable({ providedIn: 'root' })
export class LoteService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/lotes';

  listarStock(): Observable<LoteStockResponse[]> {
    return this.http.get<ApiResponse<LoteStockResponse[]>>(`${this.base}/stock`).pipe(map(r => r.data));
  }

  porMedicamento(idMedicamento: number): Observable<LoteResponse[]> {
    return this.http.get<ApiResponse<LoteResponse[]>>(`${this.base}/medicamento/${idMedicamento}`).pipe(map(r => r.data));
  }

  crear(dto: LoteRequest): Observable<LoteResponse> {
    return this.http.post<ApiResponse<LoteResponse>>(this.base, dto).pipe(map(r => r.data));
  }

  actualizar(id: number, dto: LoteRequest): Observable<LoteResponse> {
    return this.http.put<ApiResponse<LoteResponse>>(`${this.base}/${id}`, dto).pipe(map(r => r.data));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(map(() => undefined));
  }

  proximosCaducar(): Observable<LoteResponse[]> {
    return this.http.get<ApiResponse<LoteResponse[]>>(`${this.base}/proximos-caducar`).pipe(map(r => r.data));
  }
}
