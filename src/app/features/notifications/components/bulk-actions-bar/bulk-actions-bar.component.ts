import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bulk-actions-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [class.translate-y-0.5]="count === 0"
      [class.opacity-0]="count === 0"
      [class.pointer-events-none]="count === 0"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out"
    >
      <div class="flex items-center gap-6 px-6 py-4 bg-bg-surface border border-border-default text-text-primary rounded-2xl shadow-2xl backdrop-blur-md">
        <div class="flex items-center gap-3 pr-6 border-r border-border-muted">
          <span class="flex items-center justify-center w-6 h-6 bg-brand-main text-white text-xs font-bold rounded-full">
            {{ count }}
          </span>
          <span class="text-sm font-medium text-text-secondary text-nowrap">selected items</span>
        </div>

        <div class="flex items-center gap-4">
          <button 
            (click)="onMarkRead.emit()"
            class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl hover:bg-bg-muted transition-colors active:scale-95"
          >
            <i class="pi pi-check-circle text-info-text"></i>
            Mark as Read
          </button>
          
          <button 
            (click)="onDelete.emit()"
            class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-error-text rounded-xl hover:bg-error-bg/10 transition-colors active:scale-95"
          >
            <i class="pi pi-trash"></i>
            Delete Selected
          </button>

          <button 
            (click)="onCancel.emit()"
            class="ml-2 p-2 text-text-muted hover:text-text-primary transition-colors"
          >
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>
    </div>
  `
})
export class BulkActionsBarComponent {
  @Input() count = 0;
  @Output() onMarkRead = new EventEmitter<void>();
  @Output() onDelete = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
}
