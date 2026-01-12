import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanService, Loan } from '../../../core/services/loan.service';

@Component({
  selector: 'app-disbursement-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disbursement-list.component.html',
  styleUrls: ['./disbursement-list.component.css']
})
export class DisbursementComponent implements OnInit {
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
        { id: '201', customerName: 'Alice Johnson', productName: 'Education Loan', amount: 15000, tenure: 24, status: 'APPROVED', appliedDate: '2024-03-07' },
        { id: '202', customerName: 'Bob Brown', productName: 'Auto Loan', amount: 35000, tenure: 48, status: 'APPROVED', appliedDate: '2024-03-08' },
      ];
      this.loans.set(mockLoans);
      this.totalRecords.set(mockLoans.length);
      this.loading.set(false);
    }, 1000);
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'DISBURSED': return 'info';
      default: return 'warn';
    }
  }
}
