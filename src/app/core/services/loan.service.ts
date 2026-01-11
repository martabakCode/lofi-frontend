import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models/api.models';

export interface Loan {
    id: string;
    customerName: string;
    productName: string;
    amount: number;
    tenure: number;
    status: string;
    appliedDate: string;
}

@Injectable({
    providedIn: 'root'
})
export class LoanService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/loans`;

    getLoans(params: any): Observable<PaginatedResponse<Loan>> {
        return this.http.get<ApiResponse<PaginatedResponse<Loan>>>(`${this.baseUrl}`, { params }).pipe(
            map(res => res.data)
        );
    }

    getLoanById(id: string): Observable<Loan> {
        return this.http.get<ApiResponse<Loan>>(`${this.baseUrl}/${id}`).pipe(
            map(res => res.data)
        );
    }

    updateLoanStatus(id: string, status: string, notes: string): Observable<Loan> {
        return this.http.put<ApiResponse<Loan>>(`${this.baseUrl}/${id}/approval`, { status, notes }).pipe(
            map(res => res.data)
        );
    }
}
