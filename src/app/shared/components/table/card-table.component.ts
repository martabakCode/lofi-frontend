import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-card-table',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
            <ng-content select="app-table-header, thead"></ng-content>
            <tbody class="divide-y divide-gray-100">
                <ng-content select="app-table-row, tr"></ng-content>
            </tbody>
        </table>
      </div>
      
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
        <ng-content select="app-pagination"></ng-content>
      </div>
    </div>
  `
})
export class CardTableComponent { }
