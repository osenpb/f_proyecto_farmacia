import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const adminGestorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rol = auth.currentUser()?.rol ?? '';
  return rol.includes('ADMIN') || rol.includes('GESTOR')
    ? true
    : router.createUrlTree(['/dashboard']);
};
