import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout/shell-layout.component').then(m => m.ShellLayoutComponent),
    children: [
      { path: 'dashboard',        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'medicamentos',     loadChildren: () => import('./features/medicamentos/medicamentos.routes').then(m => m.MEDICAMENTOS_ROUTES) },
      { path: 'inventario',       loadChildren: () => import('./features/inventario/inventario.routes').then(m => m.INVENTARIO_ROUTES) },
      { path: 'puesto-de-venta',  loadChildren: () => import('./features/puesto-de-venta/puesto-de-venta.routes').then(m => m.PUESTO_VENTA_ROUTES) },
      { path: 'historial-ventas', loadChildren: () => import('./features/historial-ventas/historial-ventas.routes').then(m => m.HISTORIAL_VENTAS_ROUTES) },
      { path: 'admin',            canActivate: [adminGuard], loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES) },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
