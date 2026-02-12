import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileMenuComponent } from './profile-menu.component';
import { AuthService } from '../../services/auth.service';
import { provideRouter } from '@angular/router';

describe('ProfileMenuComponent', () => {
    let component: ProfileMenuComponent;
    let fixture: ComponentFixture<ProfileMenuComponent>;
    let authServiceMock: jest.Mocked<AuthService>;

    beforeEach(() => {
        authServiceMock = {
            logout: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        TestBed.configureTestingModule({
            imports: [ProfileMenuComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock }
            ]
        });
        fixture = TestBed.createComponent(ProfileMenuComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('toggle', () => {
        it('should toggle isOpen state', () => {
            expect(component.isOpen()).toBe(false);
            component.toggle();
            expect(component.isOpen()).toBe(true);
            component.toggle();
            expect(component.isOpen()).toBe(false);
        });
    });

    describe('getRoleName', () => {
        it('should return role name without ROLE_ prefix', () => {
            fixture.componentRef.setInput('user', { roles: ['ROLE_ADMIN'] });
            expect(component.getRoleName()).toBe('ADMIN');
        });

        it('should return role name for role object', () => {
            fixture.componentRef.setInput('user', { roles: [{ name: 'ROLE_USER' }] });
            expect(component.getRoleName()).toBe('USER');
        });

        it('should handle SUPER_ADMIN', () => {
            fixture.componentRef.setInput('user', { roles: ['ROLE_SUPER_ADMIN'] });
            expect(component.getRoleName()).toBe('SUPER ADMIN');
        });

        it('should return empty string for no user', () => {
            fixture.componentRef.setInput('user', null);
            expect(component.getRoleName()).toBe('');
        });
    });

    describe('getInitials', () => {
        it('should return first letter of fullName', () => {
            fixture.componentRef.setInput('user', { fullName: 'John Doe' });
            expect(component.getInitials()).toBe('J');
        });

        it('should return first letter of username if no fullName', () => {
            fixture.componentRef.setInput('user', { username: 'johndoe' });
            expect(component.getInitials()).toBe('J');
        });

        it('should return G for no user', () => {
            fixture.componentRef.setInput('user', null);
            expect(component.getInitials()).toBe('G');
        });
    });

    describe('logout', () => {
        it('should call auth service logout and navigate', () => {
            const navigateSpy = jest.spyOn(component['router'], 'navigate');
            component.logout();
            expect(authServiceMock.logout).toHaveBeenCalled();
            expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
            expect(component.isOpen()).toBe(false);
        });
    });

    describe('navigateTo', () => {
        it('should navigate and close menu', () => {
            const navigateSpy = jest.spyOn(component['router'], 'navigate');
            component.isOpen.set(true);
            component.navigateTo('/profile');
            expect(navigateSpy).toHaveBeenCalledWith(['/profile']);
            expect(component.isOpen()).toBe(false);
        });
    });

    describe('onDocumentClick', () => {
        it('should close menu when clicking outside', () => {
            component.isOpen.set(true);
            const event = new MouseEvent('click');
            component.onDocumentClick(event);
            expect(component.isOpen()).toBe(false);
        });
    });
});
