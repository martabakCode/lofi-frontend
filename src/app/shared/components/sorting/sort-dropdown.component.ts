import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SortOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-sort-dropdown',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative inline-block text-left" [class.open]="isOpen">
      <div>
        <button type="button" 
          (click)="toggle()"
          class="inline-flex justify-center w-full rounded-lg border border-gray-200 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-main"
          id="menu-button" aria-expanded="true" aria-haspopup="true">
          <i class="pi pi-sort-alt mr-2 text-gray-400"></i>
          {{ selectedOption?.label || 'Sort By' }}
          <i class="pi pi-chevron-down ml-2 -mr-1 h-3 w-3 text-gray-400 flex items-center"></i>
        </button>
      </div>

      <div *ngIf="isOpen" 
        class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in-down" 
        role="menu" aria-orientation="vertical" aria-labelledby="menu-button" tabindex="-1">
        <div class="py-1" role="none">
          <a *ngFor="let option of options" 
             href="javascript:void(0)" 
             (click)="select(option)"
             class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-50 hover:text-brand-main" 
             [class.bg-gray-50]="selectedOption?.value === option.value"
             [class.text-brand-main]="selectedOption?.value === option.value"
             role="menuitem" tabindex="-1">
             {{ option.label }}
             <i *ngIf="selectedOption?.value === option.value" class="pi pi-check float-right text-xs mt-1"></i>
          </a>
        </div>
      </div>
      
      <!-- Click off overlay -->
      <div *ngIf="isOpen" class="fixed inset-0 z-40" (click)="close()"></div>
    </div>
  `,
    styles: [`
    .animate-fade-in-down {
        animation: fadeInDown 0.1s ease-out forwards;
        transform-origin: top center;
    }
    @keyframes fadeInDown {
        0% { opacity: 0; transform: scaleY(0.9); }
        100% { opacity: 1; transform: scaleY(1); }
    }
  `]
})
export class SortDropdownComponent {
    @Input() options: SortOption[] = [];
    @Output() sortChange = new EventEmitter<string>();

    isOpen = false;
    selectedOption: SortOption | null = null;

    toggle() {
        this.isOpen = !this.isOpen;
    }

    close() {
        this.isOpen = false;
    }

    select(option: SortOption) {
        this.selectedOption = option;
        this.sortChange.emit(option.value);
        this.close();
    }
}
