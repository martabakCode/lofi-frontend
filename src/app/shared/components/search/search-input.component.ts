import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app-search-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="relative group">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i class="pi pi-search text-gray-400 group-hover:text-brand-main transition-colors"></i>
      </div>
      <input
        type="text"
        [placeholder]="placeholder"
        [(ngModel)]="query"
        (ngModelChange)="onSearch($event)"
        class="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-main/20 focus:border-brand-main sm:text-sm transition-all duration-200"
      >
      <div *ngIf="query" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" (click)="clear()">
        <i class="pi pi-times-circle text-gray-400 hover:text-gray-600"></i>
      </div>
    </div>
  `
})
export class SearchInputComponent {
    @Input() placeholder = 'Search...';
    @Output() search = new EventEmitter<string>();

    query = '';
    private searchSubject = new Subject<string>();

    constructor() {
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            this.search.emit(value);
        });
    }

    onSearch(value: string): void {
        this.searchSubject.next(value);
    }

    clear(): void {
        this.query = '';
        this.searchSubject.next('');
    }
}
