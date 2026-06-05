import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/auth.interface';
import { SedeResponse } from '../interfaces/sede.interface';

@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly http = inject(HttpClient);
  private readonly base = 'http://localhost:8080/api/sedes';

  listar(): Observable<SedeResponse[]> {
    return this.http.get<ApiResponse<SedeResponse[]>>(this.base).pipe(map(r => r.data));
  }
}
