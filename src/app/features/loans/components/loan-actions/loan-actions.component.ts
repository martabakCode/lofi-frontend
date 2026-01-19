import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Loan } from '../../../../core/services/loan.service';

@Component({
    selector: 'app-loan-actions',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="flex gap-4 items-center">
      <!-- CUSTOMER ACTIONS -->
      <ng-container *ngIf="isCustomer()">
        <button *ngIf="loan.status === 'DRAFT'" 
                (click)="onAction('SUBMIT')" 
                [disabled]="loading"
                class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center">
          <i class="fas fa-paper-plane mr-2"></i> Submit Application
        </button>
        
        <button *ngIf="loan.status === 'DISBURSED'" 
                (click)="onAction('COMPLETE')" 
                [disabled]="loading"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center">
          <i class="fas fa-check-circle mr-2"></i> Confirm Fund Receipt
        </button>

        <button *ngIf="loan.status === 'DRAFT' || loan.status === 'SUBMITTED'" 
                (click)="onAction('CANCEL')" 
                [disabled]="loading"
                class="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 disabled:opacity-50 transition-colors flex items-center">
            Cancel
        </button>
      </ng-container>

      <!-- MARKETING ACTIONS -->
      <ng-container *ngIf="isMarketing()">
        <button *ngIf="loan.status === 'SUBMITTED'" 
                (click)="onAction('REVIEW')" 
                [disabled]="loading"
                class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center">
          <i class="fas fa-clipboard-check mr-2"></i> Review Application
        </button>
      </ng-container>

      <!-- BRANCH MANAGER ACTIONS -->
      <ng-container *ngIf="isBranchManager()">
        <ng-container *ngIf="loan.status === 'REVIEWED'">
          <button (click)="onAction('APPROVE')" 
                  [disabled]="loading"
                  class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center">
            <i class="fas fa-check mr-2"></i> Approve
          </button>
          <button (click)="onAction('REJECT')" 
                  [disabled]="loading"
                  class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center">
            <i class="fas fa-times mr-2"></i> Reject
          </button>
        </ng-container>
      </ng-container>

      <!-- BACK OFFICE ACTIONS -->
      <ng-container *ngIf="isBackOffice()">
        <button *ngIf="loan.status === 'APPROVED'" 
                (click)="onAction('DISBURSE')" 
                [disabled]="loading"
                class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center">
          <i class="fas fa-money-bill-wave mr-2"></i> Disburse Funds
        </button>
        <!-- Fallback if Admin/BO needs to force complete -->
                 <button *ngIf="loan.status === 'DISBURSED'" 
                (click)="onAction('COMPLETE')" 
                [disabled]="loading"
                class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center">
          <i class="fas fa-check-double mr-2"></i> Force Complete
        </button>
      </ng-container>

      <!-- LOADING SPINNER -->
      <div *ngIf="loading" class="ml-2">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
      </div>
    </div>
  `
})
export class LoanActionsComponent {
    @Input({ required: true }) loan!: Loan;
    @Input() loading = false;
    @Output() action = new EventEmitter<{ type: string, payload?: any }>();

    private authService = inject(AuthService);
    // Default to empty array if null. 
    // Assuming getUserRoles() returns string[]
    userRoles = this.authService.getUserRoles() || [];

    hasRole(role: string): boolean {
        return this.userRoles.includes(role);
    }

    isCustomer() { return this.hasRole('ROLE_CUSTOMER'); }
    isMarketing() { return this.hasRole('ROLE_MARKETING'); }
    isBranchManager() { return this.hasRole('ROLE_BRANCH_MANAGER'); }
    isBackOffice() { return this.hasRole('ROLE_BACKOFFICE'); }

    onAction(type: string) {
        this.action.emit({ type });
    }
}
