import { Component, EventEmitter, Input, Output, signal, computed, Signal, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-detail-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isOpenValue()" class="modal-overlay" (click)="onClose()">
      <div class="modal-content max-w-2xl" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-border-default flex justify-between items-center bg-bg-muted/50">
          <h3 class="text-xl font-bold text-text-primary">{{ title }}</h3>
          <button (click)="onClose()" class="text-text-muted hover:text-text-primary transition-colors">
            <i class="pi pi-times text-lg"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 max-h-[70vh] overflow-y-auto">
          <ng-content></ng-content>
        </div>

        <!-- Footer (optional) -->
        <div *ngIf="showFooter" class="px-6 py-4 bg-bg-muted/50 border-t border-border-default flex justify-end gap-3">
          <button (click)="onClose()" class="btn-secondary">
            {{ closeLabel }}
          </button>
          <ng-container *ngIf="footerTemplate">
            <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class DetailModalComponent {
    @Input() title = 'Details';
    @Input() set isOpen(value: boolean) {
        this._isOpen.set(value);
    }
    @Input() showFooter = true;
    @Input() closeLabel = 'Close';

    @ContentChild('footer') footerTemplate?: TemplateRef<any>;

    @Output() close = new EventEmitter<void>();

    private _isOpen = signal(false);
    isOpenValue: Signal<boolean> = computed(() => this._isOpen());

    onClose() {
        this._isOpen.set(false);
        this.close.emit();
    }
}
