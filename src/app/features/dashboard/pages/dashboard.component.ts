import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoanService, Loan } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // State
  myLoans = signal<Loan[]>([]);
  isLoading = signal<boolean>(false);
  userName = signal<string>('');

  // Services
  private authService = inject(AuthService);
  private loanService = inject(LoanService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.userName.set(user.username);
    }

    // Load Loans
    this.loadMyLoans();
  }

  loadMyLoans() {
    this.isLoading.set(true);
    // Fetch loans - backend should filter for current user (Customer)
    this.loanService.getLoans({ page: 0, size: 20 }).subscribe({
      next: (res) => {
        this.myLoans.set(res.content || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        // Error is handled by interceptor, but we stop loading
        this.isLoading.set(false);
      }
    });
  }

  navigateToApply() {
    this.router.navigate(['/dashboard/loans/apply']);
  }
}
