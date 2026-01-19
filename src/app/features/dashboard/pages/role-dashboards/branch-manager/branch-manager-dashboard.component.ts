import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-branch-manager-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="space-y-8 animate-in slide-in-from-top-4 duration-500">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-text-primary m-0">Manager Control</h1>
          <p class="text-text-secondary m-0">Oversee branch operations and final loan approvals</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center gap-2">
            <i class="pi pi-briefcase font-bold"></i>
            <span class="font-bold text-xs uppercase tracking-widest">Branch Operations</span>
          </div>
        </div>
      </div>

      <!-- Main Action: Approval Desk -->
      <div class="card p-1 rounded-[32px] shadow-2xl bg-gradient-to-r from-amber-500/20 via-transparent to-brand-main/20">
        <div (click)="navigateTo('/dashboard/loans/approval')" 
             class="group cursor-pointer bg-bg-surface rounded-[28px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 hover:shadow-lg transition-all">
          <div class="w-32 h-32 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-3xl flex items-center justify-center group-hover:scale-105 transition-all shadow-inner">
            <i class="pi pi-check-square text-6xl"></i>
          </div>
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-3xl font-bold text-text-primary mb-3 tracking-tight">Approval Desk</h2>
            <p class="text-text-secondary text-lg mb-8 max-w-xl">You have <span class="text-amber-600 font-bold">18 pending</span> loans requiring your final signature and verification before disbursement.</p>
            <div class="flex flex-wrap gap-4 justify-center md:justify-start">
               <button class="btn-primary px-8 py-3 text-lg flex items-center gap-2">
                 Proceed to Approvals <i class="pi pi-arrow-right"></i>
               </button>
               <button class="btn-secondary px-6">View Branch Stats</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid: Other Management -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card p-8 group hover:border-text-primary transition-all cursor-pointer" (click)="navigateTo('/dashboard/branches')">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 bg-bg-muted rounded-xl flex items-center justify-center">
               <i class="pi pi-map-marker text-xl"></i>
            </div>
            <i class="pi pi-chevron-right text-text-muted group-hover:translate-x-1 transition-transform"></i>
          </div>
          <h3 class="font-bold text-xl mb-2">My Branch</h3>
          <p class="text-text-secondary text-sm">Update branch details, office hours, and contact information for your location.</p>
        </div>
        
        <div class="card p-8 group hover:border-text-primary transition-all cursor-pointer">
          <div class="flex justify-between items-start mb-6">
            <div class="w-12 h-12 bg-bg-muted rounded-xl flex items-center justify-center">
               <i class="pi pi-users text-xl"></i>
            </div>
            <i class="pi pi-chevron-right text-text-muted group-hover:translate-x-1 transition-transform"></i>
          </div>
          <h3 class="font-bold text-xl mb-2">My Team</h3>
          <p class="text-text-secondary text-sm">Monitor performance metrics and activity logs for your branch staff members.</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; }
  `]
})
export class BranchManagerDashboardComponent {
    private router = inject(Router);

    navigateTo(path: string) {
        this.router.navigate([path]);
    }
}
