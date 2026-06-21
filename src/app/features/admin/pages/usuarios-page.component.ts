import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { UsuarioResponse } from '../../../interfaces/auth.interface';
import { SedeResponse } from '../../../interfaces/sede.interface';
import { UsuarioService } from '../../../services/usuario.service';
import { SedeService } from '../../../services/sede.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { UsuarioFormComponent } from '../components/usuario-form/usuario-form.component';

type Tab = 'activos' | 'pendientes';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [ModalComponent, UsuarioFormComponent],
  templateUrl: './usuarios-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuariosPageComponent {
  private readonly svc = inject(UsuarioService);
  private readonly sedeSvc = inject(SedeService);

  readonly tab = signal<Tab>('activos');
  readonly activos = signal<UsuarioResponse[]>([]);
  readonly pendientes = signal<UsuarioResponse[]>([]);
  readonly sedes = signal<SedeResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  readonly showModal = signal(false);
  readonly editando = signal<UsuarioResponse | null>(null);
  readonly showConfirmDelete = signal(false);
  readonly pendingDeleteEmail = signal<string | null>(null);
  readonly procesandoEmail = signal<string | null>(null);

  constructor() {
    this.cargar();
    this.sedeSvc.listar().subscribe({ next: (s) => this.sedes.set(s) });
  }

  cargar(): void {
    this.loading.set(true);
    this.svc.listar().subscribe({
      next: (data) => { this.activos.set(data.filter(u => u.activo)); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar usuarios.'); this.loading.set(false); },
    });
    this.svc.listarPendientes().subscribe({
      next: (data) => this.pendientes.set(data),
    });
  }

  abrirCrear(): void { this.editando.set(null); this.showModal.set(true); }
  abrirEditar(u: UsuarioResponse): void { this.editando.set(u); this.showModal.set(true); }
  cerrarModal(): void { this.showModal.set(false); this.editando.set(null); }

  onSaved(u: UsuarioResponse): void {
    this.cerrarModal();
    if (u) {
      const lista = this.activos();
      const idx = lista.findIndex(x => x.email === u.email);
      this.activos.set(idx >= 0 ? lista.map(x => x.email === u.email ? u : x) : [u, ...lista]);
    } else {
      this.cargar();
    }
  }

  aprobar(email: string): void {
    this.procesandoEmail.set(email);
    this.svc.aprobar(email).subscribe({
      next: (u) => {
        this.pendientes.set(this.pendientes().filter(p => p.email !== email));
        this.activos.set([u, ...this.activos()]);
        this.procesandoEmail.set(null);
      },
      error: (err) => { this.error.set(err?.error?.mensaje ?? 'Error al aprobar.'); this.procesandoEmail.set(null); },
    });
  }

  rechazar(email: string): void {
    this.procesandoEmail.set(email);
    this.svc.eliminar(email).subscribe({
      next: () => { this.pendientes.set(this.pendientes().filter(p => p.email !== email)); this.procesandoEmail.set(null); },
      error: (err) => { this.error.set(err?.error?.mensaje ?? 'Error al rechazar.'); this.procesandoEmail.set(null); },
    });
  }

  confirmarEliminar(email: string): void { this.pendingDeleteEmail.set(email); this.showConfirmDelete.set(true); }
  cancelarEliminar(): void { this.pendingDeleteEmail.set(null); this.showConfirmDelete.set(false); }

  eliminar(): void {
    const email = this.pendingDeleteEmail();
    if (!email) return;
    this.procesandoEmail.set(email);
    this.showConfirmDelete.set(false);
    this.svc.eliminar(email).subscribe({
      next: () => { this.activos.set(this.activos().filter(u => u.email !== email)); this.procesandoEmail.set(null); },
      error: (err) => { this.error.set(err?.error?.mensaje ?? 'Error al eliminar.'); this.procesandoEmail.set(null); },
    });
  }

  rolLabel(rol: string): string { return rol?.replace('ROLE_', '').replace(/_/g, ' ') ?? '—'; }
}
