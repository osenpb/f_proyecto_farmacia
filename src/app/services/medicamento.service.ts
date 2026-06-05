import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/auth.interface';
import { MedicamentoRequest, MedicamentoResponse } from '../interfaces/medicamento.interface';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/medicamentos';

  listar(): Observable<MedicamentoResponse[]> {
    return this.http.get<ApiResponse<MedicamentoResponse[]>>(this.base).pipe(map(r => r.data));
  }

  buscar(nombre: string): Observable<MedicamentoResponse[]> {
    return this.http.get<ApiResponse<MedicamentoResponse[]>>(`${this.base}/buscar`, {
      params: new HttpParams().set('nombre', nombre),
    }).pipe(map(r => r.data));
  }

  obtener(id: number): Observable<MedicamentoResponse> {
    return this.http.get<ApiResponse<MedicamentoResponse>>(`${this.base}/${id}`).pipe(map(r => r.data));
  }

  crear(dto: MedicamentoRequest): Observable<MedicamentoResponse> {
    return this.http.post<ApiResponse<MedicamentoResponse>>(this.base, dto).pipe(map(r => r.data));
  }

  actualizar(id: number, dto: MedicamentoRequest): Observable<MedicamentoResponse> {
    return this.http.put<ApiResponse<MedicamentoResponse>>(`${this.base}/${id}`, dto).pipe(map(r => r.data));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(map(() => undefined));
  }
}
