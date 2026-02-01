import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoanService, BackendLoanResponse, LoanRequest } from './loan.service';
import { environment } from '../../../environments/environment';

describe('LoanService', () => {
    let service: LoanService;
    let httpMock: HttpTestingController;

    const mockLoan: BackendLoanResponse = {
        id: 'loan-1',
        customerId: 'cust-1',
        customerName: 'John Doe',
        product: {
            id: 'prod-1',
            productCode: 'PL-001',
            productName: 'Personal Loan',
            description: 'Personal loan description',
            interestRate: 10.5,
            adminFee: 50000,
            minTenor: 6,
            maxTenor: 24,
            minLoanAmount: 1000000,
            maxLoanAmount: 50000000,
            isActive: true
        },
        loanAmount: 5000000,
        tenor: 12,
        loanStatus: 'SUBMITTED',
        currentStage: 'MARKETING',
        submittedAt: '2024-01-01T00:00:00Z'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [LoanService]
        });

        service = TestBed.inject(LoanService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getLoans', () => {
        it('should fetch paginated loans', (done) => {
            const params = { page: 0, size: 10 };
            const mockResponse = {
                items: [mockLoan],
                meta: {
                    page: 0,
                    size: 10,
                    totalItems: 1,
                    totalPages: 1
                }
            };

            service.getLoans(params).subscribe(response => {
                expect(response.content).toHaveLength(1);
                expect(response.content[0].id).toBe('loan-1');
                done();
            });

            const req = httpMock.expectOne(
                `${environment.apiUrl}/loans?page=0&size=10`
            );
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockResponse });
        });
    });

    describe('getLoanById', () => {
        it('should fetch loan by id', (done) => {
            service.getLoanById('loan-1').subscribe(loan => {
                expect(loan.id).toBe('loan-1');
                expect(loan.customerName).toBe('John Doe');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/loans/loan-1`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockLoan });
        });
    });

    describe('applyLoan', () => {
        it('should create new loan via applyLoan', (done) => {
            const newLoanReq: LoanRequest = {
                productId: 'prod-1',
                loanAmount: 10000000,
                tenor: 24
            };

            service.applyLoan(newLoanReq).subscribe(loan => {
                expect(loan.customerName).toBe('John Doe');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/loans`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newLoanReq);
            req.flush({ data: mockLoan });
        });
    });

    describe('approveLoan', () => {
        it('should approve loan with notes', (done) => {
            const notes = 'Approved by manager';

            service.approveLoan('loan-1', notes).subscribe(loan => {
                expect(loan.loanStatus).toBe('SUBMITTED');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/loans/loan-1/approve`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ notes });
            req.flush({ data: mockLoan });
        });
    });

    describe('rollbackLoan', () => {
        it('should rollback loan with notes', (done) => {
            const notes = 'Need more documents';

            service.rollbackLoan('loan-1', notes).subscribe(loan => {
                expect(loan.id).toBe('loan-1');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/loans/loan-1/rollback`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ notes });
            req.flush({ data: mockLoan });
        });
    });
});
