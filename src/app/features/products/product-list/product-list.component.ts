import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductFacade } from '../facades/product.facade';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  private productFacade = inject(ProductFacade);

  // Use signals from facade
  products = this.productFacade.products;
  loading = this.productFacade.loading;
  error = this.productFacade.error;

  searchQuery = signal<string>('');
  isExporting = signal(false);

  activeProductCount = computed(() =>
    this.products().filter(p => p.isActive ?? true).length
  );

  inactiveProductCount = computed(() =>
    this.products().filter(p => !(p.isActive ?? true)).length
  );

  ngOnInit() {
    this.productFacade.loadProducts();
  }

  onSearch(query: Event) {
    const value = (query.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery.set(value);
    // Client-side filtering for products usually, or trigger load if backend supports it.
    // Assuming client side filtered view for now as facade exposes signal.
    // Actually, let's create a computed for filtered products if we don't change facade.
  }

  filteredProducts = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.products();
    return this.products().filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query)
    );
  });

  exportProducts() {
    this.isExporting.set(true);
    const data = this.filteredProducts();
    if (data.length === 0) {
      this.isExporting.set(false);
      return;
    }

    // Simulate async export?
    this.downloadCsv(data);
    this.isExporting.set(false);
  }

  private downloadCsv(data: any[]) {
    const headers = ['Code', 'Name', 'Interest Rate', 'Tenure Range', 'Amount Range', 'Status'];
    const rows = data.map(p => [
      p.code,
      p.name,
      p.interestRateLabel,
      p.tenorLabel,
      p.amountRangeLabel,
      p.isActive ? 'Active' : 'Inactive'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  loadProducts() {
    this.productFacade.loadProducts();
  }
}
