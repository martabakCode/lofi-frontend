import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../core/services/auth.service';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ResetPasswordComponent', () => {
    let component: ResetPasswordComponent;
    let fixture: ComponentFixture<ResetPasswordComponent>;
    let authServiceMock: jest.Mocked<AuthService>;

    beforeEach(() => {
        authServiceMock = {
            resetPassword: jest.fn().mockReturnValue(of({})),
            loading: signal(false),
            error: signal(null)
        } as unknown as jest.Mocked<AuthService>;

        TestBed.configureTestingModule({
            imports: [ResetPasswordComponent],
            providers: [
                provideRouter([]),
                { 
                    provide: ActivatedRoute, 
                    useValue: { queryParams: of({ token: 'test-token' }) } 
                },
                { provide: AuthService, useValue: authServiceMock }
            ]
        });
        fixture = TestBed.createComponent(ResetPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should require password', () => {
        const passwordControl = component.resetForm.get('password');
        expect(passwordControl?.hasError('required')).toBe(true);
    });

    it('should require confirm password', () => {
        const confirmControl = component.resetForm.get('confirmPassword');
        expect(confirmControl?.hasError('required')).toBe(true);
    });
});
