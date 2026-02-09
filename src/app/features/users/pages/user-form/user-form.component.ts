import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserFacade } from '../../facades/user.facade';
import { PermissionFacade } from '../../../roles/facades/permission.facade';
import { User, Role, Branch } from '../../../../core/models/rbac.models';
import { PageHeaderComponent, BreadcrumbItem } from '../../../../shared/components/page-header/page-header.component';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { AutosaveStatus } from '../../../../shared/components/apple-hig/autosave-indicator/autosave-indicator.component';
import { HasUnsavedChanges } from '../../../../shared/directives/unsaved-changes-guard/unsaved-changes-guard.directive';

/**
 * UserFormComponent - Create/Edit User
 * Handles user creation and editing with role assignment
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PageHeaderComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <app-page-header
        [title]="isEditMode() ? 'Edit User' : 'Create User'"
        [breadcrumbs]="breadcrumbs">
      </app-page-header>

      <!-- Form Card -->
      <div class="card">
        <div class="p-6">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Full Name -->
              <div>
                <label class="form-label">Full Name <span class="text-red-500">*</span></label>
                <input 
                  type="text" 
                  formControlName="fullName"
                  class="form-input"
                  placeholder="Enter full name"
                  [class.border-red-500]="form.get('fullName')?.invalid && form.get('fullName')?.touched">
                <div *ngIf="form.get('fullName')?.invalid && form.get('fullName')?.touched" class="text-red-500 text-sm mt-1">
                  Full name is required
                </div>
              </div>

              <!-- Username -->
              <div>
                <label class="form-label">Username <span class="text-red-500">*</span></label>
                <input 
                  type="text" 
                  formControlName="username"
                  class="form-input"
                  placeholder="Enter username"
                  [class.border-red-500]="form.get('username')?.invalid && form.get('username')?.touched">
                <div *ngIf="form.get('username')?.invalid && form.get('username')?.touched" class="text-red-500 text-sm mt-1">
                  Username is required
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="form-label">Email <span class="text-red-500">*</span></label>
                <input 
                  type="email" 
                  formControlName="email"
                  class="form-input"
                  placeholder="Enter email address"
                  [class.border-red-500]="form.get('email')?.invalid && form.get('email')?.touched">
                <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched" class="text-red-500 text-sm mt-1">
                  <span *ngIf="form.get('email')?.errors?.['required']">Email is required</span>
                  <span *ngIf="form.get('email')?.errors?.['email']">Please enter a valid email</span>
                </div>
              </div>

              <!-- Phone -->
              <div>
                <label class="form-label">Phone</label>
                <input 
                  type="tel" 
                  formControlName="phone"
                  class="form-input"
                  placeholder="Enter phone number">
              </div>

              <!-- Branch -->
              <div>
                <label class="form-label">Branch</label>
                <select formControlName="branchId" class="form-select">
                  <option value="">Select Branch</option>
                  <option *ngFor="let branch of branches()" [value]="branch.id">
                    {{ branch.name }}
                  </option>
                </select>
              </div>

              <!-- Status -->
              <div>
                <label class="form-label">Status</label>
                <select formControlName="status" class="form-select">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <!-- Roles -->
            <div>
              <label class="form-label">Roles</label>
              <div class="border border-border-default rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                <div *ngIf="roles().length === 0" class="text-text-secondary text-center py-4">
                  Loading roles...
                </div>
                <div *ngFor="let role of roles()" class="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    [id]="'role-' + role.id"
                    [value]="role.id"
                    (change)="onRoleToggle(role.id, $event)"
                    [checked]="selectedRoles().includes(role.id)"
                    class="rounded border-border-default text-brand-main focus:ring-brand-main">
                  <label [for]="'role-' + role.id" class="text-text-primary cursor-pointer">
                    {{ role.name || role }}
                  </label>
                </div>
              </div>
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
                {{ isEditMode() ? 'Update User' : 'Create User' }}
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
export class UserFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userFacade = inject(UserFacade);

  form!: FormGroup;
  userId = signal<string>('');
  isEditMode = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  branches = signal<Branch[]>([]);
  roles = signal<Role[]>([]);
  selectedRoles = signal<string[]>([]);

  // Autosave
  autosaveStatus = signal<AutosaveStatus>('saved');
  lastSavedTime = signal<Date | null>(null);
  private _hasUnsavedChanges = signal(false);

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/dashboard' },
    { label: 'Users', link: '/dashboard/users' },
    { label: 'Form' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadFilterOptions();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(id);
      this.isEditMode.set(true);
      this.loadUser();
      this.breadcrumbs[this.breadcrumbs.length - 1].label = 'Edit';
    } else {
      this.breadcrumbs[this.breadcrumbs.length - 1].label = 'Create';
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      branchId: [''],
      status: ['Active']
    });

    // Autosave simulation logic
    this.form.valueChanges.pipe(
      tap(() => {
        if (this.form.dirty) {
          this.autosaveStatus.set('unsaved');
          this._hasUnsavedChanges.set(true);
        }
      }),
      debounceTime(2000), // Auto-save after 2 seconds of inactivity
      filter(() => this.form.valid && this.form.dirty)
    ).subscribe(() => {
      this.performAutosave();
    });
  }

  performAutosave() {
    // Simulate autosave api call
    this.autosaveStatus.set('saving');
    setTimeout(() => {
      this.autosaveStatus.set('saved');
      this.lastSavedTime.set(new Date());
      // Note: In real app, we might not set hasUnsavedChanges to false here 
      // because "Save" button usually commits strictly. 
      // But for "Draft" behavior it works.
      // For now let's keep _hasUnsavedChanges true until explicit Submit.
    }, 800);
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.form.pristine;
  }

  loadFilterOptions(): void {
    // Load branches and roles for dropdowns
    this.userFacade.loadFilterOptions();

    // Subscribe to the facade signals
    // Note: In a real implementation, you might want to use a different approach
    // to get the branches and roles for the form
  }

  loadUser(): void {
    this.loading.set(true);
    this.userFacade.getUser(this.userId()).subscribe({
      next: (user) => {
        this.form.patchValue({
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phone: user.phone || '',
          branchId: user.branch?.id || '',
          status: user.status || 'Active'
        });
        this.selectedRoles.set(user.roles?.map(r => r.id) || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load user');
        this.loading.set(false);
      }
    });
  }

  onRoleToggle(roleId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedRoles.update(roles => [...roles, roleId]);
    } else {
      this.selectedRoles.update(roles => roles.filter(id => id !== roleId));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const userData: Partial<User> = {
      ...this.form.value,
      roleIds: this.selectedRoles()
    };

    if (this.isEditMode()) {
      this.userFacade.updateUser(this.userId(), userData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard/users']);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to update user');
          this.loading.set(false);
        }
      });
    } else {
      this.userFacade.createUser(userData).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/dashboard/users']);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to create user');
          this.loading.set(false);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard/users']);
  }
}
