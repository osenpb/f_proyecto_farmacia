import { Routes } from '@angular/router';

export const MEDICAMENTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/medicamentos-page.component').then(m => m.MedicamentosPageComponent),
  },
];
