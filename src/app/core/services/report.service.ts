import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface LoanKpiResponse {
    totalLoans: number;
    totalSubmitted: number;
    totalReviewed: number;
    totalApproved: number;
    totalRejected: number;
    totalCancelled: number;
    totalDisbursed: number;
    totalCompleted: number;
    loansByProduct: { [key: string]: number };
}

export interface StageSlaInfo {
    stage: string;
    status: string;
    actionBy: string;
    durationMinutes: number;
}

export interface SlaReportResponse {
    loanId: string;
    customerName: string;
    stages: StageSlaInfo[];
    totalDurationMinutes: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReportService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/reports`;

    getKpis(): Observable<LoanKpiResponse> {
        return this.http.get<ApiResponse<LoanKpiResponse>>(`${this.baseUrl}/kpis`)
            .pipe(map(res => res.data));
    }

    exportKpis(): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/kpis/export`, {
            responseType: 'blob'
        });
    }

    getSlaReport(loanId: string): Observable<SlaReportResponse> {
        return this.http.get<ApiResponse<SlaReportResponse>>(`${this.baseUrl}/sla/${loanId}`)
            .pipe(map(res => res.data));
    }

    exportSlaReport(loanId: string): Observable<Blob> {
        return this.http.get(`${this.baseUrl}/sla/${loanId}/export`, {
            responseType: 'blob'
        });
    }
}
