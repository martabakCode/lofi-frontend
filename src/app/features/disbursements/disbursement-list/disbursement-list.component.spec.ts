import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisbursementListComponent } from './disbursement-list.component';
import { LoanService } from '../../../core/services/loan.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('DisbursementListComponent', () => {
    let component: DisbursementListComponent;
    let fixture: ComponentFixture<DisbursementListComponent>;
    let loanServiceMock: jest.Mocked<LoanService>;

    beforeEach(() => {
        loanServiceMock = {
            getLoans: jest.fn().mockReturnValue(of({ content: [], totalElements: 0 }))
        } as unknown as jest.Mocked<LoanService>;

        TestBed.configureTestingModule({
            imports: [DisbursementListComponent],
            providers: [
                provideRouter([]),
                { provide: LoanService, useValue: loanServiceMock }
            ]
        });
        fixture = TestBed.createComponent(DisbursementListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
