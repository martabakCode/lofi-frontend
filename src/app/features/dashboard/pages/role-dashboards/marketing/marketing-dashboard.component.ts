import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marketing-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 class="text-3xl font-bold text-text-primary m-0">Marketing Hub</h1>
          <p class="text-text-secondary m-0">Drive applications and manage initial reviews</p>
        </div>
        <div class="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center gap-2">
           <i class="pi pi-bolt"></i>
           <span class="font-bold text-xs uppercase tracking-widest">Growth Focused</span>
        </div>
      </div>

      <!-- Main Action Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        
        <!-- Action 1: New Application -->
        <div (click)="navigateTo('/dashboard/loans/apply')" 
             class="group cursor-pointer bg-gradient-to-br from-brand-main to-brand-hover p-1 rounded-3xl shadow-xl hover:shadow-brand-main/20 transition-all duration-300 transform hover:-translate-y-1">
          <div class="bg-bg-surface rounded-[22px] p-8 h-full flex flex-col items-center text-center">
            <div class="w-20 h-20 bg-brand-soft text-brand-main rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
              <i class="pi pi-pencil text-4xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-text-primary mb-2">New Loan Application</h2>
            <p class="text-text-secondary mb-8 max-w-xs">Assist customers in creating new loan requests and checking product eligibility.</p>
            <button class="btn-primary w-full py-4 text-lg">Start Application</button>
          </div>
        </div>

        <!-- Action 2: Review Queue -->
        <div (click)="navigateTo('/dashboard/loans/review')" 
             class="group cursor-pointer bg-bg-surface border border-border-default hover:border-brand-main/50 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-col items-center text-center">
            <div class="w-20 h-20 bg-bg-muted text-text-muted group-hover:bg-purple-100 group-hover:text-purple-600 dark:group-hover:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 transition-all">
              <i class="pi pi-search-plus text-4xl"></i>
            </div>
            <h2 class="text-2xl font-bold text-text-primary mb-2">Review Queue</h2>
            <p class="text-text-secondary mb-8 max-w-xs">Verify initial documents and escalate applications for manager approval.</p>
            <button class="btn-secondary w-full py-4 text-lg">Open Queue</button>
          </div>
        </div>

      </div>

      <!-- Bottom Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="card p-6 flex items-center gap-4">
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
            <i class="pi pi-check-circle text-xl"></i>
          </div>
          <div>
            <p class="text-xs font-bold text-text-muted uppercase m-0">Today's Applies</p>
            <p class="text-xl font-bold text-text-primary m-0">42</p>
          </div>
        </div>
        <div class="card p-6 flex items-center gap-4">
           <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl flex items-center justify-center">
            <i class="pi pi-clock text-xl"></i>
          </div>
          <div>
            <p class="text-xs font-bold text-text-muted uppercase m-0">Avg. Processing</p>
            <p class="text-xl font-bold text-text-primary m-0">1.4h</p>
          </div>
        </div>
        <div class="card p-6 flex items-center gap-4">
           <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
            <i class="pi pi-star text-xl"></i>
          </div>
          <div>
            <p class="text-xs font-bold text-text-muted uppercase m-0">Success Rate</p>
            <p class="text-xl font-bold text-text-primary m-0">88%</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MarketingDashboardComponent {
  private router = inject(Router);

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
