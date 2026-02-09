import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Branch } from '../../../core/models/rbac.models';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PageHeaderComponent } from '../../../shared/components/page/page-header.component';
import { PageToolbarComponent } from '../../../shared/components/page/page-toolbar.component';
import { SearchInputComponent } from '../../../shared/components/search/search-input.component';
import { SortDropdownComponent, SortOption } from '../../../shared/components/sorting/sort-dropdown.component';
import { CardTableComponent } from '../../../shared/components/table/card-table.component';
import { TableHeaderComponent, Column } from '../../../shared/components/table/table-header.component';
import { TableRowComponent } from '../../../shared/components/table/table-row.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PaginationComponent,
    PageHeaderComponent,
    PageToolbarComponent,
    SearchInputComponent,
    SortDropdownComponent,
    CardTableComponent,
    TableHeaderComponent,
    TableRowComponent,
    ConfirmationModalComponent
  ],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css']
})
export class BranchListComponent implements OnInit {
  private rbacService = inject(RbacService);
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

  // Delete confirmation
  isDeleteModalOpen = signal(false);
  branchToDelete = signal<Branch | null>(null);

  // Computed values
  branchesWithCoordinates = computed(() => {
    return this.branches().filter(b => this.hasCoordinates(b)).length;
  });

  // Table Configuration
  columns: Column[] = [
    { field: 'name', header: 'Branch Name', sortable: true, width: '30%' },
    { field: 'address', header: 'Address', sortable: true, width: '40%' },
    { field: 'phone', header: 'Contact', sortable: true, width: '20%' },
    { field: 'coordinates', header: 'Coordinates', width: '10%' }
  ];

  sortOptions: SortOption[] = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Name (Z-A)', value: '-name' },
    { label: 'Address (A-Z)', value: 'address' },
    { label: 'Address (Z-A)', value: '-address' }
  ];

  constructor() {
    // Setup search debounce (keep this if you want to use the subject, but SearchInputComponent emits distinct values usually)
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

  onSearch(query: string) {
    this.searchSubject.next(query);
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

  onHeaderSort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.loadBranches();
  }

  onDropdownSort(value: string) {
    if (value.startsWith('-')) {
      this.sortField.set(value.substring(1));
      this.sortDirection.set('desc');
    } else {
      this.sortField.set(value);
      this.sortDirection.set('asc');
    }
    this.loadBranches();
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
}
