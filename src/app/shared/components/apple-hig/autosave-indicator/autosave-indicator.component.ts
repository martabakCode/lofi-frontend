import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AutosaveStatus = 'saved' | 'saving' | 'error' | 'unsaved';

@Component({
    selector: 'app-autosave-indicator',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './autosave-indicator.component.html',
    styleUrls: ['./autosave-indicator.component.css']
})
export class AutosaveIndicatorComponent {
    @Input() status: AutosaveStatus = 'saved';
    @Input() lastSaved?: Date | null;
}
