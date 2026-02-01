import { Routes } from '@angular/router';

export const LOAN_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./loan-list/loan-list.component').then(m => m.LoanListComponent)
    },
    {
        path: 'review',
        loadComponent: () => import('./loan-review/loan-review.component').then(m => m.LoanReviewComponent)
    },
    {
        path: 'approval',
        loadComponent: () => import('./loan-approval/loan-approval.component').then(m => m.LoanApprovalComponent)
    },
    {
        path: 'apply',
        loadComponent: () => import('./marketing-loan-application/marketing-loan-application.component').then(m => m.MarketingLoanApplicationComponent)
    },
    {
        path: ':id',
        loadComponent: () => import('./loan-detail/loan-detail.component').then(m => m.LoanDetailComponent)
    }
];
