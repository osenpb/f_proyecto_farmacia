import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { VentaService } from '../../services/venta.service';
import { VentaResponse } from '../../interfaces/venta.interface';

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [],
  templateUrl: './historial-ventas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialVentasComponent implements OnInit {
  private readonly ventaSvc = inject(VentaService);

  readonly ventas = signal<VentaResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly ventaExpandida = signal<number | null>(null);

  readonly totalRecaudado = computed(() =>
    this.ventas().reduce((acc, v) => acc + Number(v.total), 0)
  );

  readonly totalItems = computed(() =>
    this.ventas().reduce((acc, v) => acc + v.detalles.reduce((s, d) => s + d.cantidad, 0), 0)
  );

  ngOnInit(): void {
    this.ventaSvc.listarVentas().subscribe({
      next: data => { this.ventas.set(data); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar el historial de ventas.'); this.loading.set(false); },
    });
  }

  toggleDetalle(idVenta: number): void {
    this.ventaExpandida.update(v => (v === idVenta ? null : idVenta));
  }

  estaExpandida(idVenta: number): boolean {
    return this.ventaExpandida() === idVenta;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  formatMoneda(val: number | undefined | null): string {
    if (val == null) return 'S/ 0.00';
    return `S/ ${Number(val).toFixed(2)}`;
  }
}
