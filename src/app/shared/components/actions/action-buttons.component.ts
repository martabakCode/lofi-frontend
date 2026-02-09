import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-action-buttons',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col gap-3 w-full">
      <button *ngIf="canApprove" 
        (click)="onAction('APPROVE')"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm active:scale-95 duration-150">
        <i class="pi pi-check text-sm"></i>
        <span>Approve Loan</span>
      </button>

      <button *ngIf="canReject" 
        (click)="onAction('REJECT')"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all font-medium active:scale-95 duration-150">
        <i class="pi pi-times text-sm"></i>
        <span>Reject Loan</span>
      </button>

      <button *ngIf="canDisburse" 
        (click)="onAction('DISBURSE')"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-main text-white rounded-lg hover:bg-brand-hover transition-colors font-medium shadow-sm active:scale-95 duration-150">
        <i class="pi pi-money-bill text-sm"></i>
        <span>Disburse Funds</span>
      </button>

      <button *ngIf="canEdit" 
        (click)="onAction('EDIT')"
        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium active:scale-95 duration-150">
        <i class="pi pi-pencil text-sm"></i>
        <span>Edit Details</span>
      </button>
    </div>
  `
})
export class ActionButtonsComponent {
    @Input() canApprove = false;
    @Input() canReject = false;
    @Input() canDisburse = false;
    @Input() canEdit = false;

    @Output() action = new EventEmitter<string>();

    onAction(type: string) {
        this.action.emit(type);
    }
}
