import { Routes } from '@angular/router';

export const LOAN_ROUTES: Routes = [
    {
        path: 'review',
        loadComponent: () => import('./loan-review/loan-review.component').then(m => m.LoanReviewComponent)
    },
    {
        path: 'approval',
        loadComponent: () => import('./loan-approval/loan-approval.component').then(m => m.LoanApprovalComponent)
    },
    {
        path: '',
        redirectTo: 'review',
        pathMatch: 'full'
    }
];
