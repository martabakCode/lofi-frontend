import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, Observable, tap } from 'rxjs';
import { RbacService, PermissionFilterParams } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Permission } from '../../../core/models/rbac.models';

export interface PermissionListState {
    items: Permission[];
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
 * PermissionFacade - Facade Pattern for Permission Management
 * Provides a simplified interface to the permission management subsystem
 * Handles state management and business logic
 */
@Injectable({
    providedIn: 'root'
})
export class PermissionFacade {
    private rbacService = inject(RbacService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    // State signals
    private state = signal<PermissionListState>({
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
     * Load permissions with pagination, sorting, and search
     */
    loadPermissions(): void {
        this.state.update(s => ({ ...s, loading: true, error: null }));

        const params: PermissionFilterParams = {
            page: this.state().pagination.page,
            pageSize: this.state().pagination.pageSize,
            sort: `${this.state().sort.field},${this.state().sort.direction}`,
            search: this.state().search || undefined
        };

        this.rbacService.getPermissions(params).pipe(
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
                const errorMsg = err.message || 'Failed to load permissions';
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
        this.loadPermissions();
    }

    /**
     * Set page size and reload
     */
    setPageSize(pageSize: number): void {
        this.state.update(s => ({
            ...s,
            pagination: { ...s.pagination, pageSize, page: 1 }
        }));
        this.loadPermissions();
    }

    /**
     * Set sort field and direction
     */
    setSort(field: string, direction: 'asc' | 'desc'): void {
        this.state.update(s => ({
            ...s,
            sort: { field, direction }
        }));
        this.loadPermissions();
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
        this.loadPermissions();
    }

    /**
     * Create a new permission
     */
    createPermission(permission: Partial<Permission>): Observable<Permission> {
        this.state.update(s => ({ ...s, loading: true }));

        return this.rbacService.createPermission(permission).pipe(
            tap({
                next: () => this.toastService.show('Permission created successfully', 'success'),
                error: () => this.toastService.show('Failed to create permission', 'error')
            }),
            finalize(() => {
                this.state.update(s => ({ ...s, loading: false }));
                this.loadPermissions();
            })
        );
    }

    /**
     * Update an existing permission
     */
    updatePermission(id: string, permission: Partial<Permission>): Observable<Permission> {
        this.state.update(s => ({ ...s, loading: true }));

        return this.rbacService.updatePermission(id, permission).pipe(
            tap({
                next: () => this.toastService.show('Permission updated successfully', 'success'),
                error: () => this.toastService.show('Failed to update permission', 'error')
            }),
            finalize(() => {
                this.state.update(s => ({ ...s, loading: false }));
                this.loadPermissions();
            })
        );
    }

    /**
     * Delete a permission
     */
    deletePermission(id: string): Observable<void> {
        return this.rbacService.deletePermission(id).pipe(
            tap({
                next: () => {
                    this.toastService.show('Permission deleted successfully', 'success');
                    this.loadPermissions();
                },
                error: () => this.toastService.show('Failed to delete permission', 'error')
            })
        );
    }

    /**
     * Export all permissions
     */
    exportPermissions(): Observable<Permission[]> {
        return this.rbacService.getAllPermissions();
    }

    /**
     * Get all permissions for dropdowns
     */
    getAllPermissions(): Observable<Permission[]> {
        return this.rbacService.getAllPermissions();
    }

    /**
     * Navigate back to roles list
     */
    backToRoles(): void {
        this.router.navigate(['/dashboard/roles']);
    }
}
