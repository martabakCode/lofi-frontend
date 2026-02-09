import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { finalize, map, Observable, tap } from 'rxjs';
import { RbacService, BranchFilterParams } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Branch } from '../../../core/models/rbac.models';

export interface BranchListState {
    items: Branch[];
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
 * BranchFacade - Facade Pattern for Branch Management
 * Provides a simplified interface to the branch management subsystem
 * Handles state management and business logic
 */
@Injectable({
    providedIn: 'root'
})
export class BranchFacade {
    private rbacService = inject(RbacService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    // State signals
    private state = signal<BranchListState>({
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
     * Load branches with pagination, sorting, and search
     */
    loadBranches(): void {
        this.state.update(s => ({ ...s, loading: true, error: null }));

        const params: BranchFilterParams = {
            page: this.state().pagination.page,
            pageSize: this.state().pagination.pageSize,
            sort: `${this.state().sort.field},${this.state().sort.direction}`,
            search: this.state().search || undefined
        };

        this.rbacService.getBranches(params).pipe(
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
                const errorMsg = err.message || 'Failed to load branches';
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
        this.loadBranches();
    }

    /**
     * Set page size and reload
     */
    setPageSize(pageSize: number): void {
        this.state.update(s => ({
            ...s,
            pagination: { ...s.pagination, pageSize, page: 1 }
        }));
        this.loadBranches();
    }

    /**
     * Set sort field and direction
     */
    setSort(field: string, direction: 'asc' | 'desc'): void {
        this.state.update(s => ({
            ...s,
            sort: { field, direction }
        }));
        this.loadBranches();
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
        this.loadBranches();
    }

    /**
     * Get a single branch by ID
     */
    getBranch(id: string): Observable<Branch> {
        return this.rbacService.getBranchById(id).pipe(
            tap({
                error: () => this.toastService.show('Failed to load branch details', 'error')
            })
        );
    }

    /**
     * Create a new branch
     */
    createBranch(branch: Partial<Branch>): Observable<Branch> {
        this.state.update(s => ({ ...s, loading: true }));

        return this.rbacService.createBranch(branch).pipe(
            tap({
                next: () => this.toastService.show('Branch created successfully', 'success'),
                error: () => this.toastService.show('Failed to create branch', 'error')
            }),
            finalize(() => {
                this.state.update(s => ({ ...s, loading: false }));
                this.loadBranches();
            })
        );
    }

    /**
     * Update an existing branch
     */
    updateBranch(id: string, branch: Partial<Branch>): Observable<Branch> {
        this.state.update(s => ({ ...s, loading: true }));

        return this.rbacService.updateBranch(id, branch).pipe(
            tap({
                next: () => this.toastService.show('Branch updated successfully', 'success'),
                error: () => this.toastService.show('Failed to update branch', 'error')
            }),
            finalize(() => {
                this.state.update(s => ({ ...s, loading: false }));
                this.loadBranches();
            })
        );
    }

    /**
     * Delete a branch
     */
    deleteBranch(id: string): Observable<void> {
        return this.rbacService.deleteBranch(id).pipe(
            tap({
                next: () => {
                    this.toastService.show('Branch deleted successfully', 'success');
                    this.loadBranches();
                },
                error: () => this.toastService.show('Failed to delete branch', 'error')
            })
        );
    }

    /**
     * Export all branches
     */
    exportBranches(): Observable<Branch[]> {
        return this.rbacService.getAllBranches();
    }

    /**
     * Navigate to branch detail
     */
    viewBranch(id: string): void {
        this.router.navigate(['/dashboard/branches', id]);
    }

    /**
     * Navigate to branch edit
     */
    editBranch(id: string): void {
        this.router.navigate(['/dashboard/branches', id, 'edit']);
    }

    /**
     * Navigate to create branch
     */
    createNewBranch(): void {
        this.router.navigate(['/dashboard/branches', 'new']);
    }
}
