import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductFacade } from '../facades/product.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('ProductListComponent', () => {
    let component: ProductListComponent;
    let fixture: ComponentFixture<ProductListComponent>;
    let productFacadeMock: jest.Mocked<ProductFacade>;

    beforeEach(() => {
        productFacadeMock = {
            products: signal([]),
            loading: signal(false),
            pagination: signal({ page: 1, pageSize: 10, total: 0, totalPages: 1 }),
            loadProducts: jest.fn()
        } as unknown as jest.Mocked<ProductFacade>;

        TestBed.configureTestingModule({
            imports: [ProductListComponent],
            providers: [
                provideRouter([]),
                { provide: ProductFacade, useValue: productFacadeMock }
            ]
        });
        fixture = TestBed.createComponent(ProductListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load products on init', () => {
        fixture.detectChanges();
        expect(productFacadeMock.loadProducts).toHaveBeenCalled();
    });
});
