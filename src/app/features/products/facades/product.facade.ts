import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ProductAdapter } from '../adapters/product.adapter';
import { ProductVM, ProductResponse, CreateProductRequest } from '../models/product.models';
import { Action } from 'rxjs/internal/scheduler/Action';
import { finalize, map, tap } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';

@Injectable({
    providedIn: 'root'
})
export class ProductFacade {
    private productService = inject(ProductService);
    private toastService = inject(ToastService);

    // State
    private productsSignal = signal<ProductVM[]>([]);
    private loadingSignal = signal<boolean>(false);
    private errorSignal = signal<string | null>(null);

    // Selectors
    products = computed(() => this.productsSignal());
    loading = computed(() => this.loadingSignal());
    error = computed(() => this.errorSignal());

    /**
     * FACADE PATTERN
     * Simplifies component interaction by hiding complex logic (API calls, data transformation).
     */
    loadProducts() {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        this.productService.getProducts()
            .pipe(
                finalize(() => this.loadingSignal.set(false)),
                map(res => ProductAdapter.toViewList(res))
            )
            .subscribe({
                next: (products) => this.productsSignal.set(products),
                error: (err) => {
                    this.errorSignal.set(err.message || 'Failed to load products');
                    if (err.status !== 400 && err.status !== 401 && err.status !== 403 && err.status !== 500) {
                        this.toastService.show('Failed to load products', 'error');
                    }
                }
            });
    }

    getProduct(id: string) {
        return this.productService.getProductById(id).pipe(
            map(dto => ProductAdapter.toView(dto)),
            tap({
                error: () => this.toastService.show('Failed to load product details', 'error')
            })
        );
    }

    saveProduct(request: CreateProductRequest) {
        this.loadingSignal.set(true);
        return this.productService.createProduct(request).pipe(
            tap({
                next: () => this.toastService.show('Product created successfully', 'success'),
                error: () => this.toastService.show('Failed to create product', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadProducts(); // Refresh list
            })
        );
    }

    updateProduct(id: string, request: Partial<CreateProductRequest>) {
        this.loadingSignal.set(true);
        return this.productService.updateProduct(id, request).pipe(
            tap({
                next: () => this.toastService.show('Product updated successfully', 'success'),
                error: () => this.toastService.show('Failed to update product', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadProducts(); // Refresh list
            })
        );
    }

    deleteProduct(id: string) {
        this.loadingSignal.set(true);
        return this.productService.deleteProduct(id).pipe(
            tap({
                next: () => this.toastService.show('Product deleted successfully', 'success'),
                error: () => this.toastService.show('Failed to delete product', 'error')
            }),
            finalize(() => {
                this.loadingSignal.set(false);
                this.loadProducts(); // Refresh list
            })
        );
    }
}
