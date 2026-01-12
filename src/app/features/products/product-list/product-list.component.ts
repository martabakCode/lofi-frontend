import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Product {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  minTenure: number;
  maxTenure: number;
  interestRate: number;
  active: boolean;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    // Mocking for now
    setTimeout(() => {
      const mockProducts: Product[] = [
        { id: 'P1', name: 'Personal Loan', minAmount: 1000, maxAmount: 10000, minTenure: 6, maxTenure: 24, interestRate: 1.5, active: true },
        { id: 'P2', name: 'Business Loan', minAmount: 10000, maxAmount: 100000, minTenure: 12, maxTenure: 60, interestRate: 1.2, active: true },
        { id: 'P3', name: 'Micro Finance', minAmount: 500, maxAmount: 5000, minTenure: 3, maxTenure: 12, interestRate: 2.0, active: false },
      ];
      this.products.set(mockProducts);
      this.loading.set(false);
    }, 1000);
  }
}
