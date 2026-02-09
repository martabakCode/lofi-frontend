import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-empty-state',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './empty-state.component.html',
    styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent {
    @Input() icon: string = 'pi-inbox';
    @Input() title: string = 'No data yet';
    @Input() message: string = 'Create your first item to get started';
    @Input() actionText?: string;
    @Input() actionIcon?: string = 'pi-plus';
    @Output() actionClick = new EventEmitter<void>();

    onActionClick(): void {
        this.actionClick.emit();
    }
}
