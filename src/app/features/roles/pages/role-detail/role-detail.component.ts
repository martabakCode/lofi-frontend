import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoleFacade } from '../../facades/role.facade';
import { Role, Permission } from '../../../../core/models/rbac.models';
import { PageHeaderComponent, BreadcrumbItem } from '../../../../shared/components/page-header/page-header.component';

/**
 * RoleDetailComponent - Detail View for Role
 * Displays comprehensive role information and permissions
 */
@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <app-page-header
        [title]="'Role Details'"
        [breadcrumbs]="breadcrumbs"
        [actions]="headerActions">
      </app-page-header>

      <!-- Loading State -->
      <div *ngIf="loading()" class="card p-8">
        <div class="flex items-center justify-center gap-3">
          <i class="pi pi-spin pi-spinner text-2xl text-brand-main"></i>
          <span class="text-text-secondary">Loading role details...</span>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="card p-8">
        <div class="text-center">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <h3 class="text-lg font-medium text-text-primary">Error Loading Role</h3>
          <p class="text-text-secondary mt-1">{{ error() }}</p>
          <button (click)="loadRole()" class="btn-primary mt-4">
            <i class="pi pi-refresh mr-2"></i> Retry
          </button>
        </div>
      </div>

      <!-- Role Details -->
      <div *ngIf="!loading() && role() && !error()" class="space-y-6">
        <!-- Info Card -->
        <div class="card">
          <div class="px-6 py-4 border-b border-border-default">
            <h3 class="text-lg font-semibold text-text-primary">Role Information</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="text-sm text-text-muted">Role Name</label>
                <p class="text-text-primary font-medium">{{ role()?.name }}</p>
              </div>
              <div>
                <label class="text-sm text-text-muted">Description</label>
                <p class="text-text-primary font-medium">{{ role()?.description || 'No description' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions Card -->
        <div class="card">
          <div class="px-6 py-4 border-b border-border-default">
            <h3 class="text-lg font-semibold text-text-primary">
              Permissions ({{ role()?.permissions?.length || 0 }})
            </h3>
          </div>
          <div class="p-6">
            <div *ngIf="role()?.permissions?.length === 0" class="text-center py-8">
              <i class="pi pi-shield text-4xl text-text-muted mb-3"></i>
              <p class="text-text-secondary">No permissions assigned to this role</p>
            </div>
            <div *ngIf="role()?.permissions && role()!.permissions!.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div 
                *ngFor="let permission of role()?.permissions" 
                class="p-4 bg-bg-muted rounded-lg border border-border-default">
                <div class="flex items-start gap-3">
                  <i class="pi pi-check-circle text-green-500 mt-0.5"></i>
                  <div>
                    <p class="font-medium text-text-primary">{{ permission.name }}</p>
                    <p *ngIf="permission.description" class="text-sm text-text-secondary mt-1">
                      {{ permission.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button (click)="editRole()" class="btn-primary">
            <i class="pi pi-pencil mr-2"></i> Edit Role
          </button>
          <button (click)="backToList()" class="btn-secondary">
            <i class="pi pi-arrow-left mr-2"></i> Back to List
          </button>
        </div>
      </div>
    </div>
  `
})
export class RoleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleFacade = inject(RoleFacade);

  roleId = signal<string>('');
  role = signal<Role | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/dashboard' },
    { label: 'Roles', link: '/dashboard/roles' },
    { label: 'Details' }
  ];

  headerActions = [
    {
      label: 'Edit',
      icon: 'pi-pencil',
      click: () => this.editRole(),
      variant: 'primary' as const
    }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.roleId.set(id);
      this.loadRole();
    } else {
      this.error.set('Role ID not provided');
    }
  }

  loadRole(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roleFacade.getRole(this.roleId()).subscribe({
      next: (role) => {
        this.role.set(role);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load role details');
        this.loading.set(false);
      }
    });
  }

  editRole(): void {
    this.roleFacade.editRole(this.roleId());
  }

  backToList(): void {
    this.router.navigate(['/dashboard/roles']);
  }
}
