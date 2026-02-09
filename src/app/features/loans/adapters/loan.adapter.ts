import { BackendLoanResponse, Loan } from '../../../core/services/loan.service';
import { LoanVM } from '../models/loan.models';

export class LoanAdapter {
    /**
     * Transform BackendLoanResponse (from getLoanById) to LoanVM
     */
    static toView(dto: BackendLoanResponse): LoanVM {
        return {
            id: dto.id,
            customerId: dto.customerId || '',
            customerName: dto.customerName,
            customerEmail: dto.customerId || '', // Keep legacy mapping for now if needed, though we should probably check if email is available
            productId: dto.product?.id || '',
            productName: dto.product?.productName || 'Unknown Product',
            amount: dto.loanAmount,
            tenor: dto.tenor,
            status: dto.loanStatus as any,
            appliedDate: dto.submittedAt || dto.createdAt || '',
            submittedAt: dto.submittedAt,
            approvedAt: dto.approvedAt,
            rejectedAt: dto.rejectedAt,
            disbursedAt: dto.disbursedAt,
            completedAt: dto.disbursedAt, // Map disbursed as completed for UI
            updatedAt: dto.updatedAt || dto.createdAt || '',
            latitude: dto.latitude,
            longitude: dto.longitude,
            documents: dto.documents?.map(doc => ({
                id: doc.id,
                documentType: doc.documentType,
                fileName: doc.fileName
            })),
            amountLabel: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(dto.loanAmount),
            tenorLabel: `${dto.tenor} months`,
            statusLabel: dto.loanStatus.replace(/_/g, ' '),
            statusVariant: this.getStatusVariant(dto.loanStatus)
        };
    }

    /**
     * Transform Loan (UI model from getLoans) to LoanVM
     */
    static fromLoanList(loan: Loan): LoanVM {
        return {
            id: loan.id,
            customerId: loan.customerId,
            customerName: loan.customerName,
            customerEmail: '', // Not available in list response
            productId: '',
            productName: loan.productName,
            amount: loan.amount,
            tenor: loan.tenure,
            status: loan.status as any,
            appliedDate: loan.appliedDate,
            submittedAt: undefined,
            approvedAt: undefined,
            rejectedAt: undefined,
            disbursedAt: undefined,
            completedAt: undefined,
            updatedAt: loan.appliedDate,
            latitude: undefined,
            longitude: undefined,
            documents: [],
            amountLabel: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(loan.amount),
            tenorLabel: `${loan.tenure} months`,
            statusLabel: loan.status.replace(/_/g, ' '),
            statusVariant: this.getStatusVariant(loan.status)
        };
    }

    /**
     * Transform list of Loans to LoanVMs
     */
    static toViewList(loans: Loan[]): LoanVM[] {
        return loans.map(loan => this.fromLoanList(loan));
    }

    private static getStatusVariant(status: string): LoanVM['statusVariant'] {
        switch (status.toUpperCase()) {
            case 'APPROVED':
            case 'DISBURSED':
            case 'COMPLETED':
                return 'SUCCESS';
            case 'SUBMITTED':
            case 'REVIEWED':
                return 'WARNING';
            case 'REJECTED':
            case 'CANCELLED':
                return 'ERROR';
            case 'DRAFT':
                return 'INFO';
            default:
                return 'DEFAULT';
        }
    }
}
