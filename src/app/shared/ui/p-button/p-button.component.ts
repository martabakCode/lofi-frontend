import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-p-button',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <p-button
      [label]="label"
      [icon]="icon"
      [loading]="loading"
      [severity]="severity"
      [disabled]="disabled"
      [styleClass]="styleClass + ' ' + customClass"
      (onClick)="onClick.emit($event)"
    >
      <ng-content></ng-content>
    </p-button>
  `,
  styles: [`
    :host ::ng-deep .p-button {
      @apply w-full flex justify-center;
    }
  `]
})
export class PButtonComponent {
  @Input() label: string = '';
  @Input() icon: string = '';
  @Input() loading: boolean = false;
  @Input() severity: any = 'primary';
  @Input() disabled: boolean = false;
  @Input() styleClass: string = '';
  @Input() customClass: string = '';

  @Output() onClick = new EventEmitter<any>();
}
