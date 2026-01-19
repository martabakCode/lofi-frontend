
import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROLES } from '../models/rbac.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Ensure user is authenticated first
    if (!authService.isAuthenticated()) {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }

    const requiredRoles = route.data['roles'] as string[];

    // If no roles are defined for the route, allow access (assuming auth is enough)
    if (!requiredRoles || requiredRoles.length === 0) {
        return true;
    }

    const user = authService.currentUser();

    // If user data is not loaded yet but we have a token, we might need to wait or rely on token parsing.
    // Since AuthService fetches user on init or login, it might be async. 
    // For simplicity, we assume if we have a user, we check. 
    // If we don't have a user but are authenticated, arguably we should wait or fail.
    // In this implementation, if user is missing but we have token, we might fail or redirect. 
    // ideally AuthService should expose a way to ensure user is loaded.

    if (!user) {
        // If we have a token but no user yet, it might be loading. 
        // For this strict implementation, we'll deny and redirect or show unauthorized.
        // A better approach would be to return an Observable that waits for user load.
        // Given the constraints and existing `auth.service.ts` simplicity, we'll simplify.
        // If the app is designed correctly, AuthService is initialized early.
        return false;
    }

    const hasRequiredRole = requiredRoles.some(role => authService.hasRole(role));

    if (hasRequiredRole) {
        return true;
    }

    // Role mismatch
    router.navigate(['/dashboard/unauthorized']); // Or some error page
    return false;
};
