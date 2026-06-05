import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicamentoResponse } from '../../../interfaces/medicamento.interface';
import { MedicamentoService } from '../../../services/medicamento.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { StockBadgeComponent } from '../../../shared/components/stock-badge/stock-badge.component';
import { MedicamentoFormComponent } from '../components/medicamento-form/medicamento-form.component';

@Component({
  selector: 'app-medicamentos-page',
  standalone: true,
  imports: [FormsModule, ModalComponent, StockBadgeComponent, MedicamentoFormComponent],
  templateUrl: './medicamentos-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicamentosPageComponent {
  private readonly svc = inject(MedicamentoService);

  readonly medicamentos = signal<MedicamentoResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly showModal = signal(false);
  readonly editando = signal<MedicamentoResponse | null>(null);
  readonly eliminandoId = signal<number | null>(null);
  readonly showConfirmDelete = signal(false);
  readonly pendingDeleteId = signal<number | null>(null);

  constructor() { this.cargar(); }

  cargar(): void {
    this.loading.set(true);
    this.error.set('');
    this.svc.listar().subscribe({
      next: (data) => { this.medicamentos.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar medicamentos.'); this.loading.set(false); },
    });
  }

  buscar(): void {
    const q = this.busqueda().trim();
    if (!q) { this.cargar(); return; }
    this.loading.set(true);
    this.svc.buscar(q).subscribe({
      next: (data) => { this.medicamentos.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al buscar.'); this.loading.set(false); },
    });
  }

  abrirCrear(): void { this.editando.set(null); this.showModal.set(true); }

  abrirEditar(med: MedicamentoResponse): void { this.editando.set(med); this.showModal.set(true); }

  cerrarModal(): void { this.showModal.set(false); this.editando.set(null); }

  onSaved(med: MedicamentoResponse): void {
    const lista = this.medicamentos();
    const idx = lista.findIndex(m => m.idMedicamento === med.idMedicamento);
    this.medicamentos.set(idx >= 0
      ? lista.map(m => m.idMedicamento === med.idMedicamento ? med : m)
      : [med, ...lista]
    );
    this.cerrarModal();
  }

  confirmarEliminar(id: number): void { this.pendingDeleteId.set(id); this.showConfirmDelete.set(true); }

  cancelarEliminar(): void { this.pendingDeleteId.set(null); this.showConfirmDelete.set(false); }

  eliminar(): void {
    const id = this.pendingDeleteId();
    if (id === null) return;
    this.eliminandoId.set(id);
    this.showConfirmDelete.set(false);
    this.svc.eliminar(id).subscribe({
      next: () => {
        this.medicamentos.set(this.medicamentos().filter(m => m.idMedicamento !== id));
        this.eliminandoId.set(null);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'Error al eliminar.');
        this.eliminandoId.set(null);
      },
    });
  }

  limpiarBusqueda(): void { this.busqueda.set(''); this.cargar(); }
}
