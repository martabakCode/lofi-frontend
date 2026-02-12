import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authServiceMock: jest.Mocked<AuthService>;

    beforeEach(() => {
        authServiceMock = {
            login: jest.fn().mockReturnValue(of({})),
            loading: signal(false),
            error: signal(null)
        } as unknown as jest.Mocked<AuthService>;

        TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock }
            ]
        });
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have login form', () => {
        expect(component.loginForm).toBeTruthy();
    });

    it('should require username', () => {
        const usernameControl = component.loginForm.get('username');
        expect(usernameControl?.hasError('required')).toBe(true);
    });

    it('should require password', () => {
        const passwordControl = component.loginForm.get('password');
        expect(passwordControl?.hasError('required')).toBe(true);
    });
});
