import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReportService, LoanKpiResponse, SlaReportResponse } from './report.service';
import { environment } from '../../../environments/environment';

describe('ReportService', () => {
    let service: ReportService;
    let httpMock: HttpTestingController;
    const baseUrl = `${environment.apiUrl}/reports`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ReportService]
        });
        service = TestBed.inject(ReportService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getKpis', () => {
        it('should fetch KPIs', () => {
            const mockKpis: LoanKpiResponse = {
                totalLoans: 100,
                totalSubmitted: 50,
                totalReviewed: 30,
                totalApproved: 20,
                totalRejected: 10,
                totalCancelled: 5,
                totalDisbursed: 15,
                totalCompleted: 10,
                loansByProduct: { 'Personal Loan': 50, 'Business Loan': 50 }
            };

            service.getKpis().subscribe(kpis => {
                expect(kpis).toEqual(mockKpis);
            });

            const req = httpMock.expectOne(`${baseUrl}/kpis`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockKpis });
        });
    });

    describe('exportKpis', () => {
        it('should export KPIs as blob', () => {
            const mockBlob = new Blob(['test'], { type: 'application/vnd.ms-excel' });

            service.exportKpis().subscribe(blob => {
                expect(blob).toBeInstanceOf(Blob);
            });

            const req = httpMock.expectOne(`${baseUrl}/kpis/export`);
            expect(req.request.method).toBe('GET');
            expect(req.request.responseType).toBe('blob');
            req.flush(mockBlob);
        });
    });

    describe('getSlaReport', () => {
        it('should fetch SLA report by loan ID', () => {
            const mockReport: SlaReportResponse = {
                loanId: 'loan-123',
                customerName: 'John Doe',
                stages: [
                    {
                        stage: 'SUBMISSION',
                        status: 'COMPLETED',
                        actionBy: 'User A',
                        durationMinutes: 60
                    }
                ],
                totalDurationMinutes: 120
            };

            service.getSlaReport('loan-123').subscribe(report => {
                expect(report).toEqual(mockReport);
            });

            const req = httpMock.expectOne(`${baseUrl}/sla/loan-123`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockReport });
        });
    });

    describe('exportSlaReport', () => {
        it('should export SLA report as blob', () => {
            const mockBlob = new Blob(['test'], { type: 'application/vnd.ms-excel' });

            service.exportSlaReport('loan-123').subscribe(blob => {
                expect(blob).toBeInstanceOf(Blob);
            });

            const req = httpMock.expectOne(`${baseUrl}/sla/loan-123/export`);
            expect(req.request.method).toBe('GET');
            expect(req.request.responseType).toBe('blob');
            req.flush(mockBlob);
        });
    });
});
