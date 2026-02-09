import { Component, EventEmitter, Input, Output, computed, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Info -->
      <div class="text-sm text-gray-500">
        Showing <span class="font-medium text-gray-900">{{ startItem() }}</span> 
        to <span class="font-medium text-gray-900">{{ endItem() }}</span> 
        of <span class="font-medium text-gray-900">{{ total() }}</span> items
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-4">
        <!-- Page Size -->
        <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">Rows per page:</span>
            <select 
              [ngModel]="pageSize()"
              (ngModelChange)="onPageSizeChange($event)"
              class="form-select h-8 text-sm border-gray-200 rounded-lg focus:ring-brand-main focus:border-brand-main bg-white">
              <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
            </select>
        </div>

        <!-- Navigation -->
        <div class="flex items-center gap-1">
            <button 
              (click)="goToPrevious()"
              [disabled]="page() === 1"
              class="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:text-gray-900 transition-colors">
              <i class="pi pi-angle-left"></i>
            </button>

            <div class="flex items-center gap-1">
                <ng-container *ngFor="let p of visiblePages()">
                    <button *ngIf="p !== -1"
                        (click)="goToPage(p)"
                        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all"
                        [class.bg-white]="p !== page()"
                        [class.text-gray-700]="p !== page()"
                        [class.hover:bg-gray-50]="p !== page()"
                        [class.bg-brand-main]="p === page()"
                        [class.text-white]="p === page()"
                        [class.shadow-sm]="p === page()">
                        {{ p }}
                    </button>
                    <span *ngIf="p === -1" class="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                </ng-container>
            </div>

            <button 
              (click)="goToNext()"
              [disabled]="page() === totalPages()"
              class="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:text-gray-900 transition-colors">
              <i class="pi pi-angle-right"></i>
            </button>
        </div>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input('page') set setPage(value: number) {
    this._page.set(value);
  }
  @Input('pageSize') set setPageSize(value: number) {
    this._pageSize.set(value);
  }
  @Input('total') set setTotal(value: number) {
    this._total.set(value);
  }
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  private _page = signal(1);
  private _pageSize = signal(10);
  private _total = signal(0);

  page: Signal<number> = computed(() => this._page());
  pageSize: Signal<number> = computed(() => this._pageSize());
  total: Signal<number> = computed(() => this._total());
  totalPages: Signal<number> = computed(() => Math.ceil(this._total() / this._pageSize()));

  startItem: Signal<number> = computed(() => {
    if (this._total() === 0) return 0;
    return (this._page() - 1) * this._pageSize() + 1;
  });

  endItem: Signal<number> = computed(() => {
    const end = this._page() * this._pageSize();
    return Math.min(end, this._total());
  });

  visiblePages: Signal<number[]> = computed(() => {
    const current = this._page();
    const total = this.totalPages();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(-1);
    if (total > 1) pages.push(total);

    return pages;
  });

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages() && p !== this._page()) {
      this._page.set(p);
      this.pageChange.emit(p);
    }
  }

  goToPrevious() { this.goToPage(this._page() - 1); }
  goToNext() { this.goToPage(this._page() + 1); }

  onPageSizeChange(newSize: number) {
    this._pageSize.set(Number(newSize));
    this._page.set(1);
    this.pageSizeChange.emit(Number(newSize));
  }
}
