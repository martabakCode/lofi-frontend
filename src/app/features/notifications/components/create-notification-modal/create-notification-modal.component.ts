import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationType, NotificationCreateRequest } from '../../../../core/models/notification.models';

@Component({
  selector: 'app-create-notification-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div class="bg-bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-border-default">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-border-default flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-text-primary">Create Notification</h3>
            <p class="text-sm text-text-muted">Send a message to a specific user or everyone</p>
          </div>
          <button (click)="onClose.emit()" class="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-muted transition-colors">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-8">
          <div class="space-y-6">
            <!-- User Selection (Simple ID input for now) -->
            <div>
              <label class="block text-sm font-semibold text-text-secondary mb-2">Target User ID (Optional)</label>
              <input 
                type="text" 
                formControlName="userId"
                placeholder="Leave empty to broadcast to all users"
                class="w-full px-4 py-3 rounded-xl border border-border-default bg-bg-muted/30 focus:ring-2 focus:ring-brand-soft focus:border-brand-main outline-none transition-all text-text-primary placeholder:text-text-muted"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Type -->
              <div>
                <label class="block text-sm font-semibold text-text-secondary mb-2">Notification Type</label>
                <select 
                  formControlName="type"
                  class="w-full px-4 py-3 rounded-xl border border-border-default bg-bg-muted/30 focus:ring-2 focus:ring-brand-soft focus:border-brand-main outline-none transition-all text-text-primary"
                >
                  <option value="SYSTEM">System</option>
                  <option value="LOAN">Loan</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="ACCOUNT">Account</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <!-- Reference ID (Optional) -->
              <div>
                <label class="block text-sm font-semibold text-text-secondary mb-2">Reference ID</label>
                <input 
                  type="text" 
                  formControlName="referenceId"
                  placeholder="e.g. Loan ID"
                  class="w-full px-4 py-3 rounded-xl border border-border-default bg-bg-muted/30 focus:ring-2 focus:ring-brand-soft focus:border-brand-main outline-none transition-all text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-semibold text-text-secondary mb-2">Title</label>
              <input 
                type="text" 
                formControlName="title"
                placeholder="Enter notification title"
                class="w-full px-4 py-3 rounded-xl border border-border-default bg-bg-muted/30 focus:ring-2 focus:ring-brand-soft focus:border-brand-main outline-none transition-all text-text-primary placeholder:text-text-muted"
              />
            </div>

            <!-- Body -->
            <div>
              <label class="block text-sm font-semibold text-text-secondary mb-2">Message Body</label>
              <textarea 
                formControlName="body"
                rows="4"
                placeholder="Enter the detailed message content..."
                class="w-full px-4 py-3 rounded-xl border border-border-default bg-bg-muted/30 focus:ring-2 focus:ring-brand-soft focus:border-brand-main outline-none transition-all resize-none text-text-primary placeholder:text-text-muted"
              ></textarea>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="mt-8 flex gap-3">
            <button 
              type="button"
              (click)="onClose.emit()"
              class="flex-1 px-4 py-3.5 text-sm font-bold text-text-secondary bg-bg-muted hover:bg-bg-muted hover:text-text-primary rounded-2xl transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit"
              [disabled]="form.invalid || loading()"
              class="flex-[2] px-4 py-3.5 text-sm font-bold text-white bg-brand-main hover:bg-brand-hover rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              @if (loading()) {
                <i class="pi pi-spin pi-spinner"></i>
                Sending...
              } @else {
                <i class="pi pi-send"></i>
                Send Notification
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CreateNotificationModalComponent {
  private fb = inject(NonNullableFormBuilder);

  @Output() onClose = new EventEmitter<void>();
  @Output() onCreate = new EventEmitter<NotificationCreateRequest>();

  loading = signal(false);

  form = this.fb.group({
    userId: [''],
    title: ['', [Validators.required]],
    body: ['', [Validators.required]],
    type: ['SYSTEM' as NotificationType, [Validators.required]],
    referenceId: [''],
    link: ['']
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.onCreate.emit(this.form.getRawValue());
      // We don't reset here, the parent will handle closing/resetting
    }
  }
}
