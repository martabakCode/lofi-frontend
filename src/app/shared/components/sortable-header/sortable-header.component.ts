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
  template: `
    <th 
      (click)="toggleSort()"
      class="cursor-pointer select-none hover:bg-bg-muted/50 transition-colors"
      [class.text-brand-main]="isActive()">
      <div class="flex items-center gap-1">
        <ng-content></ng-content>
        <span class="sort-icon">
          <i *ngIf="!isActive()" class="pi pi-sort text-text-muted text-xs"></i>
          <i *ngIf="isActive() && direction() === 'asc'" class="pi pi-sort-up text-brand-main text-xs"></i>
          <i *ngIf="isActive() && direction() === 'desc'" class="pi pi-sort-down text-brand-main text-xs"></i>
        </span>
      </div>
    </th>
  `,
  styles: [`
    :host { display: table-cell; }
    
    th {
      padding: 0.75rem 1rem;
      background-color: var(--bg-muted);
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-default);
    }
    
    .sort-icon {
      margin-left: 0.25rem;
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
