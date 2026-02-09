import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ActionConfig {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel?: string;
    type: 'primary' | 'destructive' | 'warning';
}

@Component({
    selector: 'app-action-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './action-modal.component.html',
    styleUrls: ['./action-modal.component.css']
})
export class ActionModalComponent {
    @Input() isOpen: boolean = false;
    @Input() config!: ActionConfig;
    @Input() showComment: boolean = false;
    @Input() commentRequired: boolean = false;

    @Output() confirm = new EventEmitter<string | undefined>();
    @Output() close = new EventEmitter<void>();

    comment: string = '';

    onConfirm(): void {
        if (this.commentRequired && !this.comment.trim()) {
            return;
        }
        this.confirm.emit(this.comment);
        this.reset();
    }

    onClose(): void {
        this.close.emit();
        this.reset();
    }

    private reset(): void {
        this.comment = '';
    }
}
