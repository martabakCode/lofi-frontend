import { Routes } from '@angular/router';
import { RoleListComponent } from './pages/role-list.component';
import { PermissionListComponent } from './pages/permission-list.component';

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    component: RoleListComponent
  },
  {
    path: 'permissions',
    component: PermissionListComponent
  }
];
