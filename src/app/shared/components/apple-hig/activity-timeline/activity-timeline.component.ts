import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineItem {
    id?: string;
    type: 'success' | 'warning' | 'error' | 'info' | 'primary';
    icon: string;
    title: string;
    description?: string;
    user?: string;
    timestamp: Date | string;
}

@Component({
    selector: 'app-activity-timeline',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './activity-timeline.component.html',
    styleUrls: ['./activity-timeline.component.css']
})
export class ActivityTimelineComponent {
    @Input() items: TimelineItem[] = [];
}
