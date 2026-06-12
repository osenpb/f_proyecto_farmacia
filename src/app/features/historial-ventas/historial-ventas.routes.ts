import { Routes } from '@angular/router';

export const HISTORIAL_VENTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./historial-ventas.component').then(m => m.HistorialVentasComponent),
  },
];
