import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductFacade } from '../facades/product.facade';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  private productFacade = inject(ProductFacade);

  // Use signals from facade
  products = this.productFacade.products;
  loading = this.productFacade.loading;
  error = this.productFacade.error;

  activeProductCount = computed(() =>
    this.products().filter(p => p.isActive ?? true).length
  );

  inactiveProductCount = computed(() =>
    this.products().filter(p => !(p.isActive ?? true)).length
  );

  ngOnInit() {
    this.productFacade.loadProducts();
  }

  loadProducts() {
    this.productFacade.loadProducts();
  }
}
