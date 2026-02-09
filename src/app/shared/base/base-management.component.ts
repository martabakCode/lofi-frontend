import { Injectable, OnInit, signal, computed, WritableSignal, Signal, Directive } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

export interface TableColumn<T> {
    field: keyof T | string;
    header: string;
    sortable?: boolean;
    type?: 'text' | 'badge' | 'actions' | 'custom' | 'date' | 'boolean';
    width?: string;
    formatter?: (value: any, item: T) => string;
    badgeClass?: (value: any, item: T) => string;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface BaseFilterState {
    search?: string;
    [key: string]: any;
}

/**
 * Base Management Component (OCP - Open/Closed Principle)
 * Abstract base class for all list management views
 * Extend this class to create consistent list views across the application
 */
@Directive()
export abstract class BaseManagementComponent<T, F extends BaseFilterState = BaseFilterState> implements OnInit {
    // State signals
    items: WritableSignal<T[]> = signal<T[]>([]);
    loading: WritableSignal<boolean> = signal(false);
    error: WritableSignal<string | null> = signal(null);

    // Pagination
    currentPage: WritableSignal<number> = signal(1);
    pageSize: WritableSignal<number> = signal(10);
    totalItems: WritableSignal<number> = signal(0);
    totalPages: WritableSignal<number> = signal(1);

    // Sorting
    sortField: WritableSignal<string> = signal('id');
    sortDirection: WritableSignal<'asc' | 'desc'> = signal('asc');

    // Search
    searchQuery: WritableSignal<string> = signal('');
    private searchSubject = new Subject<string>();

    // Filters
    filters: WritableSignal<F> = signal({} as F);

    // Export
    isExporting: WritableSignal<boolean> = signal(false);

    // Modal states
    isDetailModalOpen: WritableSignal<boolean> = signal(false);
    selectedItem: WritableSignal<T | null> = signal(null);
    isDeleteModalOpen: WritableSignal<boolean> = signal(false);
    itemToDelete: WritableSignal<T | null> = signal(null);

    // Computed values
    hasActiveFilters: Signal<boolean> = computed(() => {
        const filterValues = this.filters();
        return Object.values(filterValues).some(value => value !== '' && value !== undefined && value !== null);
    });

    paginationState: Signal<PaginationState> = computed(() => ({
        page: this.currentPage(),
        pageSize: this.pageSize(),
        total: this.totalItems(),
        totalPages: this.totalPages()
    }));

    constructor() {
        // Setup search debounce
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntilDestroyed()
        ).subscribe(query => {
            this.searchQuery.set(query);
            this.currentPage.set(1);
            this.loadItems();
        });
    }

    ngOnInit(): void {
        this.loadItems();
        this.loadFilterOptions();
    }

    /**
     * Abstract method to load items - must be implemented by subclasses
     */
    abstract loadItems(): void;

    /**
     * Abstract method to get table columns configuration
     */
    abstract getTableColumns(): TableColumn<T>[];

    /**
     * Abstract method to get export data
     */
    abstract getExportData(): Observable<T[]>;

    /**
     * Load filter options (dropdowns, etc.) - override in subclasses if needed
     */
    loadFilterOptions(): void {
        // Override in subclasses to load filter dropdown data
    }

    /**
     * Handle search input with debounce
     */
    onSearch(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchSubject.next(value);
    }

    /**
     * Handle page change
     */
    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadItems();
    }

    /**
     * Handle page size change
     */
    onPageSizeChange(size: number): void {
        this.pageSize.set(size);
        this.currentPage.set(1);
        this.loadItems();
    }

    /**
     * Handle sort change
     */
    onSort(sortConfig: SortConfig): void {
        this.sortField.set(sortConfig.field);
        this.sortDirection.set(sortConfig.direction);
        this.loadItems();
    }

    /**
     * Handle filter change
     */
    onFilterChange(): void {
        this.currentPage.set(1);
        this.loadItems();
    }

    /**
     * Clear all filters
     */
    clearFilters(): void {
        this.filters.set({} as F);
        this.searchQuery.set('');
        this.currentPage.set(1);
        this.loadItems();
    }

    /**
     * Open detail modal
     */
    openDetailModal(item: T): void {
        this.selectedItem.set(item);
        this.isDetailModalOpen.set(true);
    }

    /**
     * Close detail modal
     */
    closeDetailModal(): void {
        this.isDetailModalOpen.set(false);
        this.selectedItem.set(null);
    }

    /**
     * Open delete confirmation modal
     */
    openDeleteModal(item: T): void {
        this.itemToDelete.set(item);
        this.isDeleteModalOpen.set(true);
    }

    /**
     * Close delete confirmation modal
     */
    closeDeleteModal(): void {
        this.isDeleteModalOpen.set(false);
        this.itemToDelete.set(null);
    }

    /**
     * Confirm delete - override in subclasses
     */
    confirmDelete(): void {
        // Override in subclasses to implement delete logic
        this.closeDeleteModal();
    }

    /**
     * Export data to CSV
     */
    exportData(filename: string = 'export'): void {
        this.isExporting.set(true);
        this.getExportData().subscribe({
            next: (data) => {
                this.downloadCSV(data, filename);
                this.isExporting.set(false);
            },
            error: () => {
                this.isExporting.set(false);
            }
        });
    }

    /**
     * Download data as CSV
     */
    protected downloadCSV(data: T[], filename: string): void {
        if (data.length === 0) return;

        const columns = this.getTableColumns().filter(col => col.type !== 'actions');
        const headers = columns.map(col => col.header);

        const rows = data.map(item => {
            return columns.map(col => {
                const value = this.getNestedValue(item, col.field as string);
                if (col.formatter) {
                    return col.formatter(value, item);
                }
                return this.escapeCSV(value);
            });
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    /**
     * Get nested object value by path
     */
    protected getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }

    /**
     * Escape CSV value
     */
    protected escapeCSV(value: any): string {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }

    /**
     * Get sort configuration for API
     */
    protected getSortParam(): string {
        return `${this.sortField()},${this.sortDirection()}`;
    }
}
