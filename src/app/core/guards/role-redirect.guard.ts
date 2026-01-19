import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROLES } from '../models/rbac.models';

export const roleRedirectGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const roles = authService.getUserRoles();

    // If user has no roles, they shouldn't be here (AuthGuard should have caught this usually, but safe to check)
    if (roles.length === 0) {
        return router.createUrlTree(['/auth/login']);
    }

    // Customer: Redirect to customer-specific dashboard
    if (roles.includes(ROLES.CUSTOMER)) {
        return router.createUrlTree(['/dashboard/customer']);
    }

    // Redirect other roles to their specific dashboards
    if (roles.some(r => r === ROLES.ADMIN || r === ROLES.SUPER_ADMIN)) {
        return router.createUrlTree(['/dashboard/admin']);
    } else if (roles.includes(ROLES.MARKETING)) {
        return router.createUrlTree(['/dashboard/review']);
    } else if (roles.includes(ROLES.BRANCH_MANAGER)) {
        return router.createUrlTree(['/dashboard/approval']);
    } else if (roles.includes(ROLES.BACK_OFFICE)) {
        return router.createUrlTree(['/dashboard/disbursement']);
    }

    // Default fallback: allow access (will show default dashboard view)
    return true;
};
