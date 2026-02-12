import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { BaseManagementComponent, TableColumn } from './base-management.component';
import { of, Observable } from 'rxjs';

interface TestItem {
    id: string;
    name: string;
    status: string;
}

interface TestFilters {
    search?: string;
    status?: string;
}

@Component({
    template: ''
})
class TestComponent extends BaseManagementComponent<TestItem, TestFilters> {
    loadItems(): void {
        this.items.set([{ id: '1', name: 'Test', status: 'Active' }]);
    }

    getTableColumns(): TableColumn<TestItem>[] {
        return [
            { field: 'name', header: 'Name', sortable: true },
            { field: 'status', header: 'Status', type: 'badge' }
        ];
    }

    getExportData(): Observable<TestItem[]> {
        return of([]);
    }
}

describe('BaseManagementComponent', () => {
    let component: TestComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: []
        });
        component = new TestComponent();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('initial state', () => {
        it('should have empty items initially', () => {
            expect(component.items()).toEqual([]);
        });

        it('should not be loading initially', () => {
            expect(component.loading()).toBe(false);
        });

        it('should have page 1 initially', () => {
            expect(component.currentPage()).toBe(1);
        });

        it('should have page size 10 initially', () => {
            expect(component.pageSize()).toBe(10);
        });
    });

    describe('pagination', () => {
        it('should change page', () => {
            component.onPageChange(2);
            expect(component.currentPage()).toBe(2);
        });

        it('should change page size and reset page', () => {
            component.onPageSizeChange(20);
            expect(component.pageSize()).toBe(20);
            expect(component.currentPage()).toBe(1);
        });
    });

    describe('sorting', () => {
        it('should change sort', () => {
            component.onSort({ field: 'name', direction: 'desc' });
            expect(component.sortField()).toBe('name');
            expect(component.sortDirection()).toBe('desc');
        });
    });

    describe('filters', () => {
        it('should set filters', () => {
            component.filters.set({ status: 'Active' });
            expect(component.hasActiveFilters()).toBe(true);
        });

        it('should clear filters', () => {
            component.filters.set({ status: 'Active' });
            component.clearFilters();
            expect(component.hasActiveFilters()).toBe(false);
        });
    });

    describe('modals', () => {
        it('should open detail modal', () => {
            const item: TestItem = { id: '1', name: 'Test', status: 'Active' };
            component.openDetailModal(item);
            expect(component.isDetailModalOpen()).toBe(true);
            expect(component.selectedItem()).toEqual(item);
        });

        it('should close detail modal', () => {
            component.closeDetailModal();
            expect(component.isDetailModalOpen()).toBe(false);
            expect(component.selectedItem()).toBeNull();
        });

        it('should open delete modal', () => {
            const item: TestItem = { id: '1', name: 'Test', status: 'Active' };
            component.openDeleteModal(item);
            expect(component.isDeleteModalOpen()).toBe(true);
            expect(component.itemToDelete()).toEqual(item);
        });

        it('should close delete modal', () => {
            component.closeDeleteModal();
            expect(component.isDeleteModalOpen()).toBe(false);
            expect(component.itemToDelete()).toBeNull();
        });
    });

    describe('helper methods', () => {
        it('should get nested value', () => {
            const obj = { a: { b: { c: 'value' } } };
            expect(component['getNestedValue'](obj, 'a.b.c')).toBe('value');
        });

        it('should escape CSV with comma', () => {
            const value = 'test,value';
            expect(component['escapeCSV'](value)).toBe('"test,value"');
        });

        it('should escape CSV with quote', () => {
            const value = 'test"value';
            expect(component['escapeCSV'](value)).toBe('"test""value"');
        });

        it('should get sort param', () => {
            component.sortField.set('name');
            component.sortDirection.set('desc');
            expect(component['getSortParam']()).toBe('name,desc');
        });
    });
});
