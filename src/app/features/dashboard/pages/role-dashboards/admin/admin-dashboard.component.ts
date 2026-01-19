import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, timer, of } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { ReportService, LoanKpiResponse } from '../../../../../core/services/report.service';
import { ToastService } from '../../../../../core/services/toast.service';

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
            <div *ngIf="isOutdated()" class="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-600 rounded-xl border border-yellow-500/20 animate-pulse">
                <i class="pi pi-exclamation-triangle"></i>
                <span class="font-bold text-sm">Data may be outdated</span>
            </div>
            <div class="flex items-center gap-2 px-4 py-2 bg-brand-soft text-brand-main rounded-xl border border-brand-main/10">
                <i class="pi pi-shield"></i>
                <span class="font-bold text-sm tracking-wider uppercase">Administrative Access</span>
            </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card p-6 flex flex-col gap-2 border-l-4 border-l-brand-main">
          <span class="text-xs font-bold text-text-muted uppercase tracking-widest">Total Loans</span>
          <span class="text-3xl font-bold text-text-primary tracking-tight">{{ kpiData()?.totalLoans || 0 }}</span>
          <span class="text-xs text-text-muted flex items-center gap-1">
             All time volume
          </span>
        </div>
        <div class="card p-6 flex flex-col gap-2 border-l-4 border-l-amber-500">
          <span class="text-xs font-bold text-text-muted uppercase tracking-widest">Pending Review</span>
          <span class="text-3xl font-bold text-text-primary tracking-tight">{{ kpiData()?.totalSubmitted || 0 }}</span>
          <span class="text-xs text-text-muted">Awaiting Action</span>
        </div>
        <div class="card p-6 flex flex-col gap-2 border-l-4 border-l-indigo-500">
          <span class="text-xs font-bold text-text-muted uppercase tracking-widest">Disbursed</span>
          <span class="text-3xl font-bold text-text-primary tracking-tight">{{ kpiData()?.totalDisbursed || 0 }}</span>
          <span class="text-xs text-green-500 flex items-center gap-1">Completed Loans</span>
        </div>
        <div class="card p-6 flex flex-col gap-2 border-l-4 border-l-rose-500">
          <span class="text-xs font-bold text-text-muted uppercase tracking-widest">Rejected</span>
          <span class="text-3xl font-bold text-text-primary tracking-tight">{{ kpiData()?.totalRejected || 0 }}</span>
          <span class="text-xs text-text-muted">Total Rejections</span>
        </div>
      </div>
      
      <!-- Management Modules -->
      <!-- ... (Same as before) ... -->
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
  private reportService = inject(ReportService);
  private toastService = inject(ToastService);

  kpiData = signal<LoanKpiResponse | null>(null);
  isLoading = signal(false);
  isOutdated = signal(false);

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.startPolling();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startPolling() {
    this.isLoading.set(true);

    // Initial fetch + interval
    timer(0, 30000) // Every 30 seconds
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.reportService.getKpis().pipe(
          catchError(err => {
            console.error('KPI polling error:', err);
            // If we have data, mark as outdated, otherwise show error
            if (this.kpiData()) {
              this.isOutdated.set(true);
              this.toastService.show('Connection lost, dashboard may be outdated', 'warning');
            } else {
              this.toastService.show('Failed to load dashboard data', 'error');
            }
            return of(null);
          })
        ))
      )
      .subscribe((data) => {
        if (data) {
          this.kpiData.set(data);
          this.isOutdated.set(false);
        }
        this.isLoading.set(false);
      });
  }
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
