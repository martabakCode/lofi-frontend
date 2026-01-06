import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/user-list.component').then(m => m.UserListComponent)
  }
];
