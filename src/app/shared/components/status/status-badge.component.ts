import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusType = 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'DEFAULT' | string;

@Component({
    selector: 'app-status-badge',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <span [class]="badgeClass">
      <span *ngIf="showDot" class="w-1.5 h-1.5 rounded-full mr-1.5" [class]="dotClass"></span>
      {{ label || status }}
    </span>
  `
})
export class StatusBadgeComponent implements OnInit {
    @Input() status: StatusType = 'DEFAULT';
    @Input() label?: string;
    @Input() showDot = true; // Premium touch

    get badgeClass(): string {
        const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors';
        const s = (this.status || 'DEFAULT').toUpperCase();

        switch (s) {
            case 'SUCCESS':
            case 'ACTIVE':
            case 'APPROVED':
            case 'COMPLETED':
                return `${base} bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]`;

            case 'WARNING':
            case 'PENDING':
            case 'REVIEW':
            case 'SUBMITTED':
                return `${base} bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]`;

            case 'ERROR':
            case 'REJECTED':
            case 'INACTIVE':
            case 'DELETE':
                return `${base} bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-border)]`;

            case 'INFO':
            case 'DRAFT':
                return `${base} bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]`;

            default:
                return `${base} bg-bg-muted text-text-secondary border-border-default`;
        }
    }

    get dotClass(): string {
        const s = (this.status || 'DEFAULT').toUpperCase();
        switch (s) {
            case 'SUCCESS': return 'bg-green-400';
            case 'ACTIVE': return 'bg-green-400';
            case 'APPROVED': return 'bg-green-400';

            case 'WARNING': return 'bg-yellow-400';
            case 'PENDING': return 'bg-yellow-400';

            case 'ERROR': return 'bg-red-400';
            case 'REJECTED': return 'bg-red-400';
            case 'INACTIVE': return 'bg-red-400';

            case 'INFO': return 'bg-blue-400';
            case 'DRAFT': return 'bg-blue-400';

            default: return 'bg-gray-400';
        }
    }

    ngOnInit() {
        // optional logic
    }
}
