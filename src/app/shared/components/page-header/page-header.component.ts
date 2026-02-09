import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
    label: string;
    link?: string;
}

export interface HeaderAction {
    label: string;
    icon?: string;
    route?: string;
    click?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
}

/**
 * PageHeader Component (SRP - Single Responsibility Principle)
 * Consistent page header with title, description, breadcrumbs, and actions
 * Reusable across all feature pages
 */
@Component({
    selector: 'app-page-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="space-y-4">
      <!-- Breadcrumbs -->
      <nav *ngIf="breadcrumbs.length > 0" class="flex items-center gap-2 text-sm text-text-muted">
        <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
          <a *ngIf="crumb.link && !last" 
             [routerLink]="crumb.link" 
             class="hover:text-brand-main transition-colors">
            {{ crumb.label }}
          </a>
          <span *ngIf="!crumb.link || last" class="text-text-primary">
            {{ crumb.label }}
          </span>
          <i *ngIf="!last" class="pi pi-chevron-right text-xs"></i>
        </ng-container>
      </nav>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-text-primary">{{ title }}</h1>
          <p *ngIf="description" class="text-text-secondary mt-1">{{ description }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2" *ngIf="actions.length > 0">
          <ng-container *ngFor="let action of actions">
            <a *ngIf="action.route" 
               [routerLink]="action.route"
               [class]="getButtonClass(action.variant)"
               [class.opacity-50]="action.disabled"
               [attr.aria-disabled]="action.disabled">
              <i *ngIf="action.icon" [class]="'pi ' + action.icon"></i>
              <span *ngIf="action.label">{{ action.label }}</span>
            </a>
            <button *ngIf="!action.route"
                    (click)="onActionClick(action)"
                    [class]="getButtonClass(action.variant)"
                    [class.opacity-50]="action.disabled"
                    [disabled]="action.disabled">
              <i *ngIf="action.icon" [class]="'pi ' + action.icon"></i>
              <span *ngIf="action.label">{{ action.label }}</span>
            </button>
          </ng-container>
        </div>

        <!-- Custom Actions -->
        <div class="flex items-center gap-2">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
    @Input() title = '';
    @Input() description = '';
    @Input() breadcrumbs: BreadcrumbItem[] = [];
    @Input() actions: HeaderAction[] = [];
    @Output() actionClick = new EventEmitter<HeaderAction>();

    getButtonClass(variant: string = 'primary'): string {
        const baseClasses = 'btn flex items-center gap-2';
        switch (variant) {
            case 'secondary':
                return `${baseClasses} btn-secondary`;
            case 'danger':
                return `${baseClasses} btn-danger`;
            case 'primary':
            default:
                return `${baseClasses} btn-primary`;
        }
    }

    onActionClick(action: HeaderAction): void {
        if (action.click) {
            action.click();
        }
        this.actionClick.emit(action);
    }
}
