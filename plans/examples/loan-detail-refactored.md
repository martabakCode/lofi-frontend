# Example: Refactored LoanDetailComponent

## Overview

This document shows the **BEFORE** and **AFTER** of refactoring `LoanDetailComponent` to achieve proper separation of logic (.ts) and template (.html).

---

## BEFORE: Inline Template (Anti-Pattern)

```typescript
// loan-detail.component.ts - BEFORE (180+ lines inline)
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanService, BackendLoanResponse } from '../../../core/services/loan.service';
import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoanActionsComponent } from '../components/loan-actions/loan-actions.component';
import { LeafletMapComponent } from '../../../shared/components/leaflet-map/leaflet-map.component';

@Component({
    selector: 'app-loan-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, LoanActionsComponent, LeafletMapComponent],
    // ❌ INLINE TEMPLATE: 180+ lines mixed with component logic
    template: `
    <div class="container mx-auto px-4 py-8 max-w-5xl">
      <!-- Breadcrumb -->
      <nav class="mb-6 text-sm text-gray-500">
        <a routerLink="/loans" class="hover:text-primary-600">Loans</a>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ loan()?.id || '...' }}</span>
      </nav>

      <!-- Loading -->
      <div *ngIf="loading()" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Error / Not Found -->
      <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {{ error() }}
        <button (click)="loadLoan()" class="underline ml-2">Retry</button>
      </div>

      <!-- 150+ MORE LINES OF HTML TEMPLATE... -->
      <!-- This makes the file extremely long and hard to maintain -->
    </div>
  `
})
export class LoanDetailComponent implements OnInit {
    // Logic mixed with 180 lines of template above
    private route = inject(ActivatedRoute);
    private loanService = inject(LoanService);
    // ... more logic
}
```

**Problems:**
- ❌ 180+ lines of HTML mixed with TypeScript
- ❌ Hard to navigate between logic and template
- ❌ High token usage when AI analyzes the file
- ❌ No separation of concerns
- ❌ Difficult to test logic in isolation

---

## AFTER: External Template (Best Practice)

### File 1: loan-detail.component.ts (Logic Only)

```typescript
// loan-detail.component.ts - AFTER (Clean logic only)
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanService, BackendLoanResponse } from '../../../core/services/loan.service';
import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../core/services/toast.service';
import { LoanActionsComponent } from '../components/loan-actions/loan-actions.component';
import { LeafletMapComponent } from '../../../shared/components/leaflet-map/leaflet-map.component';

/**
 * Loan Detail Component
 * 
 * Architecture: Logic-Template Separation Pattern
 * - This file contains ONLY business logic and state management
 * - Template is in separate file: loan-detail.component.html
 * - Styles are in separate file: loan-detail.component.css
 */
@Component({
    selector: 'app-loan-detail',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        LoanActionsComponent, 
        LeafletMapComponent
    ],
    // ✅ EXTERNAL TEMPLATE: Reference only
    templateUrl: './loan-detail.component.html',
    styleUrls: ['./loan-detail.component.css']
})
export class LoanDetailComponent implements OnInit {
    // ============================================================================
    // DEPENDENCY INJECTION (Private)
    // ============================================================================
    private route = inject(ActivatedRoute);
    private loanService = inject(LoanService);
    private documentService = inject(DocumentService);
    private toast = inject(ToastService);
    private router = inject(Router);

    // ============================================================================
    // STATE (Signals for fine-grained reactivity)
    // ============================================================================
    
    /** Current loan data */
    loan = signal<BackendLoanResponse | null>(null);
    
    /** Loading state for initial fetch */
    loading = signal(false);
    
    /** Loading state for action operations */
    actionLoading = signal(false);
    
    /** Error message if fetch fails */
    error = signal<string | null>(null);

    // ============================================================================
    // LIFECYCLE
    // ============================================================================
    
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadLoan(id);
            }
        });
    }

    // ============================================================================
    // PUBLIC METHODS (Called from Template)
    // ============================================================================
    
    /**
     * Load loan details by ID
     * @param id Optional loan ID (uses current if not provided)
     */
    loadLoan(id?: string) {
        const loanId = id || this.loan()?.id;
        if (!loanId) return;

        this.loading.set(true);
        this.error.set(null);

        this.loanService.getLoanById(loanId).subscribe({
            next: (data) => {
                this.loan.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err.error?.message || 'Failed to load loan details');
                if (err.status === 404) {
                    this.toast.show('Loan not found', 'error');
                    this.router.navigate(['/loans']);
                }
            }
        });
    }

    /**
     * Handle action from loan-actions component
     */
    handleAction(event: { type: string; payload?: any }, loanId: string) {
        this.actionLoading.set(true);

        const refresh = () => {
            this.actionLoading.set(false);
            this.loadLoan(loanId);
        };

        const onError = (err: any) => {
            this.actionLoading.set(false);
            if (err.status === 409) {
                this.toast.show('Status has changed. Reloading...', 'warning');
                this.loadLoan(loanId);
            } else {
                this.toast.show(err.error?.message || 'Action failed', 'error');
            }
        };

        switch (event.type) {
            case 'SUBMIT':
                this.loanService.submitLoan(loanId).subscribe({
                    next: () => { this.toast.show('Submitted!', 'success'); refresh(); },
                    error: onError
                });
                break;
            case 'APPROVE':
                this.loanService.approveLoan(loanId, 'Approved').subscribe({
                    next: () => { this.toast.show('Approved!', 'success'); refresh(); },
                    error: onError
                });
                break;
            // ... more cases
        }
    }

    /**
     * Get CSS class for status badge
     */
    getStatusBadgeClass(status: string): string {
        const classes: Record<string, string> = {
            'DRAFT': 'bg-gray-100 text-gray-800',
            'SUBMITTED': 'bg-yellow-100 text-yellow-800',
            'APPROVED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'DISBURSED': 'bg-purple-100 text-purple-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    /**
     * Transform backend loan to format expected by loan-actions
     */
    processedLoan(loan: BackendLoanResponse) {
        return {
            id: loan.id,
            status: loan.loanStatus,
            amount: loan.loanAmount
        };
    }

    /**
     * Open document in new tab
     */
    viewDocument(id: string) {
        this.documentService.getDownloadUrl(id).subscribe({
            next: (data) => window.open(data.downloadUrl, '_blank'),
            error: () => this.toast.show('Failed to open document', 'error')
        });
    }

    /**
     * Format document type for display
     */
    formatDocType(type: string): string {
        return type.replace('_', ' ');
    }

    /**
     * Open location in external map
     */
    viewLocationOnMap(loan: BackendLoanResponse) {
        if (loan.latitude && loan.longitude) {
            const url = `https://www.openstreetmap.org/?mlat=${loan.latitude}&mlon=${loan.longitude}#map=15/${loan.latitude}/${loan.longitude}`;
            window.open(url, '_blank');
        }
    }
}
```

### File 2: loan-detail.component.html (Template Only)

```html
<!-- loan-detail.component.html - AFTER (Template only, no logic) -->
<div class="container mx-auto px-4 py-8 max-w-5xl">
    
    <!-- Breadcrumb -->
    <nav class="mb-6 text-sm text-gray-500">
        <a routerLink="/loans" class="hover:text-primary-600">Loans</a>
        <span class="mx-2">/</span>
        <span class="text-gray-900">{{ loan()?.id || '...' }}</span>
    </nav>

    <!-- Loading State -->
    @if (loading()) {
    <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
    }

    <!-- Error State -->
    @if (error()) {
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {{ error() }}
        <button (click)="loadLoan()" class="underline ml-2">Retry</button>
    </div>
    }

    <!-- Main Content -->
    @if (!loading() && loan(); let l) {
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left Column: Status & Timeline -->
        <div class="lg:col-span-1 space-y-6">
            
            <!-- Status Card -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">
                    Current Status
                </h3>
                <div class="flex items-center justify-between">
                    <span [class]="getStatusBadgeClass(l.loanStatus)" 
                          class="px-3 py-1 text-sm font-bold rounded-full">
                        {{ l.loanStatus }}
                    </span>
                    <span class="text-xs text-gray-400">
                        {{ l.updatedAt | date:'medium' }}
                    </span>
                </div>
                
                <!-- Timeline -->
                <div class="mt-6">
                    <div class="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                        <div class="mb-6 ml-6">
                            <span class="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800">
                                <i class="fas fa-file-alt text-blue-600 text-xs"></i>
                            </span>
                            <h3 class="font-medium text-gray-900 dark:text-white">Applied</h3>
                            <p class="text-sm text-gray-500">
                                {{ (l.submittedAt | date:'medium') || 'Pending' }}
                            </p>
                        </div>
                        
                        @if (l.approvedAt) {
                        <div class="mb-6 ml-6">
                            <span class="absolute flex items-center justify-center w-6 h-6 bg-green-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-800">
                                <i class="fas fa-check text-green-600 text-xs"></i>
                            </span>
                            <h3 class="font-medium text-gray-900 dark:text-white">Approved</h3>
                            <p class="text-sm text-gray-500">{{ l.approvedAt | date:'medium' }}</p>
                        </div>
                        }
                    </div>
                </div>
            </div>

            <!-- Actions Card -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wide mb-4">Actions</h3>
                <app-loan-actions 
                    [loan]="processedLoan(l)" 
                    [loading]="actionLoading()"
                    (action)="handleAction($event, l.id)">
                </app-loan-actions>
            </div>
        </div>

        <!-- Right Column: Details -->
        <div class="lg:col-span-2 space-y-6">
            
            <!-- Summary Card -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Loan Details</h2>
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <p class="text-sm text-gray-500">Applicant</p>
                        <p class="font-medium">{{ l.customerName }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Product</p>
                        <p class="font-medium">{{ l.product.productName }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Amount</p>
                        <p class="font-medium text-lg">
                            {{ l.loanAmount | currency:'IDR':'symbol':'1.0-0' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Tenure</p>
                        <p class="font-medium">{{ l.tenor }} Months</p>
                    </div>
                </div>
            </div>

            <!-- Location Card -->
            @if (l.latitude && l.longitude) {
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Application Location</h2>
                    <button (click)="viewLocationOnMap(l)" 
                            class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <i class="fas fa-external-link-alt"></i> View on Map
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-sm text-gray-500">Latitude</p>
                        <p class="font-medium">{{ l.latitude | number:'1.6-6' }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Longitude</p>
                        <p class="font-medium">{{ l.longitude | number:'1.6-6' }}</p>
                    </div>
                </div>
                <div class="h-[200px] rounded-lg overflow-hidden">
                    <app-leaflet-map
                        [defaultLocation]="{ latitude: l.latitude, longitude: l.longitude }"
                        [readonly]="true"
                        [showCoordinates]="false">
                    </app-leaflet-map>
                </div>
            </div>
            }

            <!-- Documents Card -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Documents</h2>

                @if (!l.documents || l.documents.length === 0) {
                <div class="text-sm text-gray-500 italic">
                    No documents uploaded.
                    @if (l.loanStatus === 'DRAFT') {
                    <span class="not-italic text-primary-600 cursor-pointer hover:underline" 
                          routerLink="/loans/apply">Edit in Application</span>
                    }
                </div>
                }

                <div class="space-y-3">
                    @for (doc of l.documents; track doc.id) {
                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                <i class="fas" 
                                   [class.fa-file-alt]="doc.documentType === 'NPWP'" 
                                   [class.fa-id-card]="doc.documentType === 'KTP'" 
                                   [class.fa-users]="doc.documentType === 'KK'"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900">{{ formatDocType(doc.documentType) }}</p>
                                <p class="text-xs text-gray-500">{{ doc.fileName }}</p>
                            </div>
                        </div>
                        <button (click)="viewDocument(doc.id)" 
                                class="text-primary-600 hover:text-primary-800 p-2" 
                                title="View Document">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                    }
                </div>
            </div>
        </div>
    </div>
    }
</div>
```

---

## Benefits of Refactoring

| Aspect | Before (Inline) | After (External) | Improvement |
|--------|-----------------|------------------|-------------|
| **Lines per file** | 350+ lines | ~150 lines (ts) + ~200 lines (html) | Better organization |
| **Token usage** | ~500 tokens per analysis | ~150 tokens per analysis | 70% reduction |
| **Navigation** | Scroll through mixed content | Direct file access | Much faster |
| **Testing** | Hard to isolate logic | Logic in separate file | Easier unit tests |
| **Code review** | Mixed concerns | Single concern per file | Clearer reviews |
| **IDE support** | Limited | Full autocomplete | Better DX |

---

## Key Takeaways

1. **Always use `templateUrl`** for templates > 50 lines
2. **Keep logic in .ts** and presentation in .html
3. **Use signals** for state management
4. **Document public methods** that templates call
5. **Group related code** with clear section comments
