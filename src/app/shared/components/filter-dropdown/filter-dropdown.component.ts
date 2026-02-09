import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
    value: string;
    label: string;
}

/**
 * FilterDropdown Component (SRP - Single Responsibility Principle)
 * Reusable filter dropdown with clear functionality
 */
@Component({
    selector: 'app-filter-dropdown',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="relative">
      <label *ngIf="label" class="form-label block mb-1">{{ label }}</label>
      <div class="flex items-center gap-2">
        <select 
          [ngModel]="selectedValue()"
          (ngModelChange)="onSelect($event)"
          [disabled]="disabled"
          class="form-select w-full"
          [class.pl-10]="icon">
          <option value="">{{ placeholder }}</option>
          <option *ngFor="let option of options" [value]="option.value">
            {{ option.label }}
          </option>
        </select>
        <button 
          *ngIf="selectedValue() && showClear"
          (click)="clear()"
          class="text-text-muted hover:text-text-primary transition-colors p-1"
          [title]="'Clear ' + label">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
  `
})
export class FilterDropdownComponent {
    @Input() label = '';
    @Input() placeholder = 'All';
    @Input() options: FilterOption[] = [];
    @Input() disabled = false;
    @Input() showClear = true;
    @Input() icon = '';
    @Output() change = new EventEmitter<string>();
    @Output() clearFilter = new EventEmitter<void>();

    selectedValue = signal<string>('');

    onSelect(value: string): void {
        this.selectedValue.set(value);
        this.change.emit(value);
    }

    clear(): void {
        this.selectedValue.set('');
        this.change.emit('');
        this.clearFilter.emit();
    }

    setValue(value: string): void {
        this.selectedValue.set(value);
    }
}
