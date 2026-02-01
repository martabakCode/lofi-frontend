import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

// Backend DTOs
export interface ProductResponse {
    id: string;
    productCode: string;
    productName: string;
    description: string;
    interestRate: number;
    adminFee: number;
    minTenor: number;
    maxTenor: number;
    minLoanAmount: number;
    maxLoanAmount: number;
    isActive: boolean;
}

export interface AIAnalysis {
    confidence: number;
    summary: string;
    riskFlags: string[];
    reviewNotes: string[];
    limitations: string[];
}

export interface BackendLoanResponse {
    id: string;
    customerId: string; // Added based on assumed backend response, check if needed
    customerName: string;
    product: ProductResponse;
    loanAmount: number;
    tenor: number;
    loanStatus: string;
    currentStage: string;
    submittedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    disbursedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    documents?: DocumentResponse[];
    disbursementReference?: string;
    aiAnalysis?: AIAnalysis;
    longitude?: number;
    latitude?: number;
}

export interface DocumentResponse {
    id: string;
    fileName: string;
    documentType: string;
    uploadedAt: string;
}

// Request DTOs
export interface LoanRequest {
    productId: string;
    loanAmount: number;
    tenor: number;
}

export interface MarketingLoanApplicationRequest {
    fullName: string;
    email: string;
    username: string;
    phoneNumber: string;
    branchId: string;
    incomeSource: string;
    incomeType: string;
    monthlyIncome: number;
    age: number;
    nik: string;
    dateOfBirth: string;
    placeOfBirth: string;
    city: string;
    address: string;
    province: string;
    district: string;
    subDistrict: string;
    postalCode: string;
    gender: string;
    maritalStatus: string;
    education: string;
    occupation: string;
    productId: string;
    loanAmount: number;
    tenor: number;
    longitude?: number;
    latitude?: number;
}

// UI Model (matches current component usage)
export interface Loan {
    id: string;
    customerName: string;
    productName: string;
    amount: number;
    tenure: number;
    status: string;
    appliedDate: string;
    stage?: string;
}

@Injectable({
    providedIn: 'root'
})
export class LoanService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/loans`;

    getLoans(params: any): Observable<PaginatedResponse<Loan>> {
        return this.http.get<ApiResponse<any>>(`${this.baseUrl}`, { params }).pipe(
            map(res => {
                const data = res.data;
                const items = data.items || [];
                const uiContent: Loan[] = items.map((l: any) => ({
                    id: l.id,
                    customerId: l.customerId,
                    customerName: l.customerName,
                    productName: l.product ? l.product.productName : 'Unknown Product',
                    amount: l.loanAmount,
                    tenure: l.tenor,
                    status: l.loanStatus,
                    appliedDate: l.submittedAt || l.createdAt || '',
                    stage: l.currentStage
                }));

                return {
                    content: uiContent,
                    totalElements: data.meta?.totalItems || 0,
                    totalPages: data.meta?.totalPages || 0,
                    size: data.meta?.size || 0,
                    number: data.meta?.page || 0
                };
            })
        );
    }

    getLoanById(id: string): Observable<BackendLoanResponse> {
        return this.http.get<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}`).pipe(
            map(res => res.data)
        );
    }

    applyLoan(request: LoanRequest): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}`, request).pipe(
            map(res => res.data)
        );
    }

    applyLoanOnBehalf(request: MarketingLoanApplicationRequest): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/marketing/apply-on-behalf`, request).pipe(
            map(res => res.data)
        );
    }

    submitLoan(id: string): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}/submit`, {}).pipe(
            map(res => res.data)
        );
    }

    reviewLoan(id: string, notes: string): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}/review`, { notes }).pipe(
            map(res => res.data)
        );
    }

    approveLoan(id: string, notes: string): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}/approve`, { notes }).pipe(
            map(res => res.data)
        );
    }

    rejectLoan(id: string, reason: string): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}/reject`, { reason }).pipe(
            map(res => res.data)
        );
    }

    cancelLoan(id: string, reason: string = 'Cancelled by user'): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}/cancel`, { reason }).pipe(
            map(res => res.data)
        );
    }

    rollbackLoan(id: string, notes: string): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}/rollback`, { notes }).pipe(
            map(res => res.data)
        );
    }

    disburseLoan(id: string, disbursementDate: string, referenceNumber: string): Observable<BackendLoanResponse> {
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}/disburse`, {
            disbursementDate,
            referenceNumber
        }).pipe(
            map(res => res.data)
        );
    }

    completeLoan(id: string): Observable<BackendLoanResponse> {
        // Customer triggers this to confirm fund receipt
        return this.http.post<ApiResponse<BackendLoanResponse>>(`${this.baseUrl}/${id}/complete`, {}).pipe(
            map(res => res.data)
        );
    }

    getProducts(): Observable<PaginatedResponse<ProductResponse>> {
        return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/products`).pipe(
            map(res => {
                const data = res.data;
                return {
                    content: data.items || [],
                    totalElements: data.meta?.totalItems || 0,
                    totalPages: data.meta?.totalPages || 0,
                    size: data.meta?.size || 0,
                    number: data.meta?.page || 0
                };
            })
        );
    }
}
