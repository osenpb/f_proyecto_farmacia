import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem { label: string; path: string; icon: string; }

const IC = {
  dashboard:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  medicamentos: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  stock:        'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M10 12v6m4-6v6',
  ventas:       'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
  historial:    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  notif:        'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  ordenes:      'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  reportes:     'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  usuarios:     'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  sedes:        'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
};

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  ROLE_ADMIN: [
    { label: 'Dashboard',        path: '/dashboard',        icon: IC.dashboard },
    { label: 'Usuarios',         path: '/admin',            icon: IC.usuarios },
    { label: 'Sedes',            path: '/sedes',            icon: IC.sedes },
    { label: 'Medicamentos',     path: '/medicamentos',     icon: IC.medicamentos },
    { label: 'Stock y Lotes',    path: '/inventario',       icon: IC.stock },
    { label: 'Notificaciones',   path: '/notificaciones',   icon: IC.notif },
    { label: 'Órdenes',          path: '/ordenes',          icon: IC.ordenes },
  ],
  ROLE_GESTOR: [
    { label: 'Dashboard',        path: '/dashboard',        icon: IC.dashboard },
    { label: 'Notificaciones',   path: '/notificaciones',   icon: IC.notif },
    { label: 'Órdenes',         path: '/ordenes',           icon: IC.ordenes },
    { label: 'Reportes',         path: '/reportes',         icon: IC.reportes },
  ],
  ROLE_FARMACEUTICO: [
    { label: 'Dashboard',        path: '/dashboard',        icon: IC.dashboard },
    { label: 'Medicamentos',     path: '/medicamentos',     icon: IC.medicamentos },
    { label: 'Stock y Lotes',    path: '/inventario',       icon: IC.stock },
    { label: 'Puesto de Venta',  path: '/puesto-de-venta',  icon: IC.ventas },
    { label: 'Historial Ventas', path: '/historial-ventas', icon: IC.historial },
    { label: 'Notificaciones',   path: '/notificaciones',   icon: IC.notif },
  ],
  ROLE_TRANSPORTISTA: [
    { label: 'Dashboard',        path: '/dashboard',        icon: IC.dashboard },
    { label: 'Órdenes',         path: '/ordenes',           icon: IC.ordenes },
  ],
};

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './shell-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellLayoutComponent {
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  readonly mobileMenuOpen = signal(false);

  readonly navItems = computed<NavItem[]>(() => {
    const rol = this.currentUser()?.rol;
    return (rol && NAV_BY_ROLE[rol]) ? NAV_BY_ROLE[rol] : [{ label: 'Dashboard', path: '/dashboard', icon: IC.dashboard }];
  });

  get userInitials(): string {
    const u = this.currentUser();
    if (!u) return '?';
    return `${u.nombre.charAt(0)}${u.apellido?.charAt(0) ?? ''}`.toUpperCase();
  }

  logout(): void { this.authService.logout(); }
}
