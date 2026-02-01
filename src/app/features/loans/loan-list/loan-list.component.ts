import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { Loan } from '../../../core/services/loan.service';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.css']
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
