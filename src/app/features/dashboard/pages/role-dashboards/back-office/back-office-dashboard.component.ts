import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-office-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-default pb-6">
        <div>
          <h1 class="text-3xl font-bold text-text-primary m-0">Disbursement Control</h1>
          <p class="text-text-secondary m-0">Final document auditing and fund release operations</p>
        </div>
        <div class="flex items-center gap-3">
           <div class="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center gap-2">
            <i class="pi pi-verified font-bold"></i>
            <span class="font-bold text-xs uppercase tracking-widest">Operations Desk</span>
          </div>
        </div>
      </div>

      <!-- Action: Disbursement List -->
      <div (click)="navigateTo('/dashboard/disbursements')" 
           class="group relative overflow-hidden bg-bg-surface border border-border-default hover:border-indigo-500 rounded-[32px] p-10 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-2xl">
        <div class="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
          <i class="pi pi-money-bill text-[240px]"></i>
        </div>
        <div class="relative z-10 flex flex-col md:flex-row items-center gap-8">
           <div class="w-24 h-24 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
             <i class="pi pi-send text-5xl"></i>
           </div>
           <div class="flex-1 text-center md:text-left">
              <h2 class="text-3xl font-bold text-text-primary mb-2">Execute Disbursements</h2>
              <p class="text-text-secondary text-lg mb-6 max-w-xl">Finalize payments for approved loans. Ensure bank reference numbers are correctly entered into the ledger.</p>
              <button class="btn-primary bg-indigo-600 hover:bg-indigo-700 px-10 py-3 rounded-2xl shadow-lg shadow-indigo-600/30">
                 Run Payments Now
              </button>
           </div>
        </div>
      </div>

      <!-- Secondary Audit Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="card p-6 flex items-center gap-4 bg-bg-muted/30">
           <div class="w-12 h-12 bg-white dark:bg-bg-surface border border-border-default rounded-xl flex items-center justify-center text-text-muted">
             <i class="pi pi-file-o"></i>
           </div>
           <div>
             <p class="text-[10px] font-bold text-text-muted uppercase m-0 tracking-widest">Audit Queue</p>
             <p class="text-lg font-bold text-text-primary m-0">5 Units</p>
           </div>
        </div>
        <div class="card p-6 flex items-center gap-4 bg-bg-muted/30">
           <div class="w-12 h-12 bg-white dark:bg-bg-surface border border-border-default rounded-xl flex items-center justify-center text-text-muted">
             <i class="pi pi-history"></i>
           </div>
           <div>
             <p class="text-[10px] font-bold text-text-muted uppercase m-0 tracking-widest">Released Today</p>
             <p class="text-lg font-bold text-text-primary m-0">IDR 450M</p>
           </div>
        </div>
        <div class="card p-6 flex items-center gap-4 bg-bg-muted/30 hover:bg-brand-soft/20 transition-colors cursor-pointer group" (click)="navigateTo('/dashboard/loans/approval')">
           <div class="w-12 h-12 bg-white dark:bg-bg-surface border border-border-default rounded-xl flex items-center justify-center text-brand-main">
             <i class="pi pi-check-square"></i>
           </div>
           <div class="flex-1">
             <p class="text-[10px] font-bold text-text-muted uppercase m-0 tracking-widest">Secondary Review</p>
             <p class="text-lg font-bold text-text-primary m-0">Check Approval History</p>
           </div>
           <i class="pi pi-arrow-right text-xs text-brand-main opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class BackOfficeDashboardComponent {
  private router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
