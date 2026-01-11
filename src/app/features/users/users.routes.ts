import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: 'me',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: '',
    loadComponent: () => import('./pages/user-list.component').then(m => m.UserListComponent)
  }
];
