import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineEvent {
  title: string;
  timestamp: Date | string;
  description?: string;
  actor?: string;
  icon?: string;
  color?: string; // e.g. 'bg-blue-500'
}

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-border-muted transition-colors">
      <div *ngFor="let event of events; let last = last" class="relative">
        
        <!-- Dot -->
        <span class="absolute -left-[21px] top-1 h-[14px] w-[14px] rounded-full border-[3px] border-bg-surface ring-1 ring-border-default transition-all"
            [ngClass]="event.color || 'bg-text-muted'">
        </span>

        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
          <span class="text-sm font-semibold text-text-primary">{{ event.title }}</span>
          <span class="text-xs text-text-muted whitespace-nowrap">{{ event.timestamp | date:'MMM d, y, h:mm a' }}</span>
        </div>
        
        <p *ngIf="event.description" class="mt-1 text-sm text-text-secondary">{{ event.description }}</p>
        
        <div *ngIf="event.actor" class="mt-1 flex items-center gap-2">
            <!-- Optional actor avatar or icon -->
            <span class="text-xs text-text-muted bg-bg-muted px-2 py-0.5 rounded-full border border-border-muted">
                by {{ event.actor }}
            </span>
        </div>
      </div>
    </div>
  `
})
export class ActivityTimelineComponent {
  @Input() events: TimelineEvent[] = [];
}
