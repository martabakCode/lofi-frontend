import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent, PaginationState } from './pagination.component';
import { FormsModule } from '@angular/forms';

describe('PaginationComponent', () => {
    let component: PaginationComponent;
    let fixture: ComponentFixture<PaginationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PaginationComponent, FormsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(PaginationComponent);
        component = fixture.componentInstance;
        // Set initial values
        component.totalItemsValue = 0;
        component.currentPageValue = 1;
        component.pageSizeValue = 10;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('page navigation', () => {
        it('should emit page change event on goToPage', () => {
            component.totalItemsValue = 100;
            component.currentPageValue = 1;
            component.pageSizeValue = 10;
            fixture.detectChanges();

            const spy = jest.spyOn(component.pageChange, 'emit');
            component.goToPage(2);
            expect(spy).toHaveBeenCalledWith(2);
            expect(component.currentPage()).toBe(2);
        });

        it('should go to first page', () => {
            component.totalItemsValue = 100;
            component.currentPageValue = 5;
            fixture.detectChanges();

            const spy = jest.spyOn(component.pageChange, 'emit');
            component.goToFirst();
            expect(spy).toHaveBeenCalledWith(1);
        });

        it('should go to last page', () => {
            component.totalItemsValue = 100; // total pages = 10
            component.currentPageValue = 1;
            fixture.detectChanges();

            const spy = jest.spyOn(component.pageChange, 'emit');
            component.goToLast();
            expect(spy).toHaveBeenCalledWith(10);
        });
    });

    describe('page size change', () => {
        it('should emit page size change event', () => {
            const spy = jest.spyOn(component.pageSizeChange, 'emit');
            component.onPageSizeChange(20);
            expect(spy).toHaveBeenCalledWith(20);
            expect(component.pageSize()).toBe(20);
            expect(component.currentPage()).toBe(1);
        });
    });

    describe('item calculations', () => {
        it('should calculate start item correctly', () => {
            component.totalItemsValue = 100;
            component.currentPageValue = 2;
            component.pageSizeValue = 10;
            fixture.detectChanges();

            expect(component.startItem()).toBe(11);
        });

        it('should calculate end item correctly', () => {
            component.totalItemsValue = 100;
            component.currentPageValue = 2;
            component.pageSizeValue = 10;
            fixture.detectChanges();

            expect(component.endItem()).toBe(20);
        });

        it('should calculate end item as total when on last page', () => {
            component.totalItemsValue = 25;
            component.currentPageValue = 3;
            component.pageSizeValue = 10;
            fixture.detectChanges();

            expect(component.endItem()).toBe(25);
        });

        it('should return 0 for start item when no items', () => {
            component.totalItemsValue = 0;
            fixture.detectChanges();

            expect(component.startItem()).toBe(0);
        });
    });

    describe('total pages calculation', () => {
        it('should calculate total pages correctly', () => {
            component.totalItemsValue = 100;
            component.pageSizeValue = 10;
            fixture.detectChanges();

            expect(component.totalPages()).toBe(10);
        });
    });

    describe('visible pages', () => {
        it('should return visible page numbers', () => {
            component.totalItemsValue = 100;
            component.pageSizeValue = 10;
            component.currentPageValue = 5;
            fixture.detectChanges();

            const pages = component.visiblePages();
            expect(pages.length).toBeGreaterThan(0);
            expect(pages).toContain(5);
        });
    });
});
