import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * SearchBar Component (SRP - Single Responsibility Principle)
 * Handles search input with debounce functionality
 * Reusable across all list views
 */
@Component({
    selector: 'app-search-bar',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative">
      <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"></i>
      <input 
        type="text" 
        [placeholder]="placeholder"
        [value]="value()"
        (input)="onInput($event)"
        class="form-input pl-10 w-full"
        [disabled]="disabled" />
      <button 
        *ngIf="value()"
        (click)="clear()"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
        <i class="pi pi-times"></i>
      </button>
    </div>
  `
})
export class SearchBarComponent {
    @Input() placeholder = 'Search...';
    @Input() debounceTime = 300;
    @Input() disabled = false;
    @Output() search = new EventEmitter<string>();
    @Output() clearSearch = new EventEmitter<void>();

    value = signal('');
    private searchSubject = new Subject<string>();

    constructor() {
        this.searchSubject.pipe(
            debounceTime(this.debounceTime),
            distinctUntilChanged(),
            takeUntilDestroyed()
        ).subscribe(query => this.search.emit(query));
    }

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.value.set(value);
        this.searchSubject.next(value);
    }

    clear(): void {
        this.value.set('');
        this.searchSubject.next('');
        this.clearSearch.emit();
    }

    setValue(value: string): void {
        this.value.set(value);
    }
}
