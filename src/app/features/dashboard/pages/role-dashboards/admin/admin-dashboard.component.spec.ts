import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { LoanService } from '../../../../../core/services/loan.service';
import { ProductService } from '../../../../../features/products/services/product.service';
import { RbacService } from '../../../../../core/services/rbac.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('AdminDashboardComponent', () => {
    let component: AdminDashboardComponent;
    let fixture: ComponentFixture<AdminDashboardComponent>;
    let loanServiceMock: jest.Mocked<LoanService>;
    let productServiceMock: jest.Mocked<ProductService>;
    let rbacServiceMock: jest.Mocked<RbacService>;
    let toastServiceMock: jest.Mocked<ToastService>;

    beforeEach(() => {
        loanServiceMock = {
            getLoans: jest.fn().mockReturnValue(of({ content: [], totalElements: 0 }))
        } as unknown as jest.Mocked<LoanService>;

        productServiceMock = {
            getProducts: jest.fn().mockReturnValue(of({ items: [] }))
        } as unknown as jest.Mocked<ProductService>;

        rbacServiceMock = {
            getUsers: jest.fn().mockReturnValue(of({ items: [] }))
        } as unknown as jest.Mocked<RbacService>;

        toastServiceMock = {
            show: jest.fn()
        } as unknown as jest.Mocked<ToastService>;

        TestBed.configureTestingModule({
            imports: [AdminDashboardComponent],
            providers: [
                provideRouter([]),
                { provide: LoanService, useValue: loanServiceMock },
                { provide: ProductService, useValue: productServiceMock },
                { provide: RbacService, useValue: rbacServiceMock },
                { provide: ToastService, useValue: toastServiceMock }
            ]
        });
        fixture = TestBed.createComponent(AdminDashboardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load data on init', () => {
        fixture.detectChanges();
        expect(loanServiceMock.getLoans).toHaveBeenCalled();
        expect(productServiceMock.getProducts).toHaveBeenCalled();
        expect(rbacServiceMock.getUsers).toHaveBeenCalled();
    });

    describe('navigation', () => {
        it('should navigate to path', () => {
            const navigateSpy = jest.spyOn(component['router'], 'navigate');
            component.navigateTo('/dashboard/users');
            expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/users']);
        });
    });
});
