import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../models/database.types';

/**
 * Guard por rol. Uso en las rutas:
 *   canActivate: [roleGuard(['escaner', 'administrador'])]
 * Sin sesión -> /auth. Con sesión pero sin rol permitido -> /quebec-city.
 */
export function roleGuard(allowed: UserRole[]): CanActivateFn {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    await auth.whenReady();

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/auth']);
    }

    const role = auth.role();
    return role && allowed.includes(role)
      ? true
      : router.createUrlTree(['/quebec-city']);
  };
}
