import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, forkJoin, map, Observable, of, tap } from 'rxjs';
import { RbacService, UserFilterParams } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { User, Branch, Role } from '../../../core/models/rbac.models';

export interface UserListState {
    items: User[];
    branches: Branch[];
    roles: Role[];
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
    filters: {
        search: string;
        role: string;
        branch: string;
        status: string;
    };
}

/**
 * UserFacade - Facade Pattern for User Management
 * Provides a simplified interface to the user management subsystem
 * Handles state management and business logic
 */
@Injectable({
    providedIn: 'root'
})
export class UserFacade {
    private rbacService = inject(RbacService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    // State signals
    private state = signal<UserListState>({
        items: [],
        branches: [],
        roles: [],
        loading: false,
        error: null,
        pagination: {
            page: 1,
            pageSize: 10,
            total: 0,
            totalPages: 1
        },
        sort: {
            field: 'fullName',
            direction: 'asc'
        },
        filters: {
            search: '',
            role: '',
            branch: '',
            status: ''
        }
    });

    // Selectors (computed signals)
    items = computed(() => this.state().items);
    branches = computed(() => this.state().branches);
    roles = computed(() => this.state().roles);
    loading = computed(() => this.state().loading);
    error = computed(() => this.state().error);
    pagination = computed(() => this.state().pagination);
    sort = computed(() => this.state().sort);
    filters = computed(() => this.state().filters);

    // Computed filter options
    hasActiveFilters = computed(() => {
        const f = this.state().filters;
        return !!(f.search || f.role || f.branch || f.status);
    });

    activeUserCount = computed(() =>
        this.state().items.filter(u => u.status === 'Active').length
    );

    inactiveUserCount = computed(() =>
        this.state().items.filter(u => u.status === 'Inactive').length
    );

    /**
     * Load users with pagination, sorting, and filters
     */
    loadUsers(): void {
        this.state.update(s => ({ ...s, loading: true, error: null }));

        const params: UserFilterParams = {
            page: this.state().pagination.page,
            pageSize: this.state().pagination.pageSize,
            sort: `${this.state().sort.field},${this.state().sort.direction}`,
            search: this.state().filters.search || undefined,
            role: this.state().filters.role || undefined,
            branch: this.state().filters.branch || undefined,
            status: this.state().filters.status || undefined
        };

        this.rbacService.getUsers(params).pipe(
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
                const errorMsg = err.message || 'Failed to load users';
                this.state.update(s => ({ ...s, error: errorMsg }));
                if (err.status !== 400 && err.status !== 401 && err.status !== 403) {
                    this.toastService.show(errorMsg, 'error');
                }
            }
        });
    }

    /**
     * Load filter options (branches and roles)
     */
    loadFilterOptions(): void {
        forkJoin({
            branches: this.rbacService.getAllBranches(),
            roles: this.rbacService.getAllRoles()
        }).subscribe({
            next: (data) => {
                this.state.update(s => ({
                    ...s,
                    branches: data.branches,
                    roles: data.roles
                }));
            },
            error: () => {
                this.toastService.show('Failed to load filter data', 'error');
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
        this.loadUsers();
    }

    /**
     * Set page size and reload
     */
    setPageSize(pageSize: number): void {
        this.state.update(s => ({
            ...s,
            pagination: { ...s.pagination, pageSize, page: 1 }
        }));
        this.loadUsers();
    }

    /**
     * Set sort field and direction
     */
    setSort(field: string, direction: 'asc' | 'desc'): void {
        this.state.update(s => ({
            ...s,
            sort: { field, direction }
        }));
        this.loadUsers();
    }

    /**
     * Set search query
     */
    setSearch(search: string): void {
        this.state.update(s => ({
            ...s,
            filters: { ...s.filters, search },
            pagination: { ...s.pagination, page: 1 }
        }));
        this.loadUsers();
    }

    /**
     * Set filter value
     */
    setFilter(key: keyof UserListState['filters'], value: string): void {
        this.state.update(s => ({
            ...s,
            filters: { ...s.filters, [key]: value },
            pagination: { ...s.pagination, page: 1 }
        }));
        this.loadUsers();
    }

    /**
     * Clear all filters
     */
    clearFilters(): void {
        this.state.update(s => ({
            ...s,
            filters: {
                search: '',
                role: '',
                branch: '',
                status: ''
            },
            pagination: { ...s.pagination, page: 1 }
        }));
        this.loadUsers();
    }

    /**
     * Get a single user by ID
     */
    getUser(id: string): Observable<User> {
        return this.rbacService.getUserById(id).pipe(
            tap({
                error: () => this.toastService.show('Failed to load user details', 'error')
            })
        );
    }

    /**
     * Create a new user
     */
    createUser(user: Partial<User>): Observable<User> {
        this.state.update(s => ({ ...s, loading: true }));

        return this.rbacService.createUser(user).pipe(
            tap({
                next: () => this.toastService.show('User created successfully', 'success'),
                error: () => this.toastService.show('Failed to create user', 'error')
            }),
            finalize(() => {
                this.state.update(s => ({ ...s, loading: false }));
                this.loadUsers();
            })
        );
    }

    /**
     * Update an existing user
     */
    updateUser(id: string, user: Partial<User>): Observable<User> {
        this.state.update(s => ({ ...s, loading: true }));

        return this.rbacService.updateUser(id, user).pipe(
            tap({
                next: () => this.toastService.show('User updated successfully', 'success'),
                error: () => this.toastService.show('Failed to update user', 'error')
            }),
            finalize(() => {
                this.state.update(s => ({ ...s, loading: false }));
                this.loadUsers();
            })
        );
    }

    /**
     * Delete a user
     */
    deleteUser(id: string): Observable<void> {
        return this.rbacService.deleteUser(id).pipe(
            tap({
                next: () => {
                    this.toastService.show('User deleted successfully', 'success');
                    this.loadUsers();
                },
                error: () => this.toastService.show('Failed to delete user', 'error')
            })
        );
    }

    /**
     * Export all users
     */
    exportUsers(): Observable<User[]> {
        return this.rbacService.getUsers({
            pageSize: 1000
        }).pipe(
            map(response => response.items)
        );
    }

    /**
     * Navigate to user detail
     */
    viewUser(id: string): void {
        this.router.navigate(['/dashboard/users', id]);
    }

    /**
     * Navigate to user edit
     */
    editUser(id: string): void {
        this.router.navigate(['/dashboard/users', id, 'edit']);
    }

    /**
     * Navigate to create user
     */
    createNewUser(): void {
        this.router.navigate(['/dashboard/users', 'new']);
    }
}
