export interface LoanResponse {
    id: string;
    customerName: string;
    customerEmail: string;
    productId: string;
    productName: string;
    loanAmount: number;
    tenor: number;
    loanStatus: LoanStatus;
    appliedDate: string;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    disbursedAt?: string;
    completedAt?: string;
    updatedAt: string;
    latitude?: number;
    longitude?: number;
    documents?: LoanDocument[];
}

export interface LoanDocument {
    id: string;
    documentType: string;
    fileName: string;
}

export type LoanStatus =
    | 'DRAFT'
    | 'SUBMITTED'
    | 'REVIEWED'
    | 'APPROVED'
    | 'REJECTED'
    | 'DISBURSED'
    | 'COMPLETED'
    | 'CANCELLED';

export interface LoanVM {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    productId: string;
    productName: string;
    amount: number;
    tenor: number;
    status: LoanStatus;
    appliedDate: string;
    submittedAt?: string;
    approvedAt?: string;
    rejectedAt?: string;
    disbursedAt?: string;
    completedAt?: string;
    updatedAt: string;
    latitude?: number;
    longitude?: number;
    documents?: LoanDocument[];
    // UI helper fields
    amountLabel: string;
    tenorLabel: string;
    statusLabel: string;
    statusVariant: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO' | 'DEFAULT';
}

export interface LoanStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    disbursed: number;
    completed: number;
}
