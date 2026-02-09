import { Routes } from '@angular/router';
import { RoleListComponent } from './pages/role-list.component';
import { PermissionListComponent } from './pages/permission-list.component';

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    component: RoleListComponent
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/role-form/role-form.component').then(m => m.RoleFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/role-detail/role-detail.component').then(m => m.RoleDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/role-form/role-form.component').then(m => m.RoleFormComponent)
  },
  {
    path: 'permissions',
    component: PermissionListComponent
  },
  {
    path: 'permissions/new',
    loadComponent: () => import('./pages/permission-form/permission-form.component').then(m => m.PermissionFormComponent)
  },
  {
    path: 'permissions/:id/edit',
    loadComponent: () => import('./pages/permission-form/permission-form.component').then(m => m.PermissionFormComponent)
  }
];
