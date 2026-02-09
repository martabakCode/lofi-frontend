import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, map, Observable, tap } from 'rxjs';
import { RbacService, RoleFilterParams } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../core/models/rbac.models';

export interface RoleListState {
    items: Role[];
    loading: boolean;
    error: string | null;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
    sort: {
        field: string;
        direction: 'asc' | 'desc';
    };
    search: string;
}

/**
 * RoleFacade - Facade Pattern for Role Management
 * Provides a simplified interface to the role management subsystem
 * Handles state management and business logic
 */
@Injectable({
    providedIn: 'root'
})
export class RoleFacade {
    private rbacService = inject(RbacService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    // State signals
    private state = signal<RoleListState>({
        items: [],
        loading: false,
        error: null,
        pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 1
        },
        sort: {
            field: 'name',
            direction: 'asc'
        },
        search: ''
    });

    // Selectors (computed signals)
    items = computed(() => this.state().items);
    loading = computed(() => this.state().loading);
    error = computed(() => this.state().error);
    pagination = computed(() => this.state().pagination);
    sort = computed(() => this.state().sort);
    search = computed(() => this.state().search);

    /**
     * Load roles with pagination, sorting, and search
     */
    loadRoles(): void {
        this.state.update(s => ({ ...s, loading: true, error: null }));

        const params: RoleFilterParams = {
            page: this.state().pagination.page,
            pageSize: this.state().pagination.pageSize,
            sort: `${this.state().sort.field},${this.state().sort.direction}`,
            search: this.state().search || undefined
        };

        this.rbacService.getRoles(params).pipe(
            finalize(() => this.state.update(s => ({ ...s, loading: false })))
        ).subscribe({
            next: (response) => {
                this.state.update(s => ({
                    ...s,
                    items: response.items,
                    pagination: {
                        page: response.page,
                        pageSize: response.pageSize,
                        total: response.total,
                        totalPages: response.totalPages
                    }
                }));
            },
            error: (err) => {
                const errorMsg = err.message || 'Failed to load roles';
                this.state.update(s => ({ ...s, error: errorMsg }));
                if (err.status !== 400 && err.status !== 401 && err.status !== 403) {
                    this.toastService.show(errorMsg, 'error');
                }
            }
        });
    }

    /**
     * Set page and reload
     */
    setPage(page: number): void {
        this.state.update(s => ({
            ...s,
            pagination: { ...s.pagination, page }
        }));
        this.loadRoles();
    }

    /**
     * Set page size and reload
     */
    setPageSize(pageSize: number): void {
        this.state.update(s => ({
            ...s,
            pagination: { ...s.pagination, pageSize, page: 1 }
        }));
        this.loadRoles();
    }

    /**
     * Set sort field and direction
     */
    setSort(field: string, direction: 'asc' | 'desc'): void {
        this.state.update(s => ({
            ...s,
            sort: { field, direction }
        }));
        this.loadRoles();
    }

    /**
     * Set search query
     */
    setSearch(search: string): void {
        this.state.update(s => ({
            ...s,
            search,
            pagination: { ...s.pagination, page: 1 }
        }));
        this.loadRoles();
    }

    /**
     * Get a single role by ID
     */
    getRole(id: string): Observable<Role> {
        return this.rbacService.getRoleById(id).pipe(
            tap({
                error: () => this.toastService.show('Failed to load role details', 'error')
            })
        );
    }

    /**
     * Create a new role
     */
    createRole(role: CreateRoleRequest): Observable<Role> {
        this.state.update(s => ({ ...s, loading: true }));

        return this.rbacService.createRole(role).pipe(
            tap({
                next: () => this.toastService.show('Role created successfully', 'success'),
                error: () => this.toastService.show('Failed to create role', 'error')
            }),
            finalize(() => {
                this.state.update(s => ({ ...s, loading: false }));
                this.loadRoles();
            })
        );
    }

    /**
     * Update an existing role
     */
    updateRole(id: string, role: UpdateRoleRequest): Observable<Role> {
        this.state.update(s => ({ ...s, loading: true }));

        return this.rbacService.updateRole(id, role).pipe(
            tap({
                next: () => this.toastService.show('Role updated successfully', 'success'),
                error: () => this.toastService.show('Failed to update role', 'error')
            }),
            finalize(() => {
                this.state.update(s => ({ ...s, loading: false }));
                this.loadRoles();
            })
        );
    }

    /**
     * Delete a role
     */
    deleteRole(id: string): Observable<void> {
        return this.rbacService.deleteRole(id).pipe(
            tap({
                next: () => {
                    this.toastService.show('Role deleted successfully', 'success');
                    this.loadRoles();
                },
                error: () => this.toastService.show('Failed to delete role', 'error')
            })
        );
    }

    /**
     * Export all roles
     */
    exportRoles(): Observable<Role[]> {
        return this.rbacService.getAllRoles();
    }

    /**
     * Navigate to role detail
     */
    viewRole(id: string): void {
        this.router.navigate(['/dashboard/roles', id]);
    }

    /**
     * Navigate to role edit
     */
    editRole(id: string): void {
        this.router.navigate(['/dashboard/roles', id, 'edit']);
    }

    /**
     * Navigate to create role
     */
    createNewRole(): void {
        this.router.navigate(['/dashboard/roles', 'new']);
    }

    /**
     * Navigate to permissions list
     */
    viewPermissions(): void {
        this.router.navigate(['/dashboard/roles', 'permissions']);
    }
}
