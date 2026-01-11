import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Loan, LoanService } from '../../../core/services/loan.service';

@Component({
  selector: 'app-loan-review',
  standalone: true,
  imports: [CommonModule, TableModule, TagModule, ButtonModule, InputTextModule],
  templateUrl: './loan-review.component.html',
  styleUrls: ['./loan-review.component.css']
})
export class LoanReviewComponent implements OnInit {
  private loanService = inject(LoanService);

  loans = signal<Loan[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);

  ngOnInit() {
    this.loadLoans();
  }

  loadLoans() {
    this.loading.set(true);
    // Mocking for now as we don't have real API
    setTimeout(() => {
      const mockLoans: Loan[] = [
        { id: '1', customerName: 'John Doe', productName: 'Personal Loan', amount: 5000, tenure: 12, status: 'APPLIED', appliedDate: '2024-03-01' },
        { id: '2', customerName: 'Jane Smith', productName: 'Business Loan', amount: 25000, tenure: 36, status: 'APPLIED', appliedDate: '2024-03-02' },
        { id: '3', customerName: 'Mike Johnson', productName: 'Home Loan', amount: 150000, tenure: 180, status: 'APPLIED', appliedDate: '2024-03-03' },
      ];
      this.loans.set(mockLoans);
      this.totalRecords.set(mockLoans.length);
      this.loading.set(false);
    }, 1000);
  }

  getStatusSeverity(status: string) {
    switch (status) {
      case 'APPLIED': return 'info';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'warn';
    }
  }
}
