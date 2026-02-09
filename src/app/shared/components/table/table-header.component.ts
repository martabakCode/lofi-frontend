import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Column {
    field: string;
    header: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

@Component({
    selector: 'app-table-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <tr class="bg-gray-50/50 border-b border-gray-100">
      <th *ngFor="let col of columns" 
          class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
          [class.cursor-pointer]="col.sortable"
          [class.hover:text-brand-main]="col.sortable"
          (click)="onSort(col)"
          [style.width]="col.width"
          [style.text-align]="col.align || 'left'">
        {{ col.header }}
        <i *ngIf="col.sortable" class="pi pi-sort-alt ml-1 text-[10px] opacity-60"></i>
      </th>
      <th *ngIf="hasActions" class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
        Actions
      </th>
    </tr>
  `,
    styles: [`
    :host {
      display: table-header-group;
    }
  `]
})
export class TableHeaderComponent {
    @Input() columns: Column[] = [];
    @Input() hasActions = false;
    @Output() sort = new EventEmitter<string>();

    onSort(col: Column) {
        if (col.sortable) {
            this.sort.emit(col.field);
        }
    }
}
