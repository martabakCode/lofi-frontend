import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="mb-8">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div class="flex items-start gap-4">
            <a *ngIf="showBackButton" [routerLink]="backUrl" class="mt-1 p-2 text-gray-400 hover:text-gray-900 bg-white border border-gray-200 rounded-lg transition-all hover:shadow-sm">
                <i class="pi pi-arrow-left"></i>
            </a>
            <div class="space-y-1">
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ title }}</h1>
                <p *ngIf="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
            </div>
        </div>
        
        <div class="flex items-center gap-3">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
    </header>
  `
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showBackButton: boolean = false;
  @Input() backUrl: string = '/dashboard'; // Default fallback
}
