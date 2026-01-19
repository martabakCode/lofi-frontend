import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { Loan } from '../../../core/services/loan.service';

@Component({
    selector: 'app-loan-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">Loan Requests</h1>
        <a routerLink="/loans/apply" class="btn-primary">
          <i class="fas fa-plus mr-2"></i> New Loan
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading() && loans().length === 0" class="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
        <i class="fas fa-folder-open text-4xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">No loans found</h3>
        <p class="text-gray-500 dark:text-gray-400 mt-2">Get started by creating a new loan application.</p>
        <a routerLink="/loans/apply" class="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium">
          Create Loan &rarr;
        </a>
      </div>

      <!-- Data Table -->
      <div *ngIf="!loading() && loans().length > 0" class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tenure</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let loan of loans()" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ loan.productName }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">ID: {{ loan.id | slice:0:8 }}...</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">
                    {{ loan.amount | currency:'IDR':'symbol':'1.0-0' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-white">{{ loan.tenure }} Months</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span [ngClass]="getStatusClass(loan.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ loan.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ loan.appliedDate | date:'mediumDate' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a [routerLink]="['/loans', loan.id]" class="text-primary-600 hover:text-primary-900 dark:hover:text-primary-400">View</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LoanListComponent implements OnInit {
    private loanFacade = inject(LoanFacade);

    loans = signal<Loan[]>([]);
    loading = this.loanFacade.loading;

    ngOnInit() {
        this.loadLoans();
    }

    loadLoans() {
        this.loanFacade.getLatestLoans().subscribe({
            next: (response) => {
                this.loans.set(response.content || []);
            },
            error: (err) => console.error(err)
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
            case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'REVIEWED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'DISBURSED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'COMPLETED': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
}
