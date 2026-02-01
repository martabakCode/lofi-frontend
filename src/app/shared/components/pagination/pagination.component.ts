import { Component, EventEmitter, Input, Output, computed, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border-default bg-bg-muted/30">
      <!-- Info -->
      <div class="text-sm text-text-secondary">
        Showing <span class="font-medium text-text-primary">{{ startItem() }}</span> 
        to <span class="font-medium text-text-primary">{{ endItem() }}</span> 
        of <span class="font-medium text-text-primary">{{ totalItems() }}</span> items
      </div>

      <!-- Page Size Selector -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-text-secondary">Items per page:</span>
        <select 
          [ngModel]="pageSize()"
          (ngModelChange)="onPageSizeChange($event)"
          class="form-select w-20 py-1 text-sm">
          <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
        </select>
      </div>

      <!-- Pagination Controls -->
      <div class="flex items-center gap-1">
        <!-- First Page -->
        <button 
          (click)="goToFirst()"
          [disabled]="currentPage() === 1"
          class="pagination-btn"
          title="First page">
          <i class="pi pi-angle-double-left"></i>
        </button>

        <!-- Previous Page -->
        <button 
          (click)="goToPrevious()"
          [disabled]="currentPage() === 1"
          class="pagination-btn"
          title="Previous page">
          <i class="pi pi-angle-left"></i>
        </button>

        <!-- Page Numbers -->
        <ng-container *ngFor="let page of visiblePages()">
          <button 
            *ngIf="page !== -1"
            (click)="goToPage(page)"
            [class.active]="page === currentPage()"
            class="pagination-btn"
            [class.pagination-btn-active]="page === currentPage()">
            {{ page }}
          </button>
          <span 
            *ngIf="page === -1"
            class="px-2 text-text-muted">
            ...
          </span>
        </ng-container>

        <!-- Next Page -->
        <button 
          (click)="goToNext()"
          [disabled]="currentPage() === totalPages()"
          class="pagination-btn"
          title="Next page">
          <i class="pi pi-angle-right"></i>
        </button>

        <!-- Last Page -->
        <button 
          (click)="goToLast()"
          [disabled]="currentPage() === totalPages()"
          class="pagination-btn"
          title="Last page">
          <i class="pi pi-angle-double-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    .pagination-btn {
      display: flex;
      width: 2.25rem;
      height: 2.25rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-muted);
      transition: all 0.2s;
    }
    
    .pagination-btn:hover {
      background-color: var(--bg-muted);
      color: var(--text-primary);
    }
    
    .pagination-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    .pagination-btn-active {
      background-color: var(--brand-main);
      color: white;
    }
    
    .pagination-btn-active:hover {
      background-color: var(--brand-hover);
    }
  `]
})
export class PaginationComponent {
  @Input() set currentPageValue(value: number) {
    this._currentPage.set(value);
  }
  @Input() set pageSizeValue(value: number) {
    this._pageSize.set(value);
  }
  @Input() set totalItemsValue(value: number) {
    this._totalItems.set(value);
  }
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  private _currentPage = signal(1);
  private _pageSize = signal(10);
  private _totalItems = signal(0);

  currentPage: Signal<number> = computed(() => this._currentPage());
  pageSize: Signal<number> = computed(() => this._pageSize());
  totalItems: Signal<number> = computed(() => this._totalItems());
  totalPages: Signal<number> = computed(() => Math.ceil(this._totalItems() / this._pageSize()));

  startItem: Signal<number> = computed(() => {
    if (this._totalItems() === 0) return 0;
    return (this._currentPage() - 1) * this._pageSize() + 1;
  });

  endItem: Signal<number> = computed(() => {
    const end = this._currentPage() * this._pageSize();
    return Math.min(end, this._totalItems());
  });

  visiblePages: Signal<number[]> = computed(() => {
    const current = this._currentPage();
    const total = this.totalPages();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push(-1); // Ellipsis
    }

    // Show pages around current
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push(-1); // Ellipsis
    }

    // Always show last page
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  });

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this._currentPage()) {
      this._currentPage.set(page);
      this.pageChange.emit(page);
    }
  }

  goToFirst() {
    this.goToPage(1);
  }

  goToPrevious() {
    this.goToPage(this._currentPage() - 1);
  }

  goToNext() {
    this.goToPage(this._currentPage() + 1);
  }

  goToLast() {
    this.goToPage(this.totalPages());
  }

  onPageSizeChange(newSize: number) {
    this._pageSize.set(Number(newSize));
    this._currentPage.set(1);
    this.pageSizeChange.emit(Number(newSize));
  }
}
