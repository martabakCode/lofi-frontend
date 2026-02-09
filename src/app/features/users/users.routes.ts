import { Routes } from '@angular/router';
import { UnsavedChangesGuard } from '../../shared/directives/unsaved-changes-guard/unsaved-changes-guard.directive';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-list.component').then(m => m.UserListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent),
    canDeactivate: [UnsavedChangesGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/user-detail/user-detail.component').then(m => m.UserDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/user-form/user-form.component').then(m => m.UserFormComponent),
    canDeactivate: [UnsavedChangesGuard]
  }
];
