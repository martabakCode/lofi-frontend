import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ForgotPasswordComponent', () => {
    let component: ForgotPasswordComponent;
    let fixture: ComponentFixture<ForgotPasswordComponent>;
    let authServiceMock: jest.Mocked<AuthService>;

    beforeEach(() => {
        authServiceMock = {
            forgotPassword: jest.fn().mockReturnValue(of({})),
            loading: signal(false),
            error: signal(null)
        } as unknown as jest.Mocked<AuthService>;

        TestBed.configureTestingModule({
            imports: [ForgotPasswordComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock }
            ]
        });
        fixture = TestBed.createComponent(ForgotPasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should require email', () => {
        const emailControl = component.forgotForm.get('email');
        expect(emailControl?.hasError('required')).toBe(true);
    });
});
