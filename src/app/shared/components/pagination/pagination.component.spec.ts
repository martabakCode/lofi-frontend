import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent, PaginationState } from './pagination.component';
import { FormsModule } from '@angular/forms';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PaginationComponent, FormsModule]
        });

        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('initialization', () => {
        it('should initialize with default values', () => {
            expect(component.currentPage()).toBe(1);
            expect(component.pageSize()).toBe(10);
            expect(component.totalItems()).toBe(0);
        });
    });

    describe('page navigation', () => {
        beforeEach(() => {
            component.totalItemsValue = 100;
            component.pageSizeValue = 10;
            fixture.detectChanges();
        });

        it('should go to next page', () => {
            component.goToNext();

            expect(component.currentPage()).toBe(2);
        });

        it('should go to previous page', () => {
            component.currentPageValue = 3;
            component.goToPrevious();

            expect(component.currentPage()).toBe(2);
        });

        it('should go to first page', () => {
            component.currentPageValue = 5;
            component.goToFirst();

            expect(component.currentPage()).toBe(1);
        });

        it('should go to last page', () => {
            component.goToLast();

            expect(component.currentPage()).toBe(10);
        });

        it('should not go below page 1', () => {
            component.currentPageValue = 1;
            component.goToPrevious();

            expect(component.currentPage()).toBe(1);
        });

        it('should not exceed total pages', () => {
            component.currentPageValue = 10;
            component.goToNext();

            expect(component.currentPage()).toBe(10);
        });
    });

    describe('page size change', () => {
        it('should change page size and reset to page 1', () => {
            component.currentPageValue = 5;
            component.totalItemsValue = 100;

            component.onPageSizeChange(20);

            expect(component.pageSize()).toBe(20);
            expect(component.currentPage()).toBe(1);
        });

        it('should emit page change event on size change', (done) => {
            component.totalItemsValue = 100;
            component.pageSizeValue = 10;

            component.pageChange.subscribe((page: number) => {
                expect(page).toBe(1);
                done();
            });

            component.onPageSizeChange(25);
        });
    });

    describe('item calculations', () => {
        it('should calculate start item correctly', () => {
            component.currentPageValue = 2;
            component.pageSizeValue = 10;

            expect(component.startItem()).toBe(11);
        });

        it('should calculate end item correctly', () => {
            component.currentPageValue = 2;
            component.pageSizeValue = 10;
            component.totalItemsValue = 25;

            expect(component.endItem()).toBe(20);
        });

        it('should calculate end item as total when on last page', () => {
            component.currentPageValue = 3;
            component.pageSizeValue = 10;
            component.totalItemsValue = 25;

            expect(component.endItem()).toBe(25);
        });

        it('should return 0 for start item when no items', () => {
            component.totalItemsValue = 0;

            expect(component.startItem()).toBe(0);
        });

        it('should return 0 for end item when no items', () => {
            component.totalItemsValue = 0;

            expect(component.endItem()).toBe(0);
        });
    });

    describe('total pages calculation', () => {
        it('should calculate total pages correctly', () => {
            component.totalItemsValue = 100;
            component.pageSizeValue = 10;

            expect(component.totalPages()).toBe(10);
        });

        it('should handle remainder pages', () => {
            component.totalItemsValue = 95;
            component.pageSizeValue = 10;

            expect(component.totalPages()).toBe(10);
        });

        it('should return 0 when no items', () => {
            component.totalItemsValue = 0;

            expect(component.totalPages()).toBe(0);
        });
    });

    describe('page change emission', () => {
        it('should emit page change on next', (done) => {
            component.totalItemsValue = 100;
            component.pageSizeValue = 10;

            component.pageChange.subscribe((page: number) => {
                expect(page).toBe(2);
                done();
            });

            component.goToNext();
        });

        it('should emit page change on go to page', (done) => {
            component.totalItemsValue = 100;
            component.pageSizeValue = 10;

            component.pageChange.subscribe((page: number) => {
                expect(page).toBe(5);
                done();
            });

            component.goToPage(5);
        });
    });

    describe('visible pages', () => {
        it('should return visible page numbers', () => {
            component.totalItemsValue = 100;
            component.pageSizeValue = 10;
            component.currentPageValue = 5;

            const pages = component.visiblePages();
            expect(pages.length).toBeGreaterThan(0);
            expect(pages).toContain(5);
        });
    });
});
