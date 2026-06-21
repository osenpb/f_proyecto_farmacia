import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NotificacionService } from '../../services/notificacion.service';
import { NotificacionResponse } from '../../interfaces/notificacion.interface';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="section-title">Notificaciones</h1>
        <p class="text-sm text-gray-500 mt-0.5">Alertas de stock y caducidad</p>
      </div>
      <button (click)="generar()" [disabled]="loading()" class="btn-primary">
        Generar automáticas
      </button>
    </div>

    @if (error()) {
      <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{{ error() }}</div>
    }

    @if (loading()) {
      <div class="text-center py-12 text-gray-400">Cargando…</div>
    } @else if (notificaciones().length === 0) {
      <div class="text-center py-12 text-gray-400">No hay notificaciones.</div>
    } @else {
      <div class="space-y-3">
        @for (n of notificaciones(); track n.idNotificacion) {
          <div class="card flex gap-4 items-start">
            <span class="mt-0.5 text-lg" [class.text-yellow-500]="n.tipo === 'PROXIMO_CADUCAR'"
                                          [class.text-red-500]="n.tipo === 'BAJO_STOCK'">
              {{ n.tipo === 'BAJO_STOCK' ? '⚠' : '🕐' }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800">{{ n.mensaje }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ n.fecha | date:'dd/MM/yyyy HH:mm' }} · {{ n.nombreSede }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                  [class.bg-yellow-100]="n.estado === 'PENDIENTE'" [class.text-yellow-700]="n.estado === 'PENDIENTE'"
                  [class.bg-green-100]="n.estado === 'ATENDIDA'"   [class.text-green-700]="n.estado === 'ATENDIDA'">
              {{ n.estado }}
            </span>
          </div>
        }
      </div>
    }
  `,
})
export class NotificacionesComponent {
  private readonly svc = inject(NotificacionService);

  readonly notificaciones = signal<NotificacionResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.svc.listar().subscribe({
      next: (data) => { this.notificaciones.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar notificaciones.'); this.loading.set(false); },
    });
  }

  generar(): void {
    this.loading.set(true);
    this.svc.generarAutomaticas().subscribe({
      next: (data) => { this.notificaciones.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al generar notificaciones.'); this.loading.set(false); },
    });
  }
}
