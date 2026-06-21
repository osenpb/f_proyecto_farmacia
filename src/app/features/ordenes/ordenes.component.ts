import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { GestorService } from '../../services/gestor.service';
import { SedeService } from '../../services/sede.service';
import { MedicamentoService } from '../../services/medicamento.service';
import { OrdenRequest, OrdenResponse, TipoOrden } from '../../interfaces/orden.interface';
import { SedeResponse } from '../../interfaces/sede.interface';
import { MedicamentoResponse } from '../../interfaces/medicamento.interface';

interface ItemForm { idMedicamento: number; cantidad: number; }

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
      @if (canCrear()) {
        <button (click)="openModal()" class="btn-primary">+ Nueva Orden</button>
      }
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

    <!-- Modal Nueva Orden -->
    @if (showModal()) {
      <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 class="font-semibold text-gray-800">Nueva Orden</h2>
            <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
          </div>

          <div class="px-6 py-4 space-y-4 overflow-y-auto">
            <!-- Tipo -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de orden</label>
              <select [value]="tipo()" (change)="tipo.set($any($event.target).value)"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="COMPRA">Compra</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="DEVOLUCION">Devolución</option>
              </select>
            </div>

            <!-- Sede destino (solo transferencia) -->
            @if (tipo() === 'TRANSFERENCIA') {
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Sede destino</label>
                <select [value]="idSedeDestino() ?? ''" (change)="idSedeDestino.set(+$any($event.target).value || null)"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Seleccionar sede…</option>
                  @for (s of sedes(); track s.idSede) {
                    <option [value]="s.idSede">{{ s.nombre }}</option>
                  }
                </select>
              </div>
            }

            <!-- Items -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Medicamentos</label>
              <div class="space-y-2">
                @for (item of items(); track $index; let i = $index) {
                  <div class="flex gap-2 items-center">
                    <select [value]="item.idMedicamento" (change)="setMedicamento(i, +$any($event.target).value)"
                            class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option [value]="0">Seleccionar medicamento…</option>
                      @for (m of medicamentos(); track m.idMedicamento) {
                        <option [value]="m.idMedicamento">{{ m.nombre }}</option>
                      }
                    </select>
                    <input type="number" min="1" [value]="item.cantidad"
                           (input)="setCantidad(i, +$any($event.target).value)"
                           class="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Cant." />
                    @if (items().length > 1) {
                      <button (click)="removeItem(i)"
                              class="text-red-400 hover:text-red-600 text-xl leading-none flex-shrink-0">&times;</button>
                    }
                  </div>
                }
              </div>
              <button (click)="addItem()" class="mt-2 text-sm text-blue-600 hover:underline">+ Agregar medicamento</button>
            </div>

            @if (modalError()) {
              <p class="text-sm text-red-600">{{ modalError() }}</p>
            }
          </div>

          <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 flex-shrink-0">
            <button (click)="closeModal()"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button (click)="submitOrden()" [disabled]="saving()"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {{ saving() ? 'Guardando…' : 'Crear Orden' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class OrdenesComponent {
  private readonly gestorSvc = inject(GestorService);
  private readonly authSvc = inject(AuthService);
  private readonly sedeSvc = inject(SedeService);
  private readonly medicamentoSvc = inject(MedicamentoService);

  readonly ordenes = signal<OrdenResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly showModal = signal(false);
  readonly saving = signal(false);
  readonly modalError = signal('');
  readonly tipo = signal<TipoOrden>('COMPRA');
  readonly idSedeDestino = signal<number | null>(null);
  readonly items = signal<ItemForm[]>([{ idMedicamento: 0, cantidad: 1 }]);
  readonly sedes = signal<SedeResponse[]>([]);
  readonly medicamentos = signal<MedicamentoResponse[]>([]);

  readonly isGestor = () => this.authSvc.currentUser()?.rol?.includes('GESTOR') ?? false;
  readonly canCrear = () => this.authSvc.currentUser()?.rol?.includes('ADMIN') ?? false;

  constructor() { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.gestorSvc.listarOrdenes().subscribe({
      next: (data) => { this.ordenes.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar órdenes.'); this.loading.set(false); },
    });
  }

  openModal(): void {
    this.tipo.set('COMPRA');
    this.idSedeDestino.set(null);
    this.items.set([{ idMedicamento: 0, cantidad: 1 }]);
    this.modalError.set('');
    this.showModal.set(true);
    if (this.sedes().length === 0) {
      this.sedeSvc.listar().subscribe(s => this.sedes.set(s));
    }
    if (this.medicamentos().length === 0) {
      this.medicamentoSvc.listar().subscribe(m => this.medicamentos.set(m));
    }
  }

  closeModal(): void { this.showModal.set(false); }

  addItem(): void { this.items.update(list => [...list, { idMedicamento: 0, cantidad: 1 }]); }

  removeItem(i: number): void { this.items.update(list => list.filter((_, idx) => idx !== i)); }

  setMedicamento(i: number, id: number): void {
    this.items.update(list => list.map((item, idx) => idx === i ? { ...item, idMedicamento: id } : item));
  }

  setCantidad(i: number, cantidad: number): void {
    this.items.update(list => list.map((item, idx) => idx === i ? { ...item, cantidad } : item));
  }

  submitOrden(): void {
    this.modalError.set('');
    const idSede = this.authSvc.currentUser()?.idSede;
    if (!idSede) { this.modalError.set('No se pudo obtener la sede del usuario.'); return; }

    const validItems = this.items().filter(it => it.idMedicamento > 0 && it.cantidad > 0);
    if (validItems.length === 0) { this.modalError.set('Agrega al menos un medicamento con cantidad válida.'); return; }

    if (this.tipo() === 'TRANSFERENCIA' && !this.idSedeDestino()) {
      this.modalError.set('Selecciona una sede destino para la transferencia.'); return;
    }

    const dto: OrdenRequest = {
      idSede,
      tipo: this.tipo(),
      items: validItems,
      ...(this.tipo() === 'TRANSFERENCIA' ? { idSedeDestino: this.idSedeDestino()! } : {}),
    };

    this.saving.set(true);
    this.gestorSvc.crearOrden(dto).subscribe({
      next: () => { this.saving.set(false); this.closeModal(); this.cargar(); },
      error: () => { this.saving.set(false); this.modalError.set('Error al crear la orden. Intenta nuevamente.'); },
    });
  }

  aprobar(id: number): void {
    this.gestorSvc.aprobarOrden(id).subscribe({ next: () => this.cargar() });
  }

  rechazar(id: number): void {
    this.gestorSvc.rechazarOrden(id).subscribe({ next: () => this.cargar() });
  }
}
