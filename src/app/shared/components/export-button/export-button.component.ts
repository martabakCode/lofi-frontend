import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ExportColumn {
    field: string;
    header: string;
    formatter?: (value: any, item: any) => string;
}

/**
 * ExportButton Component (SRP - Single Responsibility Principle)
 * Handles data export to CSV functionality
 * Reusable across all list views
 */
@Component({
    selector: 'app-export-button',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button 
      (click)="onExport()"
      [disabled]="isExporting() || disabled"
      class="btn-secondary"
      [class.opacity-50]="isExporting() || disabled"
      [title]="title">
      <i class="pi pi-download" [class.pi-spin]="isExporting()"></i>
      <span *ngIf="!iconOnly" class="ml-2">{{ label }}</span>
    </button>
  `
})
export class ExportButtonComponent {
    @Input() data: any[] = [];
    @Input() filename = 'export';
    @Input() disabled = false;
    @Input() iconOnly = false;
    @Input() label = 'Export';
    @Input() title = 'Export to CSV';
    @Input() columns: ExportColumn[] = [];
    @Output() export = new EventEmitter<void>();
    @Output() exportComplete = new EventEmitter<boolean>();

    isExporting = signal(false);

    onExport(): void {
        if (this.isExporting() || this.disabled) return;

        this.isExporting.set(true);
        this.export.emit();

        // If data is provided directly, export immediately
        if (this.data.length > 0) {
            try {
                this.downloadCSV();
                this.exportComplete.emit(true);
            } catch (error) {
                console.error('Export failed:', error);
                this.exportComplete.emit(false);
            } finally {
                this.isExporting.set(false);
            }
        } else {
            // Parent component will handle the export
            setTimeout(() => this.isExporting.set(false), 500);
        }
    }

    private downloadCSV(): void {
        if (this.data.length === 0) return;

        const columns = this.columns.length > 0
            ? this.columns
            : this.inferColumns(this.data[0]);

        const headers = columns.map(col => col.header);

        const rows = this.data.map(item => {
            return columns.map(col => {
                const value = this.getNestedValue(item, col.field);
                if (col.formatter) {
                    return this.escapeCSV(col.formatter(value, item));
                }
                return this.escapeCSV(value);
            });
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.filename}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    private inferColumns(item: any): ExportColumn[] {
        return Object.keys(item).map(key => ({
            field: key,
            header: this.formatHeader(key)
        }));
    }

    private formatHeader(key: string): string {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }

    private escapeCSV(value: any): string {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }
}
