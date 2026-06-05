import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/auth.interface';
import { StockEstadisticas, StockMedicamentoResponse } from '../interfaces/stock.interface';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/stock';

  listar(): Observable<StockMedicamentoResponse[]> {
    return this.http.get<ApiResponse<StockMedicamentoResponse[]>>(this.base).pipe(map(r => r.data));
  }

  estadisticas(): Observable<StockEstadisticas> {
    return this.http.get<ApiResponse<StockEstadisticas>>(`${this.base}/estadisticas`).pipe(map(r => r.data));
  }
}
