import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-skeleton-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './skeleton-loader.component.html',
    styleUrls: ['./skeleton-loader.component.css']
})
export class SkeletonLoaderComponent {
    @Input() type: 'text' | 'avatar' | 'card' | 'table' | 'custom' = 'text';
    @Input() width?: string;
    @Input() height?: string;
    @Input() count: number = 1;
    @Input() rows?: number = 5; // For table type

    get rowsArray(): number[] {
        return Array.from({ length: this.rows || 5 }, (_, i) => i);
    }

    get countArray(): number[] {
        return Array.from({ length: this.count }, (_, i) => i);
    }
}
