import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RbacService } from '../../../../core/services/rbac.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Branch, User } from '../../../../core/models/rbac.models';
import { PageHeaderComponent } from '../../../../shared/components/page/page-header.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { LeafletMapComponent } from '../../../../shared/components/leaflet-map/leaflet-map.component';
import { DetailModalComponent } from '../../../../shared/components/detail-modal/detail-modal.component';
import { catchError, of, retry } from 'rxjs';

type StaffRole = 'ALL' | 'BRANCH_MANAGER' | 'MARKETING';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    CardComponent,
    LeafletMapComponent,
    DetailModalComponent
  ],
  templateUrl: './branch-detail.component.html'
})
export class BranchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private rbacService = inject(RbacService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  branchId = signal<string>('');
  branch = signal<Branch | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  errorDetails = signal<string | null>(null);

  // Staff State
  branchStaff = signal<User[]>([]);
  staffFilterRole = signal<StaffRole>('ALL');
  loadingStaff = signal(false);

  // Assign Modal State
  isAssignModalOpen = signal(false);
  availableUsers = signal<User[]>([]);
  selectedUserId = signal('');
  selectedStaffRole = signal<'BRANCH_MANAGER' | 'MARKETING'>('MARKETING');
  loadingUsers = signal(false);

  filteredBranchStaff = computed(() => {
    const staff = this.branchStaff();
    const filter = this.staffFilterRole();
    if (filter === 'ALL') return staff;
    return staff.filter(s => {
      const roleNames = s.roles?.map(r => typeof r === 'string' ? r : r.name) || [];
      if (filter === 'BRANCH_MANAGER') {
        return roleNames.some(r => r.includes('BRANCH_MANAGER'));
      }
      return roleNames.some(r => r.includes('MARKETING'));
    });
  });

  staffStats = computed(() => {
    const staff = this.branchStaff();
    const bmCount = staff.filter(s =>
      s.roles?.some(r => {
        const name = typeof r === 'string' ? r : r.name;
        return name?.includes('BRANCH_MANAGER');
      })
    ).length;
    const marketingCount = staff.filter(s =>
      s.roles?.some(r => {
        const name = typeof r === 'string' ? r : r.name;
        return name?.includes('MARKETING');
      })
    ).length;
    return { total: staff.length, bmCount, marketingCount };
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.branchId.set(id);
      this.loadBranch();
      this.loadBranchStaff();
    } else {
      this.error.set('Branch ID not provided');
    }
  }

  loadBranch(): void {
    this.loading.set(true);
    this.error.set(null);
    this.errorDetails.set(null);

    this.rbacService.getBranchById(this.branchId()).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((err) => {
        console.error('Failed to load branch:', err);
        const message = err.error?.message || err.message || 'Failed to load branch';
        this.error.set(message);
        this.errorDetails.set(`Error: ${err.status} ${err.statusText}`);
        this.loading.set(false);
        return of(null);
      })
    ).subscribe({
      next: (branch) => {
        if (branch) {
          this.branch.set(branch);
        }
        this.loading.set(false);
      }
    });
  }

  retryLoad(): void {
    this.loadBranch();
    this.loadBranchStaff();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/branches']);
  }

  loadBranchStaff() {
    this.loadingStaff.set(true);
    this.rbacService.getBranchStaff(this.branchId()).pipe(
      retry({ count: 2, delay: 1000 }),
      catchError((err) => {
        console.error('Failed to load branch staff:', err);
        this.loadingStaff.set(false);
        this.toastService.show('Failed to load branch staff', 'error');
        return of([]);
      })
    ).subscribe({
      next: (staff) => {
        this.branchStaff.set(staff);
        this.loadingStaff.set(false);
      }
    });
  }

  setStaffFilter(role: StaffRole) {
    this.staffFilterRole.set(role);
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

  getRoleDisplayName(role: any): string {
    if (!role) return 'Unknown';
    const name = typeof role === 'string' ? role : role.name;
    return name ? name.replace('ROLE_', '').replace('_', ' ') : 'Unknown';
  }

  // Assign Staff Methods
  openAssignModal() {
    this.isAssignModalOpen.set(true);
    this.selectedUserId.set('');
    this.selectedStaffRole.set('MARKETING');
    this.loadAvailableUsers();
  }

  closeAssignModal() {
    this.isAssignModalOpen.set(false);
    this.selectedUserId.set('');
    this.availableUsers.set([]);
  }

  loadAvailableUsers() {
    this.loadingUsers.set(true);
    this.rbacService.getUsers({ pageSize: 100 }).subscribe({
      next: (response) => {
        const currentBranchId = this.branchId();
        const available = response.items.filter(u => !u.branch || u.branch.id !== currentBranchId);
        this.availableUsers.set(available);
        this.loadingUsers.set(false);
      },
      error: () => {
        this.loadingUsers.set(false);
        this.toastService.show('Failed to load users', 'error');
      }
    });
  }

  onAssignStaff() {
    const branchId = this.branchId();
    const userId = this.selectedUserId();
    const role = this.selectedStaffRole();

    if (!branchId || !userId) {
      this.toastService.show('Please select a user', 'error');
      return;
    }

    this.rbacService.assignStaffToBranch(branchId, userId, role).subscribe({
      next: () => {
        this.toastService.show('Staff assigned successfully', 'success');
        this.closeAssignModal();
        this.loadBranchStaff();
      },
      error: () => {
        this.toastService.show('Failed to assign staff', 'error');
      }
    });
  }

  removeStaff(userId: string) {
    const branchId = this.branchId();
    if (!branchId) return;

    this.rbacService.removeStaffFromBranch(branchId, userId).subscribe({
      next: () => {
        this.toastService.show('Staff removed successfully', 'success');
        this.loadBranchStaff();
      },
      error: () => {
        this.toastService.show('Failed to remove staff', 'error');
      }
    });
  }

  hasLocation(branch: Branch): boolean {
    return !!(branch.latitude && branch.longitude);
  }

  getLocation(branch: Branch): { latitude: number; longitude: number } {
    return {
      latitude: parseFloat(branch.latitude?.toString() || '0'),
      longitude: parseFloat(branch.longitude?.toString() || '0')
    };
  }
}
