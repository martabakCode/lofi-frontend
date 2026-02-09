import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductFacade } from '../facades/product.facade';
import { ToastService } from '../../../core/services/toast.service';
import { ProductVM } from '../models/product.models';
import { PageHeaderComponent } from '../../../shared/components/page/page-header.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatusBadgeComponent } from '../../../shared/components/status/status-badge.component';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        PageHeaderComponent,
        CardComponent,
        StatusBadgeComponent
    ],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
    private productFacade = inject(ProductFacade);
    private toastService = inject(ToastService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    // State signals
    product = signal<ProductVM | null>(null);
    loading = signal<boolean>(false);
    error = signal<string | null>(null);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadProduct(id);
        } else {
            this.error.set('Product ID is required');
        }
    }

    loadProduct(id: string) {
        this.loading.set(true);
        this.error.set(null);

        this.productFacade.getProduct(id).subscribe({
            next: (product) => {
                this.product.set(product);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Failed to load product details');
                this.loading.set(false);
                this.toastService.show('Failed to load product details', 'error');
            }
        });
    }

    goBack() {
        this.router.navigate(['/dashboard/products']);
    }

    editProduct() {
        const product = this.product();
        if (product) {
            this.router.navigate(['/dashboard/products', product.id, 'edit']);
        }
    }
}
