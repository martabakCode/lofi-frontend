import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-table-row',
    standalone: true,
    imports: [CommonModule],
    template: `
    <tr class="hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-0">
      <!-- Auto-generated columns -->
      <ng-container *ngIf="columns.length > 0">
        <td *ngFor="let col of columns" class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
           {{ getValue(data, col.field) }}
        </td>
      </ng-container>

      <!-- Custom cell projection -->
      <ng-content select="td"></ng-content>

      <!-- Actions/Extra Content -->
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <ng-content></ng-content>
      </td>
    </tr>
  `,
    styles: [`
    :host {
      display: contents;
    }
  `]
})
export class TableRowComponent {
    @Input() data: any;
    @Input() columns: any[] = [];

    getValue(data: any, field: string): any {
        if (!data || !field) return '';
        return field.split('.').reduce((obj, key) => obj?.[key], data);
    }
}
