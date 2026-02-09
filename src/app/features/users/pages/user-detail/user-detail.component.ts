import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserFacade } from '../../facades/user.facade';
import { User, Role, Branch } from '../../../../core/models/rbac.models';
import { ActivityTimelineComponent } from '../../../../shared/components/apple-hig/activity-timeline/activity-timeline.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/apple-hig/skeleton-loader/skeleton-loader.component';
import { PageHeaderComponent, BreadcrumbItem } from '../../../../shared/components/page-header/page-header.component';

/**
 * UserDetailComponent - Detail View for User
 * Displays comprehensive user information
 */
@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    SkeletonLoaderComponent,
    ActivityTimelineComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <app-page-header
        [title]="'User Details'"
        [breadcrumbs]="breadcrumbs"
        [actions]="headerActions">
      </app-page-header>

      <!-- Loading State -->
      <div *ngIf="loading()" class="card p-6 space-y-6">
        <div class="flex items-center gap-6">
             <app-skeleton-loader type="avatar" [count]="1" width="80px" height="80px"></app-skeleton-loader>
             <div class="space-y-2 flex-1">
                 <app-skeleton-loader type="text" [count]="2" width="200px"></app-skeleton-loader>
             </div>
        </div>
        <app-skeleton-loader type="custom" height="150px"></app-skeleton-loader>
      </div>

      <!-- Error State -->
      <div *ngIf="error()" class="card p-8 bg-error-bg/5 border-error-border">
        <div class="text-center">
          <i class="pi pi-exclamation-circle text-4xl text-error-text mb-3"></i>
          <h3 class="text-lg font-medium text-text-primary">Error Loading User</h3>
          <p class="text-text-secondary mt-1">{{ error() }}</p>
          <button (click)="loadUser()" class="btn-primary mt-4">
            <i class="pi pi-refresh mr-2"></i> Retry
          </button>
        </div>
      </div>

      <!-- User Details -->
      <div *ngIf="!loading() && user() && !error()" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Profile Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Profile Card -->
          <div class="card">
            <div class="card-header flex justify-between items-center">
              <h3 class="text-lg font-semibold text-text-primary">Profile Information</h3>
              <span 
                class="status-badge"
                [class.active]="user()?.status === 'Active'"
                [class.inactive]="user()?.status === 'Inactive'">
                <i [class.pi-check-circle]="user()?.status === 'Active'" 
                   [class.pi-times-circle]="user()?.status === 'Inactive'" class="pi mr-1"></i>
                {{ user()?.status }}
              </span>
            </div>
            <div class="card-body">
              <div class="flex flex-col md:flex-row items-start gap-8">
                <!-- Avatar -->
                <div class="flex-shrink-0">
                  <div class="w-24 h-24 rounded-full bg-brand-soft flex items-center justify-center text-4xl font-bold text-brand-main shadow-apple-sm">
                    <img *ngIf="user()?.avatar" [src]="user()?.avatar" [alt]="user()?.fullName" class="w-full h-full rounded-full object-cover">
                    <span *ngIf="!user()?.avatar">{{ getInitials(user()?.fullName || '') }}</span>
                  </div>
                </div>
                
                <!-- Info Grid -->
                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <label class="form-label">Full Name</label>
                    <p class="text-lg font-medium text-text-primary mt-1">{{ user()?.fullName }}</p>
                  </div>
                  <div>
                    <label class="form-label">Username</label>
                    <p class="text-lg font-medium text-text-primary mt-1 font-mono text-sm bg-bg-muted inline-block px-2 py-1 rounded">{{ user()?.username }}</p>
                  </div>
                  <div>
                    <label class="form-label">Email Address</label>
                    <div class="flex items-center gap-2 mt-1">
                        <i class="pi pi-envelope text-text-muted"></i>
                        <p class="text-text-primary">{{ user()?.email }}</p>
                    </div>
                  </div>
                  <div>
                    <label class="form-label">Phone Number</label>
                    <div class="flex items-center gap-2 mt-1">
                        <i class="pi pi-phone text-text-muted"></i>
                        <p class="text-text-primary">{{ user()?.phone || 'Not provided' }}</p>
                    </div>
                  </div>
                  <div class="md:col-span-2">
                     <div class="h-px bg-border-muted my-2"></div>
                  </div>
                  <div>
                    <label class="form-label">Branch Assignment</label>
                    <div class="flex items-center gap-2 mt-1">
                        <i class="pi pi-building text-text-muted"></i>
                        <p class="text-text-primary font-medium">{{ user()?.branch?.name || 'Not assigned' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Roles Card -->
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-text-primary">
                Assigned Roles
                <span class="ml-2 text-sm font-normal text-text-muted">({{ user()?.roles?.length || 0 }})</span>
              </h3>
            </div>
            <div class="card-body">
              <div *ngIf="!user()?.roles || user()!.roles!.length === 0" class="empty-state py-8">
                <i class="pi pi-shield text-3xl text-text-muted/30"></i>
                <p class="text-text-muted">No roles assigned to this user</p>
              </div>

              <div *ngIf="user()?.roles && user()!.roles!.length > 0" class="flex flex-wrap gap-2">
                <div *ngFor="let role of user()?.roles" 
                     class="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-bg-surface shadow-apple-sm">
                   <div [class]="getRoleIconClass(role)" class="w-8 h-8 rounded-full flex items-center justify-center bg-bg-muted">
                        <i class="pi pi-shield"></i>
                   </div>
                   <div class="flex flex-col">
                       <span class="font-medium text-text-primary text-sm">{{ role.name || role }}</span>
                       <!-- <span class="text-xs text-text-muted">ID: {{ role.id }}</span> -->
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Timeline -->
        <div class="lg:col-span-1">
             <div class="card h-full">
                 <div class="card-header">
                     <h3 class="text-lg font-semibold text-text-primary">Activity History</h3>
                 </div>
                 <div class="card-body">
                     <app-activity-timeline [items]="activityItems()"></app-activity-timeline>
                 </div>
             </div>
        </div>

      </div>
    </div>
    `
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userFacade = inject(UserFacade);

  userId = signal<string>('');
  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  activityItems = signal<any[]>([
    {
      type: 'success',
      icon: 'pi pi-check',
      title: 'User Created',
      description: 'Account successfully created',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      user: 'System Admin'
    },
    {
      type: 'info',
      icon: 'pi pi-pencil',
      title: 'Profile Updated',
      description: 'Phone number updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      user: 'Self'
    },
    {
      type: 'primary',
      icon: 'pi pi-shield',
      title: 'Role Assigned',
      description: 'Assigned role: BRANCH_MANAGER',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      user: 'System Admin'
    }
  ]);

  breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', link: '/dashboard' },
    { label: 'Users', link: '/dashboard/users' },
    { label: 'Details' }
  ];

  headerActions = [
    {
      label: 'Edit',
      icon: 'pi-pencil',
      click: () => this.editUser(),
      variant: 'primary' as const
    }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(id);
      this.loadUser();
    } else {
      this.error.set('User ID not provided');
    }
  }

  loadUser(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userFacade.getUser(this.userId()).subscribe({
      next: (user) => {
        this.user.set(user);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load user details');
        this.loading.set(false);
      }
    });
  }

  editUser(): void {
    this.userFacade.editUser(this.userId());
  }

  backToList(): void {
    this.router.navigate(['/dashboard/users']);
  }

  getInitials(name: string): string {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getRoleIconClass(role: any): string {
    // Logic to return color class based on role name
    return 'text-brand-main';
  }
}
