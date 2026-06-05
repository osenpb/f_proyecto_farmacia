import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StockEstadisticas, StockMedicamentoResponse } from '../../../interfaces/stock.interface';
import { MedicamentoResponse } from '../../../interfaces/medicamento.interface';
import { StockService } from '../../../services/stock.service';
import { MedicamentoService } from '../../../services/medicamento.service';
import { AuthService } from '../../../services/auth.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StockBadgeComponent } from '../../../shared/components/stock-badge/stock-badge.component';
import { LoteFormComponent } from '../components/lote-form/lote-form.component';

@Component({
  selector: 'app-inventario-page',
  standalone: true,
  imports: [ModalComponent, StockBadgeComponent, LoteFormComponent],
  templateUrl: './inventario-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventarioPageComponent {
  private readonly stockSvc = inject(StockService);
  private readonly medSvc = inject(MedicamentoService);
  private readonly authSvc = inject(AuthService);

  readonly stock = signal<StockMedicamentoResponse[]>([]);
  readonly estadisticas = signal<StockEstadisticas | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly showLoteModal = signal(false);
  readonly medSeleccionado = signal<MedicamentoResponse | null>(null);

  get idSede(): number { return this.authSvc.currentUser()?.idSede ?? 0; }

  constructor() { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');

    this.stockSvc.listar().subscribe({
      next: (data) => { this.stock.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar el inventario.'); this.loading.set(false); },
    });

    this.stockSvc.estadisticas().subscribe({
      next: (data) => this.estadisticas.set(data),
    });
  }

  abrirLoteModal(item: StockMedicamentoResponse): void {
    this.medSeleccionado.set({
      idMedicamento: item.idMedicamento,
      nombre: item.nombreMedicamento,
      descripcion: item.descripcion,
      stockTotal: item.stockTotal,
      idSede: item.idSede,
      nombreSede: item.nombreSede,
      direccionSede: '',
      cantidadLotes: item.cantidadLotes,
      bajoStock: item.estadoStock !== 'NORMAL',
    });
    this.showLoteModal.set(true);
  }

  cerrarLoteModal(): void { this.showLoteModal.set(false); this.medSeleccionado.set(null); }

  onLoteCreado(): void {
    this.cerrarLoteModal();
    this.cargar();
  }
}
