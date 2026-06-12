import { Routes } from '@angular/router';

export const PUESTO_VENTA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./puesto-de-venta.component').then(m => m.PuestoDeVentaComponent),
  },
];
