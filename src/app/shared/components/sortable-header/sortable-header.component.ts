import { Component, EventEmitter, Input, Output, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-sortable-header',
  standalone: true,
  imports: [CommonModule],
  // Use attribute selector so it can be applied directly to th element
  host: {
    '[class.cursor-pointer]': 'true',
    '[class.select-none]': 'true',
    '[class.text-brand-main]': 'isActive()',
    '(click)': 'toggleSort()'
  },
  template: `
    <div class="flex items-center gap-1 w-full">
      <ng-content></ng-content>
      <span class="sort-icon ml-auto">
        <i *ngIf="!isActive()" class="pi pi-sort text-text-muted text-xs"></i>
        <i *ngIf="isActive() && direction() === 'asc'" class="pi pi-sort-up text-brand-main text-xs"></i>
        <i *ngIf="isActive() && direction() === 'desc'" class="pi pi-sort-down text-brand-main text-xs"></i>
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: table-cell;
      padding: 0.75rem 1rem;
      background-color: var(--bg-muted);
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-default);
      transition: background-color 0.15s ease;
      white-space: nowrap;
    }
    
    :host:hover {
      background-color: rgba(var(--bg-muted-rgb, 241, 245, 249), 0.7);
    }
    
    .sort-icon {
      flex-shrink: 0;
    }
  `]
})
export class SortableHeaderComponent {
  @Input() field!: string;
  @Input() set sortField(value: string) {
    this._sortField.set(value);
  }
  @Input() set sortDirection(value: 'asc' | 'desc') {
    this._sortDirection.set(value);
  }

  @Output() sort = new EventEmitter<SortConfig>();

  private _sortField = signal('');
  private _sortDirection = signal<'asc' | 'desc'>('asc');

  isActive: Signal<boolean> = computed(() => this._sortField() === this.field);
  direction: Signal<'asc' | 'desc'> = computed(() => this._sortDirection());

  toggleSort() {
    const newDirection = this.isActive() && this._sortDirection() === 'asc' ? 'desc' : 'asc';
    this.sort.emit({
      field: this.field,
      direction: newDirection
    });
  }
}
