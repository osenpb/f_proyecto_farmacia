import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/usuarios-page.component').then(m => m.UsuariosPageComponent),
  },
];
