import { ChangeDetectionStrategy, Component } from '@angular/core';

const BASE = 'http://localhost:8080/api/gestor/reportes';

const REPORTES = [
  { label: 'Stock por Sede',         url: `${BASE}/stock-sede/pdf` },
  { label: 'Stock por Medicamento',  url: `${BASE}/stock-medicamento/pdf` },
  { label: 'Notificaciones',         url: `${BASE}/notificaciones/pdf` },
  { label: 'Órdenes',                url: `${BASE}/ordenes/pdf` },
];

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="section-title">Reportes</h1>
        <p class="text-sm text-gray-500 mt-0.5">Descarga reportes en PDF</p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      @for (r of reportes; track r.label) {
        <a [href]="r.url" target="_blank" rel="noopener"
           class="card flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer no-underline">
          <div class="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span class="font-medium text-gray-800">{{ r.label }}</span>
        </a>
      }
    </div>
  `,
})
export class ReportesComponent {
  readonly reportes = REPORTES;
}
