import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'completar-perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/auth/complete-profile.component').then(
        (m) => m.CompleteProfileComponent,
      ),
  },
  {
    path: 'quebec-city',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/properties/quebec-city/quebec-city.component').then(
        (m) => m.QuebecCityComponent,
      ),
  },
  {
    path: 'quebec-city/nueva',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/properties/property-form/property-form.component').then(
        (m) => m.PropertyFormComponent,
      ),
  },

  {
    path: 'propiedad/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/properties/property-detail/property-detail.component').then(
        (m) => m.PropertyDetailComponent,
      ),
  },
  {
    // Mismo formulario que el alta, en modo edición (precarga + update).
    path: 'propiedad/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/properties/property-form/property-form.component').then(
        (m) => m.PropertyFormComponent,
      ),
  },

  {
    path: 'escaner',
    canActivate: [roleGuard(['escaner', 'administrador'])],
    loadComponent: () =>
      import('./features/scanning/scanner-dashboard.component').then(
        (m) => m.ScannerDashboardComponent,
      ),
  },
  {
    path: 'admin',
    canActivate: [roleGuard(['administrador'])],
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },

  { path: '**', redirectTo: '' },
];
