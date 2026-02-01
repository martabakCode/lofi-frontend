import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Branch, User } from '../../../core/models/rbac.models';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { LeafletMapComponent, MapLocation } from '../../../shared/components/leaflet-map/leaflet-map.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { SortableHeaderComponent, SortConfig } from '../../../shared/components/sortable-header/sortable-header.component';
import { DetailModalComponent } from '../../../shared/components/detail-modal/detail-modal.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';

type ModalMode = 'create' | 'edit' | null;
type StaffRole = 'ALL' | 'BRANCH_MANAGER' | 'MARKETING';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LeafletMapComponent,
    PaginationComponent,
    SortableHeaderComponent,
    DetailModalComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css']
})
export class BranchListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  // Data signals
  branches = signal<Branch[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  totalItems = signal(0);

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);

  // Sorting
  sortField = signal('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Search
  searchQuery = signal('');
  private searchSubject = new Subject<string>();

  // Modal state
  modalMode = signal<ModalMode>(null);
  selectedBranch = signal<Branch | null>(null);
  isSubmitting = signal(false);

  // Detail modal state
  isDetailModalOpen = signal(false);
  branchStaff = signal<User[]>([]);
  staffFilterRole = signal<StaffRole>('ALL');
  loadingStaff = signal(false);

  // Delete confirmation
  isDeleteModalOpen = signal(false);
  branchToDelete = signal<Branch | null>(null);

  // Assign staff modal
  isAssignModalOpen = signal(false);
  availableUsers = signal<User[]>([]);
  selectedUserId = signal('');
  selectedStaffRole = signal<'BRANCH_MANAGER' | 'MARKETING'>('MARKETING');
  loadingUsers = signal(false);

  // Default Jakarta location
  defaultLocation: MapLocation = {
    latitude: -6.2088,
    longitude: 106.8456
  };

  branchForm = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['ID', Validators.required],
    zipCode: ['', Validators.required],
    phone: ['', Validators.required],
    longitude: [''],
    latitude: ['']
  });

  // Computed values
  branchesWithCoordinates = computed(() => {
    return this.branches().filter(b => this.hasCoordinates(b)).length;
  });

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

  constructor() {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadBranches();
    });
  }

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.loading.set(true);
    this.error.set(null);

    const sort = `${this.sortField()},${this.sortDirection()}`;

    this.rbacService.getBranches({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sort,
      search: this.searchQuery() || undefined
    }).subscribe({
      next: (response) => {
        this.branches.set(response.items);
        this.totalItems.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load branches:', err);
        this.error.set('Failed to load branches. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadBranches();
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadBranches();
  }

  onSort(sortConfig: SortConfig) {
    this.sortField.set(sortConfig.field);
    this.sortDirection.set(sortConfig.direction);
    this.loadBranches();
  }

  openCreateModal() {
    this.modalMode.set('create');
    this.selectedBranch.set(null);
    this.branchForm.reset({
      state: 'ID',
      longitude: '',
      latitude: ''
    });
  }

  openEditModal(branch: Branch) {
    this.modalMode.set('edit');
    this.selectedBranch.set(branch);
    this.branchForm.patchValue({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode,
      phone: branch.phone,
      longitude: branch.longitude || '',
      latitude: branch.latitude || ''
    });
  }

  closeModal() {
    this.modalMode.set(null);
    this.selectedBranch.set(null);
    this.branchForm.reset();
  }

  onLocationChange(location: MapLocation) {
    this.branchForm.patchValue({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString()
    });
  }

  getCurrentLocation(): MapLocation {
    const lat = parseFloat(this.branchForm.get('latitude')?.value || '0');
    const lng = parseFloat(this.branchForm.get('longitude')?.value || '0');
    if (lat && lng) {
      return { latitude: lat, longitude: lng };
    }
    return this.defaultLocation;
  }

  onSubmit() {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.branchForm.getRawValue();

    const branchData: Partial<Branch> = {
      name: formValue.name!,
      address: formValue.address!,
      city: formValue.city!,
      state: formValue.state!,
      zipCode: formValue.zipCode!,
      phone: formValue.phone!,
      longitude: formValue.longitude || undefined,
      latitude: formValue.latitude || undefined
    };

    if (this.modalMode() === 'create') {
      this.rbacService.createBranch(branchData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.toastService.show('Branch created successfully', 'success');
          this.loadBranches();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Failed to create branch:', err);
          this.toastService.show('Failed to create branch', 'error');
        }
      });
    } else if (this.modalMode() === 'edit' && this.selectedBranch()) {
      this.rbacService.updateBranch(this.selectedBranch()!.id, branchData).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeModal();
          this.toastService.show('Branch updated successfully', 'success');
          this.loadBranches();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          console.error('Failed to update branch:', err);
          this.toastService.show('Failed to update branch', 'error');
        }
      });
    }
  }

  confirmDelete(branch: Branch) {
    this.branchToDelete.set(branch);
    this.isDeleteModalOpen.set(true);
  }

  onDeleteConfirmed() {
    const branch = this.branchToDelete();
    if (!branch) return;

    this.rbacService.deleteBranch(branch.id).subscribe({
      next: () => {
        this.toastService.show('Branch deleted successfully', 'success');
        this.loadBranches();
        this.isDeleteModalOpen.set(false);
        this.branchToDelete.set(null);
      },
      error: () => {
        this.toastService.show('Failed to delete branch', 'error');
        this.isDeleteModalOpen.set(false);
      }
    });
  }

  viewOnMap(branch: Branch) {
    if (branch.latitude && branch.longitude) {
      const url = `https://www.openstreetmap.org/?mlat=${branch.latitude}&mlon=${branch.longitude}#map=15/${branch.latitude}/${branch.longitude}`;
      window.open(url, '_blank');
    }
  }

  hasCoordinates(branch: Branch): boolean {
    return !!(branch.latitude && branch.longitude);
  }

  // Detail modal methods
  openDetailModal(branch: Branch) {
    this.selectedBranch.set(branch);
    this.isDetailModalOpen.set(true);
    this.loadBranchStaff(branch.id);
  }

  closeDetailModal() {
    this.isDetailModalOpen.set(false);
    this.selectedBranch.set(null);
    this.branchStaff.set([]);
    this.staffFilterRole.set('ALL');
  }

  loadBranchStaff(branchId: string) {
    this.loadingStaff.set(true);
    this.rbacService.getBranchStaff(branchId).subscribe({
      next: (staff) => {
        this.branchStaff.set(staff);
        this.loadingStaff.set(false);
      },
      error: () => {
        this.loadingStaff.set(false);
        this.toastService.show('Failed to load branch staff', 'error');
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

  // Assign staff methods
  openAssignModal(branch: Branch) {
    this.selectedBranch.set(branch);
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
        // Filter users without a branch or different branch
        const currentBranchId = this.selectedBranch()?.id;
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
    const branchId = this.selectedBranch()?.id;
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
        if (this.isDetailModalOpen()) {
          this.loadBranchStaff(branchId);
        }
        this.loadBranches();
      },
      error: () => {
        this.toastService.show('Failed to assign staff', 'error');
      }
    });
  }

  removeStaff(userId: string) {
    const branchId = this.selectedBranch()?.id;
    if (!branchId) return;

    this.rbacService.removeStaffFromBranch(branchId, userId).subscribe({
      next: () => {
        this.toastService.show('Staff removed successfully', 'success');
        this.loadBranchStaff(branchId);
        this.loadBranches();
      },
      error: () => {
        this.toastService.show('Failed to remove staff', 'error');
      }
    });
  }
}
