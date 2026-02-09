import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-page-toolbar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div class="flex items-center gap-4 w-full sm:w-auto">
        <ng-content select="app-search-input"></ng-content>
      </div>
      
      <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageToolbarComponent { }
