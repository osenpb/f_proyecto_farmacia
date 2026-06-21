import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { GestorService } from '../../services/gestor.service';
import { OrdenResponse } from '../../interfaces/orden.interface';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="section-title">Órdenes</h1>
        <p class="text-sm text-gray-500 mt-0.5">Gestión de órdenes de compra y transferencia</p>
      </div>
    </div>

    @if (error()) {
      <div class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{{ error() }}</div>
    }

    @if (loading()) {
      <div class="text-center py-12 text-gray-400">Cargando…</div>
    } @else if (ordenes().length === 0) {
      <div class="text-center py-12 text-gray-400">No hay órdenes registradas.</div>
    } @else {
      <div class="card overflow-hidden p-0">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-600">#</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Tipo</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Sede</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Usuario</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Fecha</th>
              <th class="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
              @if (isGestor()) {
                <th class="px-4 py-3 text-left font-medium text-gray-600">Acciones</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (o of ordenes(); track o.idOrden) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-gray-500">{{ o.idOrden }}</td>
                <td class="px-4 py-3 font-medium">{{ o.tipo }}</td>
                <td class="px-4 py-3">{{ o.nombreSede }}</td>
                <td class="px-4 py-3 text-gray-600">{{ o.nombreUsuario }}</td>
                <td class="px-4 py-3 text-gray-500">{{ o.fecha | date:'dd/MM/yyyy' }}</td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                        [class.bg-yellow-100]="o.estado === 'PENDIENTE'"   [class.text-yellow-700]="o.estado === 'PENDIENTE'"
                        [class.bg-blue-100]="o.estado === 'APROBADA'"      [class.text-blue-700]="o.estado === 'APROBADA'"
                        [class.bg-green-100]="o.estado === 'COMPLETADA'"   [class.text-green-700]="o.estado === 'COMPLETADA'"
                        [class.bg-red-100]="o.estado === 'RECHAZADA'"      [class.text-red-700]="o.estado === 'RECHAZADA'">
                    {{ o.estado }}
                  </span>
                </td>
                @if (isGestor()) {
                  <td class="px-4 py-3 flex gap-2">
                    @if (o.estado === 'PENDIENTE') {
                      <button (click)="aprobar(o.idOrden)" class="text-xs text-green-600 hover:underline">Aprobar</button>
                      <button (click)="rechazar(o.idOrden)" class="text-xs text-red-600 hover:underline">Rechazar</button>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class OrdenesComponent {
  private readonly gestorSvc = inject(GestorService);
  private readonly authSvc = inject(AuthService);

  readonly ordenes = signal<OrdenResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly isGestor = () => this.authSvc.currentUser()?.rol?.includes('GESTOR') ?? false;

  constructor() { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.gestorSvc.listarOrdenes().subscribe({
      next: (data) => { this.ordenes.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar órdenes.'); this.loading.set(false); },
    });
  }

  aprobar(id: number): void {
    this.gestorSvc.aprobarOrden(id).subscribe({ next: () => this.cargar() });
  }

  rechazar(id: number): void {
    this.gestorSvc.rechazarOrden(id).subscribe({ next: () => this.cargar() });
  }
}
