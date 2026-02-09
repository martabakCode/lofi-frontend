import { Routes } from '@angular/router';
import { BranchListComponent } from './pages/branch-list.component';

export const BRANCH_ROUTES: Routes = [
  {
    path: '',
    component: BranchListComponent
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/branch-form/branch-form.component').then(m => m.BranchFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/branch-detail/branch-detail.component').then(m => m.BranchDetailComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/branch-form/branch-form.component').then(m => m.BranchFormComponent)
  }
];
