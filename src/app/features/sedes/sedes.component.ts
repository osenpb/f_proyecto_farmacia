import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { SedeService } from '../../services/sede.service';
import { SedeResponse } from '../../interfaces/sede.interface';

@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="section-title">Sedes</h1>
        <p class="text-sm text-gray-500 mt-0.5">Sedes registradas en el sistema</p>
      </div>
    </div>

    @if (error()) {
      <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{{ error() }}</div>
    }

    @if (loading()) {
      <div class="text-center py-12 text-gray-400">Cargando…</div>
    } @else if (sedes().length === 0) {
      <div class="text-center py-12 text-gray-400">No hay sedes registradas.</div>
    } @else {
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        @for (s of sedes(); track s.idSede) {
          <div class="card">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                {{ s.nombre.charAt(0) }}
              </div>
              <div>
                <p class="font-semibold text-gray-800">{{ s.nombre }}</p>
                <p class="text-xs text-gray-500">{{ s.direccion }}</p>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class SedesComponent {
  private readonly svc = inject(SedeService);

  readonly sedes = signal<SedeResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.svc.listar().subscribe({
      next: (data) => { this.sedes.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar sedes.'); this.loading.set(false); },
    });
  }
}
