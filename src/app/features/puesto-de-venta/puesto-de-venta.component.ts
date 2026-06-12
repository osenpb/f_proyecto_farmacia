import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MedicamentoService } from '../../services/medicamento.service';
import { VentaService } from '../../services/venta.service';
import { MedicamentoResponse } from '../../interfaces/medicamento.interface';
import { CartItem } from '../../interfaces/venta.interface';

@Component({
  selector: 'app-puesto-de-venta',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './puesto-de-venta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PuestoDeVentaComponent implements OnInit {
  private readonly medicamentoSvc = inject(MedicamentoService);
  private readonly ventaSvc = inject(VentaService);

  readonly medicamentos = signal<MedicamentoResponse[]>([]);
  readonly carrito = signal<CartItem[]>([]);
  readonly busqueda = signal('');
  readonly cantidades = signal<Record<number, number>>({});
  readonly loading = signal(true);
  readonly procesando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');

  readonly medicamentosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    return q
      ? this.medicamentos().filter(m => m.nombre.toLowerCase().includes(q))
      : this.medicamentos();
  });

  readonly totalCarrito = computed(() =>
    this.carrito().reduce((acc, item) => acc + item.subtotal, 0)
  );

  ngOnInit(): void {
    this.medicamentoSvc.listar().subscribe({
      next: data => {
        this.medicamentos.set(data.filter(m => m != null && m.idMedicamento != null && m.stockTotal > 0));
        const cantInit: Record<number, number> = {};
        data.forEach(m => { cantInit[m.idMedicamento] = 1; });
        this.cantidades.set(cantInit);
        this.loading.set(false);
      },
      error: () => { this.error.set('Error al cargar medicamentos.'); this.loading.set(false); },
    });
  }

  getCantidad(idMedicamento: number): number {
    return this.cantidades()[idMedicamento] ?? 1;
  }

  setCantidad(idMedicamento: number, valor: number): void {
    const med = this.medicamentos().find(m => m.idMedicamento === idMedicamento);
    const max = med?.stockTotal ?? 999;
    const clamped = Math.max(1, Math.min(valor, max));
    this.cantidades.update(prev => ({ ...prev, [idMedicamento]: clamped }));
  }

  agregarAlCarrito(med: MedicamentoResponse): void {
    const cantidad = this.getCantidad(med.idMedicamento);
    const precio = med.precioVenta ?? 0;
    const carritoActual = this.carrito();
    const idx = carritoActual.findIndex(i => i.idMedicamento === med.idMedicamento);

    if (idx >= 0) {
      const nuevaCantidad = carritoActual[idx].cantidad + cantidad;
      const max = med.stockTotal;
      if (nuevaCantidad > max) {
        this.error.set(`Stock máximo disponible para ${med.nombre}: ${max} unidades.`);
        setTimeout(() => this.error.set(''), 3000);
        return;
      }
      this.carrito.update(items =>
        items.map((item, i) => i === idx
          ? { ...item, cantidad: nuevaCantidad, subtotal: nuevaCantidad * item.precioUnitario }
          : item
        )
      );
    } else {
      this.carrito.update(items => [...items, {
        idMedicamento: med.idMedicamento,
        nombre: med.nombre,
        cantidad,
        precioUnitario: precio,
        subtotal: cantidad * precio,
        stockMax: med.stockTotal,
      }]);
    }

    this.setCantidad(med.idMedicamento, 1);
  }

  quitarDelCarrito(idMedicamento: number): void {
    this.carrito.update(items => items.filter(i => i.idMedicamento !== idMedicamento));
  }

  cancelarVenta(): void {
    this.carrito.set([]);
    this.error.set('');
    this.exito.set('');
  }

  completarVenta(): void {
    if (this.carrito().length === 0) return;
    this.procesando.set(true);
    this.error.set('');
    this.exito.set('');

    const request = {
      items: this.carrito().map(item => ({
        idMedicamento: item.idMedicamento,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
      })),
    };

    this.ventaSvc.procesarVenta(request).subscribe({
      next: venta => {
        this.exito.set(`Venta #${venta.idVenta} completada por S/ ${venta.total.toFixed(2)}`);
        this.carrito.set([]);
        this.procesando.set(false);
        // Recargar stock actualizado
        this.medicamentoSvc.listar().subscribe(data => {
          this.medicamentos.set(data.filter(m => m.stockTotal > 0));
        });
      },
      error: err => {
        this.error.set(err?.error?.mensaje ?? 'Error al procesar la venta.');
        this.procesando.set(false);
      },
    });
  }

  formatCurrency(val: number | undefined | null): string {
    if (val == null || isNaN(Number(val))) return 'S/ 0.00';
    return `S/ ${Number(val).toFixed(2)}`;
  }

  stockClass(stock: number | undefined | null): string {
    if (!stock || stock <= 5) return 'bg-red-100 text-red-700';
    if (stock <= 20) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  }
}
