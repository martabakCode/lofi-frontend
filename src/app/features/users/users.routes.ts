import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent)
  }
];
