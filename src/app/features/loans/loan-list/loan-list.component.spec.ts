import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanListComponent } from './loan-list.component';
import { LoanFacade } from '../../../core/facades/loan.facade';
import { ToastService } from '../../../core/services/toast.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('LoanListComponent', () => {
    let component: LoanListComponent;
    let fixture: ComponentFixture<LoanListComponent>;
    let loanFacadeMock: jest.Mocked<LoanFacade>;
    let toastServiceMock: jest.Mocked<ToastService>;

    beforeEach(() => {
        loanFacadeMock = {
            loans: signal([]),
            loading: signal(false),
            error: signal(null),
            pagination: signal({ page: 1, pageSize: 10, total: 0, totalPages: 1 }),
            sort: signal({ field: 'createdAt', direction: 'desc' }),
            filters: signal({}),
            searchQuery: signal(''),
            loadLoans: jest.fn(),
            setPage: jest.fn(),
            setPageSize: jest.fn(),
            setSort: jest.fn(),
            setSearch: jest.fn(),
            setFilter: jest.fn(),
            clearFilters: jest.fn()
        } as unknown as jest.Mocked<LoanFacade>;

        toastServiceMock = {
            show: jest.fn()
        } as unknown as jest.Mocked<ToastService>;

        TestBed.configureTestingModule({
            imports: [LoanListComponent],
            providers: [
                provideRouter([]),
                { provide: LoanFacade, useValue: loanFacadeMock },
                { provide: ToastService, useValue: toastServiceMock }
            ]
        });
        fixture = TestBed.createComponent(LoanListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load loans on init', () => {
        fixture.detectChanges();
        expect(loanFacadeMock.loadLoans).toHaveBeenCalled();
    });
});
