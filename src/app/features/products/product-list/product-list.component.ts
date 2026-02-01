import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductFacade } from '../facades/product.facade';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SortableHeaderComponent, SortConfig } from '../../../shared/components/sortable-header/sortable-header.component';
import { DetailModalComponent } from '../../../shared/components/detail-modal/detail-modal.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { ProductVM } from '../models/product.models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PaginationComponent,
    SortableHeaderComponent,
    DetailModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  private productFacade = inject(ProductFacade);
  private toastService = inject(ToastService);

  // Use signals from facade
  products = this.productFacade.products;
  loading = this.productFacade.loading;
  error = this.productFacade.error;

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = signal(1);

  // Sorting
  sortField = signal('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Search
  searchQuery = signal('');
  private searchSubject = new Subject<string>();

  // Filters
  selectedStatusFilter = signal<string>('');

  // Modal states
  isDetailModalOpen = signal(false);
  selectedProduct = signal<ProductVM | null>(null);

  // Delete confirmation
  isDeleteModalOpen = signal(false);
  productToDelete = signal<ProductVM | null>(null);

  // Export
  isExporting = signal(false);

  constructor() {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadProducts();
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    // For now, use the facade's loadProducts
    // In a real implementation, the facade would support pagination params
    this.productFacade.loadProducts();

    // Update total items based on filtered products
    // This is a workaround until the backend supports pagination
    setTimeout(() => {
      this.totalItems.set(this.products().length);
    }, 500);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    // In a real implementation, this would trigger a new API call
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSort(sortConfig: SortConfig) {
    this.sortField.set(sortConfig.field);
    this.sortDirection.set(sortConfig.direction);
    // In a real implementation, this would trigger a new API call
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadProducts();
  }

  clearFilters() {
    this.selectedStatusFilter.set('');
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadProducts();
  }

  // Computed values
  activeProductCount = computed(() =>
    this.products().filter(p => p.isActive ?? true).length
  );

  inactiveProductCount = computed(() =>
    this.products().filter(p => !(p.isActive ?? true)).length
  );

  hasActiveFilters = computed(() => {
    return this.selectedStatusFilter() || this.searchQuery();
  });

  filteredProducts = computed(() => {
    let result = this.products();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatusFilter();

    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query)
      );
    }

    if (status) {
      const isActive = status === 'active';
      result = result.filter(p => (p.isActive ?? true) === isActive);
    }

    // Client-side sorting
    const sortField = this.sortField();
    const sortDir = this.sortDirection();
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'interestRate':
          comparison = a.interestRate - b.interestRate;
          break;
        case 'minAmount':
          comparison = a.minAmount - b.minAmount;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

    // Update total for pagination display
    this.totalItems.set(result.length);

    // Client-side pagination
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return result.slice(start, end);
  });

  // Detail modal
  openDetailModal(product: ProductVM) {
    this.selectedProduct.set(product);
    this.isDetailModalOpen.set(true);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    this.selectedProduct.set(null);
  }

  // Delete functionality
  confirmDelete(product: ProductVM) {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  onDeleteConfirmed() {
    const product = this.productToDelete();
    if (!product) return;

    this.productFacade.deleteProduct(product.id).subscribe({
      next: () => {
        this.toastService.show('Product deleted successfully', 'success');
        this.isDeleteModalOpen.set(false);
        this.productToDelete.set(null);
      },
      error: () => {
        this.toastService.show('Failed to delete product', 'error');
        this.isDeleteModalOpen.set(false);
      }
    });
  }

  // Toggle status
  toggleStatus(product: ProductVM) {
    // For now, just show a message since the facade doesn't support partial updates
    this.toastService.show('Product status update not implemented in facade', 'info');
  }

  // Export functionality
  exportProducts() {
    this.isExporting.set(true);
    const data = this.products();
    if (data.length === 0) {
      this.isExporting.set(false);
      return;
    }

    this.downloadCsv(data);
    this.isExporting.set(false);
  }

  private downloadCsv(data: ProductVM[]) {
    const headers = ['Code', 'Name', 'Interest Rate', 'Tenure Range', 'Amount Range', 'Admin Fee', 'Status'];
    const rows = data.map(p => [
      p.code,
      p.name,
      p.interestRateLabel,
      p.tenorLabel,
      p.amountRangeLabel,
      p.adminFee ? `Rp ${p.adminFee.toLocaleString()}` : '-',
      p.isActive ? 'Active' : 'Inactive'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.show('Products exported successfully', 'success');
  }
}
