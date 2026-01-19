import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div *ngIf="isOpen" class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border-default flex justify-between items-center">
          <h3 class="text-xl font-bold text-text-primary">{{ title }}</h3>
          <button (click)="onClose()" class="text-text-muted hover:text-text-primary transition-colors">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6">
          <p class="text-text-secondary mb-4">{{ message }}</p>
          
          <div *ngIf="requireNotes" class="space-y-2">
            <label class="form-label">Notes <span class="text-red-500">*</span></label>
            <textarea 
              [(ngModel)]="notes" 
              class="form-textarea h-32" 
              [placeholder]="placeholder"
              [class.border-red-500]="showError && !notes"
            ></textarea>
            <p *ngIf="showError && !notes" class="text-xs text-red-500">
              Notes are required for this action.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-bg-muted/50 border-t border-border-default flex justify-end gap-3">
          <button (click)="onClose()" class="btn-secondary">Cancel</button>
          <button (click)="onConfirm()" [className]="'btn-primary ' + confirmBtnClass">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class ConfirmationModalComponent {
    @Input() isOpen = false;
    @Input() title = 'Confirm Action';
    @Input() message = 'Are you sure you want to proceed?';
    @Input() confirmLabel = 'Confirm';
    @Input() confirmBtnClass = '';
    @Input() requireNotes = false;
    @Input() placeholder = 'Enter notes here...';

    @Output() confirm = new EventEmitter<string>();
    @Output() close = new EventEmitter<void>();

    notes = '';
    showError = false;

    onClose() {
        this.isOpen = false;
        this.notes = '';
        this.showError = false;
        this.close.emit();
    }

    onConfirm() {
        if (this.requireNotes && !this.notes.trim()) {
            this.showError = true;
            return;
        }
        this.confirm.emit(this.notes);
        this.onClose();
    }
}
