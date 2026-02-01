import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';
import { ReportService, LoanKpiResponse } from '../../../../../core/services/report.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { LoanService } from '../../../../../core/services/loan.service';
import { ProductService } from '../../../../../features/products/services/product.service';
import { RbacService } from '../../../../../core/services/rbac.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in fade-in duration-500">
      <!-- Welcome Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-text-primary m-0">System Overview</h1>
          <p class="text-text-secondary m-0">Central command for Lofi platform administration</p>
        </div>
        <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 px-4 py-2 bg-brand-soft text-brand-main rounded-xl border border-brand-main/10">
                <i class="pi pi-shield"></i>
                <span class="font-bold text-sm tracking-wider uppercase">Administrative Access</span>
            </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <!-- Card 1: Pending Disbursement -->
        <div class="card p-6 flex flex-col gap-2 border-l-4 border-l-amber-500">
          <span class="text-xs font-bold text-text-muted uppercase tracking-widest">Pending Disbursement</span>
          <span class="text-3xl font-bold text-text-primary tracking-tight">{{ pendingDisbursementCount() }}</span>
          <span class="text-xs text-text-muted flex items-center gap-1">
             {{ pendingDisbursementAmount() | currency:'IDR':'symbol':'1.0-0' }} Total Amount
          </span>
           <button (click)="navigateTo('/dashboard/disbursements')" class="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
             Process Disbursements <i class="pi pi-arrow-right"></i>
           </button>
        </div>

        <!-- Card 2: Products -->
        <div class="card p-6 flex flex-col gap-2 border-l-4 border-l-brand-main">
          <span class="text-xs font-bold text-text-muted uppercase tracking-widest">Products</span>
          <div class="flex flex-col gap-1 mt-1">
              <span class="text-sm text-text-primary"><span class="font-bold">{{ activeProducts() }}</span> Active Products</span>
              <span class="text-sm text-text-secondary"><span class="font-bold">{{ inactiveProducts() }}</span> Inactive Products</span>
              <span class="text-sm text-brand-main font-bold mt-1">{{ totalProducts() }} Total Products</span>
          </div>
        </div>

        <!-- Card 3: Users -->
        <div class="card p-6 flex flex-col gap-2 border-l-4 border-l-indigo-500">
          <span class="text-xs font-bold text-text-muted uppercase tracking-widest">Users</span>
          <div class="flex flex-col gap-1 mt-1">
              <span class="text-sm text-text-primary"><span class="font-bold">{{ activeUsers() }}</span> Active Users</span>
              <span class="text-sm text-text-secondary"><span class="font-bold">{{ inactiveUsers() }}</span> Inactive Users</span>
              <span class="text-sm text-indigo-600 font-bold mt-1">{{ totalUsers() }} Total Users</span>
          </div>
        </div>

      </div>
      
      <!-- Management Modules -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Staff & Roles -->
        <button (click)="navigateTo('/dashboard/users')" class="group relative card p-8 text-left hover:border-brand-main/50 transition-all duration-300">
          <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <i class="pi pi-users text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-text-primary mb-2">Staff & RBAC</h3>
          <p class="text-text-secondary text-sm mb-6">Manage employee accounts, permission matrices, and hierarchical role assignments.</p>
          <div class="flex items-center text-brand-main font-bold text-sm">
            Configure Access <i class="pi pi-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
          </div>
        </button>

        <!-- Branch Network -->
        <button (click)="navigateTo('/dashboard/branches')" class="group relative card p-8 text-left hover:border-amber-500/50 transition-all duration-300">
          <div class="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <i class="pi pi-map-marker text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-text-primary mb-2">Branch Network</h3>
          <p class="text-text-secondary text-sm mb-6">Organize physical locations, regional settings, and branch-specific business rules.</p>
          <div class="flex items-center text-amber-600 font-bold text-sm">
            Manage Locations <i class="pi pi-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
          </div>
        </button>

        <!-- Product Catalog -->
        <button (click)="navigateTo('/dashboard/products')" class="group relative card p-8 text-left hover:border-indigo-500/50 transition-all duration-300">
          <div class="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <i class="pi pi-box text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-text-primary mb-2">Product Library</h3>
          <p class="text-text-secondary text-sm mb-6">Define loan products, interest rates, tenor limitations, and eligibility criteria.</p>
          <div class="flex items-center text-indigo-600 font-bold text-sm">
            Edit Catalog <i class="pi pi-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
          </div>
        </button>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private loanService = inject(LoanService);
  private productService = inject(ProductService);
  private rbacService = inject(RbacService);

  // Card 1: Pending Disbursement
  pendingDisbursementCount = signal(0);
  pendingDisbursementAmount = signal(0);

  // Card 2: Products
  activeProducts = signal(0);
  inactiveProducts = signal(0);
  totalProducts = signal(0);

  // Card 3: Users
  activeUsers = signal(0);
  inactiveUsers = signal(0);
  totalUsers = signal(0);

  isLoading = signal(false);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.isLoading.set(true);

    forkJoin({
      loans: this.loanService.getLoans({ status: 'APPROVED', size: 100 }), // Fetch approved loans to calculate pending disbursement
      products: this.productService.getProducts(),
      users: this.rbacService.getUsers()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          // 1. Pending Disbursement Stats
          const approvedLoans = data.loans.content || [];
          this.pendingDisbursementCount.set(data.loans.totalElements || approvedLoans.length);

          // Sum amount (Approximation based on fetched page, ideally backend provides this)
          const totalAmount = approvedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
          this.pendingDisbursementAmount.set(totalAmount);

          // 2. Product Stats
          const products = data.products?.items || [];
          this.totalProducts.set(products.length);
          this.activeProducts.set(products.filter((p: any) => p.isActive).length);
          this.inactiveProducts.set(products.filter((p: any) => !p.isActive).length);

          // 3. User Stats
          const users = data.users?.items || [];
          // Assuming status exists on User, defaulting to 'Active' if checked elsewhere
          // Based on user-list.component.ts: status can be checked.
          // User interface in rbac.models.ts might have status.
          // Let's assume 'status' field presence based on user-list logic.
          const activeCount = users.filter((u: any) => u.status === 'Active' || !u.status).length;
          this.activeUsers.set(activeCount);
          this.inactiveUsers.set(users.length - activeCount);
          this.totalUsers.set(users.length);

          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load dashboard data', err);
          this.toastService.show('Failed to load dashboard data', 'error');
          this.isLoading.set(false);
        }
      });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
