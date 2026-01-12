import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-p-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="'button'"
      [disabled]="disabled || loading"
      [class]="'flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ' + getSeverityClasses() + ' ' + customClass"
      (click)="onClick.emit($event)"
    >
      <span *ngIf="loading" class="animate-spin">⏳</span>
      <span *ngIf="icon && !loading">{{icon}}</span> <!-- Just showing icon string or nothing if it was class -->
      <!-- Ideally we remove icon input usage or pass text/emoji -->
      <ng-content></ng-content>
      <span *ngIf="label">{{label}}</span>
    </button>
  `,
  styles: []
})
export class PButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() loading: boolean = false;
  @Input() severity: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'contrast' | null | undefined = 'primary';
  @Input() disabled: boolean = false;
  @Input() styleClass: string = '';
  @Input() customClass: string = '';

  @Output() onClick = new EventEmitter<any>();

  getSeverityClasses(): string {
    switch (this.severity) {
      case 'primary': return 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500';
      case 'secondary': return 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500';
      case 'success': return 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500';
      case 'info': return 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500';
      case 'warning': return 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500';
      case 'help': return 'bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500';
      case 'danger': return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      case 'contrast': return 'bg-black text-white hover:bg-gray-800 focus:ring-black';
      default: return 'bg-primary-600 text-white hover:bg-primary-700';
    }
  }
}
