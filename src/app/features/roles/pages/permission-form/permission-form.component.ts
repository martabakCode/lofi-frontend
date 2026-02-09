import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PermissionFacade } from '../../facades/permission.facade';
import { Permission } from '../../../../core/models/rbac.models';
import { PageHeaderComponent, BreadcrumbItem } from '../../../../shared/components/page-header/page-header.component';

/**
 * PermissionFormComponent - Create/Edit Permission
 * Handles permission creation and editing
 */
@Component({
  selector: 'app-permission-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <app-page-header
        [title]="isEditMode() ? 'Edit Permission' : 'Create Permission'"
        [breadcrumbs]="breadcrumbs">
      </app-page-header>

      <!-- Form Card -->
      <div class="card">
        <div class="p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Name Field -->
            <div>
              <label class="form-label">Permission Name <span class="text-red-500">*</span></label>
              <input 
                type="text" 
                formControlName="name"
                class="form-input"
                placeholder="Enter permission name (e.g., READ_USER)"
                [class.border-red-500]="form.get('name')?.invalid && form.get('name')?.touched">
              <div *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="text-red-500 text-sm mt-1">
                <span *ngIf="form.get('name')?.errors?.['required']">Permission name is required</span>
                <span *ngIf="form.get('name')?.errors?.['minlength']">Permission name must be at least 3 characters</span>
              </div>
            </div>

            <!-- Description Field -->
            <div>
              <label class="form-label">Description</label>
              <textarea 
                formControlName="description"
                class="form-textarea"
                rows="3"
                placeholder="Enter permission description"></textarea>
            </div>

            <!-- Error Message -->
            <div *ngIf="error()" class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex items-center gap-2 text-red-700">
                <i class="pi pi-exclamation-circle"></i>
                <span>{{ error() }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 pt-4 border-t border-border-default">
              <button 
                type="submit" 
                [disabled]="form.invalid || loading()"
                class="btn-primary"
                [class.opacity-50]="form.invalid || loading()">
                <i *ngIf="loading()" class="pi pi-spin pi-spinner mr-2"></i>
                <i *ngIf="!loading()" class="pi pi-save mr-2"></i>
                {{ isEditMode() ? 'Update Permission' : 'Create Permission' }}
              </button>
              <button type="button" (click)="cancel()" class="btn-secondary">
                <i class="pi pi-times mr-2"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PermissionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private permissionFacade = inject(PermissionFacade);

  form!: FormGroup;
  permissionId = signal<string>('');
  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/dashboard' },
    { label: 'Roles', link: '/dashboard/roles' },
    { label: 'Permissions', link: '/dashboard/roles/permissions' },
    { label: 'Form' }
  ];

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.permissionId.set(id);
      this.isEditMode.set(true);
      this.loadPermission();
      this.breadcrumbs[this.breadcrumbs.length - 1].label = 'Edit';
    } else {
      this.breadcrumbs[this.breadcrumbs.length - 1].label = 'Create';
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  loadPermission(): void {
    // Permission API doesn't have getById, we need to search from list
    // For now, we'll handle this differently or get from route state
    // This is a placeholder - in real implementation, you might need
    // to get it from the list or router state
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const permissionData: Partial<Permission> = {
      name: this.form.value.name,
      description: this.form.value.description
    };

    if (this.isEditMode()) {
      this.permissionFacade.updatePermission(this.permissionId(), permissionData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard/roles/permissions']);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to update permission');
          this.loading.set(false);
        }
      });
    } else {
      this.permissionFacade.createPermission(permissionData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard/roles/permissions']);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to create permission');
          this.loading.set(false);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/roles/permissions']);
  }
}
