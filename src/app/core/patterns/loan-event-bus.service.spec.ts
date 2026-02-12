import { TestBed } from '@angular/core/testing';
import { LoanEventBus } from './loan-event-bus.service';
import { take } from 'rxjs/operators';

describe('LoanEventBus', () => {
    let service: LoanEventBus;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LoanEventBus]
        });
        service = TestBed.inject(LoanEventBus);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('emitLoanApplied', () => {
        it('should emit loan applied event with loan ID', (done) => {
            const loanId = 'loan-123';

            service.loanApplied$.pipe(take(1)).subscribe(id => {
                expect(id).toBe(loanId);
                done();
            });

            service.emitLoanApplied(loanId);
        });

        it('should also emit loan updated event', (done) => {
            service.loanUpdated$.pipe(take(1)).subscribe(() => {
                expect(true).toBe(true);
                done();
            });

            service.emitLoanApplied('loan-123');
        });
    });

    describe('emitLoanUpdated', () => {
        it('should emit loan updated event', (done) => {
            service.loanUpdated$.pipe(take(1)).subscribe(() => {
                expect(true).toBe(true);
                done();
            });

            service.emitLoanUpdated();
        });
    });

    describe('multiple subscribers', () => {
        it('should notify all subscribers', () => {
            const subscriber1 = jest.fn();
            const subscriber2 = jest.fn();

            service.loanApplied$.subscribe(subscriber1);
            service.loanApplied$.subscribe(subscriber2);

            service.emitLoanApplied('loan-123');

            expect(subscriber1).toHaveBeenCalledWith('loan-123');
            expect(subscriber2).toHaveBeenCalledWith('loan-123');
        });
    });
});
