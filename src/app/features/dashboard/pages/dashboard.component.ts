import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="space-y-6">
      <header>
        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Overview</h2>
        <p class="text-surface-500 dark:text-surface-400">Welcome back! Here's what's happening today.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card bg-white dark:bg-surface-900 shadow-sm border border-surface-200 dark:border-surface-800 p-6 rounded-xl">
           <div class="flex items-center justify-between mb-4">
             <div class="h-10 w-10 bg-primary-50 dark:bg-primary-950 rounded-lg flex items-center justify-center text-primary-600">
               <i class="pi pi-users text-xl"></i>
             </div>
             <span class="text-sm font-medium text-green-600">+12%</span>
           </div>
           <h3 class="text-surface-500 dark:text-surface-400 text-sm font-medium">Total Users</h3>
           <p class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">10,245</p>
        </div>

        <div class="card bg-white dark:bg-surface-900 shadow-sm border border-surface-200 dark:border-surface-800 p-6 rounded-xl">
           <div class="flex items-center justify-between mb-4">
             <div class="h-10 w-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center text-blue-600">
               <i class="pi pi-briefcase text-xl"></i>
             </div>
             <span class="text-sm font-medium text-green-600">+5.4%</span>
           </div>
           <h3 class="text-surface-500 dark:text-surface-400 text-sm font-medium">Active Tasks</h3>
           <p class="text-2xl font-bold text-surface-900 dark:text-surface-0 mt-1">842</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {}
