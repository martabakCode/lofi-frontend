import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  private permission: string = '';
  private isVisible = false;

  @Input() set appHasPermission(val: string) {
    this.permission = val;
    this.updateView();
  }

  constructor() {
    // React to user changes automatically
    effect(() => {
      this.authService.currentUser();
      this.updateView();
    });
  }

  private updateView() {
    const hasPerm = this.authService.hasPermission(this.permission);

    if (hasPerm && !this.isVisible) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    } else if (!hasPerm && this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
