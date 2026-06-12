import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VentaService } from '../../services/venta.service';
import { MedicamentoService } from '../../services/medicamento.service';
import { LoteService } from '../../services/lote.service';
import { StockService } from '../../services/stock.service';
import { GestorService } from '../../services/gestor.service';
import { UsuarioService, AdminEstadisticas } from '../../services/usuario.service';
import { SedeService } from '../../services/sede.service';
import { VentaResponse } from '../../interfaces/venta.interface';
import { MedicamentoResponse } from '../../interfaces/medicamento.interface';
import { LoteResponse } from '../../interfaces/lote.interface';
import { StockEstadisticas, StockMedicamentoResponse } from '../../interfaces/stock.interface';
import { OrdenResponse } from '../../interfaces/orden.interface';
import { NotificacionResponse } from '../../interfaces/notificacion.interface';
import { UsuarioResponse } from '../../interfaces/auth.interface';
import { SedeResponse } from '../../interfaces/sede.interface';

interface StockSede { nombre: string; total: number; pct: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly authService  = inject(AuthService);
  private readonly ventaSvc     = inject(VentaService);
  private readonly medSvc       = inject(MedicamentoService);
  private readonly loteSvc      = inject(LoteService);
  private readonly stockSvc     = inject(StockService);
  private readonly gestorSvc    = inject(GestorService);
  private readonly usuarioSvc   = inject(UsuarioService);
  private readonly sedeSvc      = inject(SedeService);

  readonly currentUser = this.authService.currentUser;
  readonly loading = signal(true);

  // ── roles ─────────────────────────────────────────────────────────────
  readonly esFarmaceutico = computed(() => this.currentUser()?.rol === 'ROLE_FARMACEUTICO');
  readonly esGestor       = computed(() => this.currentUser()?.rol === 'ROLE_GESTOR');
  readonly esAdmin        = computed(() => this.currentUser()?.rol === 'ROLE_ADMIN');

  // ── FARMACÉUTICO ──────────────────────────────────────────────────────
  readonly ventas          = signal<VentaResponse[]>([]);
  readonly medicamentos    = signal<MedicamentoResponse[]>([]);
  readonly lotesCaducando  = signal<LoteResponse[]>([]);

  readonly ventasHoy = computed(() => {
    const hoy = new Date().toDateString();
    return this.ventas().filter(v => new Date(v.fecha).toDateString() === hoy);
  });
  readonly totalVentasHoy       = computed(() => this.ventasHoy().reduce((a, v) => a + Number(v.total), 0));
  readonly medicamentosBajoStock = computed(() => this.medicamentos().filter(m => m.bajoStock).length);
  readonly vencimientosCount    = computed(() => this.lotesCaducando().length);
  readonly ventasRecientes      = computed(() => this.ventas().slice(0, 3));
  readonly inventarioEstado     = computed(() =>
    this.medicamentos().slice(0, 5).map(m => ({ nombre: m.nombre, stock: m.stockTotal ?? 0, bajoStock: m.bajoStock }))
  );

  // ── GESTOR ────────────────────────────────────────────────────────────
  readonly ordenes        = signal<OrdenResponse[]>([]);
  readonly notificaciones = signal<NotificacionResponse[]>([]);
  readonly estadisticasStock = signal<StockEstadisticas | null>(null);

  readonly ordenesPendientes  = computed(() => this.ordenes().filter(o => o.estado === 'PENDIENTE').length);
  readonly stockCritico       = computed(() => this.estadisticasStock()?.critico ?? 0);
  readonly alertasRecientes   = computed(() => this.notificaciones().slice(0, 3));
  readonly ordenesRecientes   = computed(() => this.ordenes().slice(0, 3));

  // ── ADMIN ─────────────────────────────────────────────────────────────
  readonly adminStats     = signal<AdminEstadisticas | null>(null);
  readonly stockItems     = signal<StockMedicamentoResponse[]>([]);
  readonly usuarios       = signal<UsuarioResponse[]>([]);
  readonly sedes          = signal<SedeResponse[]>([]);

  readonly stockPorSede = computed<StockSede[]>(() => {
    const map = new Map<string, number>();
    for (const s of this.stockItems()) {
      map.set(s.nombreSede, (map.get(s.nombreSede) ?? 0) + s.stockTotal);
    }
    const entries = Array.from(map.entries()).map(([nombre, total]) => ({ nombre, total, pct: 0 }));
    const max = Math.max(...entries.map(e => e.total), 1);
    return entries.map(e => ({ ...e, pct: Math.round((e.total / max) * 100) }));
  });

  readonly usuariosRecientes = computed(() => this.usuarios().slice(0, 3));

  readonly fechaHoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  ngOnInit(): void {
    const rol = this.currentUser()?.rol;

    if (rol === 'ROLE_FARMACEUTICO') {
      this.ventaSvc.listarVentas().subscribe({ next: d => this.ventas.set(d), error: () => {} });
      this.medSvc.listar().subscribe({ next: d => this.medicamentos.set(d), error: () => {} });
      this.loteSvc.proximosCaducar().subscribe({
        next: d => { this.lotesCaducando.set(d); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else if (rol === 'ROLE_GESTOR') {
      this.gestorSvc.listarOrdenes().subscribe({ next: d => this.ordenes.set(d), error: () => {} });
      this.gestorSvc.listarNotificaciones().subscribe({ next: d => this.notificaciones.set(d), error: () => {} });
      this.stockSvc.estadisticas().subscribe({
        next: d => { this.estadisticasStock.set(d); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else if (rol === 'ROLE_ADMIN') {
      this.usuarioSvc.estadisticas().subscribe({ next: d => this.adminStats.set(d), error: () => {} });
      this.stockSvc.listar().subscribe({ next: d => this.stockItems.set(d), error: () => {} });
      this.stockSvc.estadisticas().subscribe({ next: d => this.estadisticasStock.set(d), error: () => {} });
      this.gestorSvc.listarNotificaciones().subscribe({ next: d => this.notificaciones.set(d), error: () => {} });
      this.usuarioSvc.listar().subscribe({ next: d => this.usuarios.set(d), error: () => {} });
      this.sedeSvc.listar().subscribe({
        next: d => { this.sedes.set(d); this.loading.set(false); },
        error: () => this.loading.set(false),
      });
    } else {
      this.loading.set(false);
    }
  }

  // ── helpers ───────────────────────────────────────────────────────────
  stockBarColor(bajoStock: boolean | undefined): string {
    return bajoStock ? 'bg-red-500' : 'bg-emerald-500';
  }
  stockBadgeClass(bajoStock: boolean | undefined): string {
    return bajoStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';
  }
  stockBarWidth(stock: number): string {
    return `${Math.min(Math.max((stock / 100) * 100, 4), 100)}%`;
  }
  formatMoneda(val: number | undefined | null): string {
    if (val == null || isNaN(Number(val))) return 'S/ 0.00';
    return `S/ ${Number(val).toFixed(2)}`;
  }
  formatFechaCorta(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' });
  }
  estadoOrdenClass(estado: string): string {
    const m: Record<string, string> = {
      PENDIENTE: 'bg-yellow-100 text-yellow-700',
      APROBADA:  'bg-blue-100 text-blue-700',
      COMPLETADA:'bg-emerald-100 text-emerald-700',
      RECHAZADA: 'bg-red-100 text-red-700',
    };
    return m[estado] ?? 'bg-gray-100 text-gray-600';
  }
  notifIconClass(tipo: string): string {
    if (tipo?.includes('STOCK'))    return 'bg-red-100 text-red-600';
    if (tipo?.includes('CADUCIDAD')) return 'bg-amber-100 text-amber-600';
    return 'bg-violet-100 text-violet-600';
  }
  notifUrgencyClass(tipo: string): string {
    if (tipo?.includes('STOCK'))    return 'text-red-600 bg-red-50';
    if (tipo?.includes('CADUCIDAD')) return 'text-amber-600 bg-amber-50';
    return 'text-violet-600 bg-violet-50';
  }
  notifUrgencyLabel(tipo: string): string {
    if (tipo?.includes('STOCK'))    return 'URGENTE';
    if (tipo?.includes('CADUCIDAD')) return 'ATENCIÓN';
    return 'INFORMATIVO';
  }
  rolLabel(rol: string): string {
    const m: Record<string, string> = {
      ROLE_ADMIN: 'Administrador', ROLE_GESTOR: 'Gestor',
      ROLE_FARMACEUTICO: 'Farmacéutico', ROLE_TRANSPORTISTA: 'Transportista',
    };
    return m[rol] ?? rol;
  }
}
