
import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { roleRedirectGuard } from '../../core/guards/role-redirect.guard';
import { ROLES } from '../../core/models/rbac.models';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleRedirectGuard]
  },
  {
    path: 'customer', // Customer Dashboard
    loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [roleGuard],
    data: { roles: [ROLES.CUSTOMER] }
  },
  {
    path: 'review', // Marketing Dashboard
    loadComponent: () => import('./pages/role-dashboards/marketing/marketing-dashboard.component').then(m => m.MarketingDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: [ROLES.MARKETING] }
  },
  {
    path: 'approval', // Branch Manager Dashboard
    loadComponent: () => import('./pages/role-dashboards/branch-manager/branch-manager-dashboard.component').then(m => m.BranchManagerDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: [ROLES.BRANCH_MANAGER] }
  },
  {
    path: 'disbursement', // Back Office Dashboard
    loadComponent: () => import('./pages/role-dashboards/back-office/back-office-dashboard.component').then(m => m.BackOfficeDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: [ROLES.BACK_OFFICE] }
  },
  {
    path: 'admin', // Admin Dashboard
    loadComponent: () => import('./pages/role-dashboards/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [roleGuard],
    data: { roles: [ROLES.ADMIN, ROLES.SUPER_ADMIN] }
  }
];

