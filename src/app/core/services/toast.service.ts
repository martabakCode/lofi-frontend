
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    message: string;
    type: ToastType;
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts = signal<ToastMessage[]>([]);
    private counter = 0;

    show(message: string, type: ToastType = 'info') {
        const id = this.counter++;
        const newToast: ToastMessage = { message, type, id };
        this.toasts.update(current => [...current, newToast]);

        setTimeout(() => {
            this.remove(id);
        }, 5000); // Auto dismiss after 5 seconds
    }

    remove(id: number) {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }
}
