import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-bg-surface rounded-xl shadow-sm border border-border-default overflow-hidden h-full flex flex-col transition-colors">
      <!-- Header -->
      <div *ngIf="title" class="px-6 py-4 border-b border-border-muted flex items-center justify-between">
        <div class="flex-1 flex items-center gap-2">
            <div *ngIf="icon" class="w-8 h-8 rounded-lg bg-brand-soft text-brand-main flex items-center justify-center">
                <i [class]="'pi ' + icon"></i>
            </div>
            <div>
                 <h3 class="text-base font-semibold leading-6 text-text-primary">{{ title }}</h3>
                 <p *ngIf="subtitle" class="mt-1 text-sm text-text-muted">{{ subtitle }}</p>
            </div>
        </div>
        
        <!-- Optional Actions in Header -->
        <div class="ml-4 flex-shrink-0">
          <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>

      <!-- Body -->
      <div class="px-6 py-4 flex-1">
        <ng-content></ng-content>
      </div>

      <!-- Footer -->
      <div *ngIf="hasFooter" class="px-6 py-4 bg-bg-muted border-t border-border-default">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() hasFooter = false;
}
