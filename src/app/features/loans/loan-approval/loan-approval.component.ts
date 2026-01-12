import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loan, LoanService } from '../../../core/services/loan.service';

@Component({
  selector: 'app-loan-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-approval.component.html',
  styleUrls: ['./loan-approval.component.css']
})
export class LoanApprovalComponent implements OnInit {
  private loanService = inject(LoanService);

  loans = signal<Loan[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loading.set(true);
    // Mocking for now
    setTimeout(() => {
      const mockLoans: Loan[] = [
        { id: '101', customerName: 'Robert White', productName: 'Investment Loan', amount: 500000, tenure: 60, status: 'REVIEWED', appliedDate: '2024-03-05' },
        { id: '102', customerName: 'Sarah Connor', productName: 'Tech Startup Loan', amount: 120000, tenure: 24, status: 'REVIEWED', appliedDate: '2024-03-06' },
      ];
      this.loans.set(mockLoans);
      this.totalRecords.set(mockLoans.length);
      this.loading.set(false);
    }, 1000);
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'REVIEWED': return 'warn';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'info';
    }
  }
}
