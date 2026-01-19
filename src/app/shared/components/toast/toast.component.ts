
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastType } from '../../../core/services/toast.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    animations: [
        trigger('toastAnimation', [
            transition(':enter', [
                style({ transform: 'translateY(100%)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ])
    ],
    template: `
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div *ngFor="let toast of toastService.toasts()" 
           [@toastAnimation]
           class="pointer-events-auto min-w-[300px] p-4 rounded-lg shadow-lg flex items-center justify-between gap-3 text-white cursor-pointer"
           [ngClass]="getClasses(toast.type)"
           (click)="toastService.remove(toast.id)">
        
        <div class="flex items-center gap-2">
          <!-- Icons based on type -->
          <span *ngIf="toast.type === 'success'">✅</span>
          <span *ngIf="toast.type === 'error'">❌</span>
          <span *ngIf="toast.type === 'warning'">⚠️</span>
          <span *ngIf="toast.type === 'info'">ℹ️</span>
          
          <span class="text-sm font-medium">{{ toast.message }}</span>
        </div>

        <button class="text-white/80 hover:text-white transition-colors">✕</button>
      </div>
    </div>
  `
})
export class ToastComponent {
    toastService = inject(ToastService);

    getClasses(type: ToastType): string {
        switch (type) {
            case 'success': return 'bg-green-600';
            case 'error': return 'bg-red-600';
            case 'warning': return 'bg-yellow-600';
            case 'info': return 'bg-blue-600';
            default: return 'bg-gray-800';
        }
    }
}
