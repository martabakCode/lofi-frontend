import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../services/auth.service';
import { UserNotificationFacade } from '../../../features/notifications/facades/user-notification.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let authServiceMock: jest.Mocked<AuthService>;
    let notificationFacadeMock: jest.Mocked<UserNotificationFacade>;

    beforeEach(() => {
        authServiceMock = {
            isAuthenticated: jest.fn().mockReturnValue(true),
            getUserRoles: jest.fn().mockReturnValue(['ROLE_ADMIN']),
            hasPermission: jest.fn().mockReturnValue(true)
        } as unknown as jest.Mocked<AuthService>;

        notificationFacadeMock = {
            loadMyNotifications: jest.fn()
        } as unknown as jest.Mocked<UserNotificationFacade>;

        TestBed.configureTestingModule({
            imports: [SidebarComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
                { provide: UserNotificationFacade, useValue: notificationFacadeMock }
            ]
        });
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load notifications on init if authenticated', () => {
        expect(notificationFacadeMock.loadMyNotifications).toHaveBeenCalled();
    });

    describe('toggleCollapse', () => {
        it('should toggle collapse state', () => {
            expect(component.isCollapsed()).toBe(false);
            component.toggleCollapse();
            expect(component.isCollapsed()).toBe(true);
        });

        it('should emit toggle event', () => {
            const spy = jest.spyOn(component.onToggleCollapse, 'emit');
            component.toggleCollapse();
            expect(spy).toHaveBeenCalledWith(true);
        });
    });

    describe('isAdmin', () => {
        it('should return true for ROLE_ADMIN', () => {
            authServiceMock.getUserRoles.mockReturnValue(['ROLE_ADMIN']);
            expect(component.isAdmin()).toBe(true);
        });

        it('should return true for ROLE_SUPER_ADMIN', () => {
            authServiceMock.getUserRoles.mockReturnValue(['ROLE_SUPER_ADMIN']);
            expect(component.isAdmin()).toBe(true);
        });

        it('should return false for non-admin roles', () => {
            authServiceMock.getUserRoles.mockReturnValue(['ROLE_USER']);
            expect(component.isAdmin()).toBe(false);
        });
    });

    describe('hasAnyRole', () => {
        it('should return true when user has any of the roles', () => {
            authServiceMock.getUserRoles.mockReturnValue(['ROLE_ADMIN', 'ROLE_USER']);
            expect(component.hasAnyRole(['ROLE_ADMIN'])).toBe(true);
        });

        it('should return false when user has none of the roles', () => {
            authServiceMock.getUserRoles.mockReturnValue(['ROLE_USER']);
            expect(component.hasAnyRole(['ROLE_ADMIN'])).toBe(false);
        });
    });

    describe('hasPermission', () => {
        it('should check permission', () => {
            component.hasPermission('CREATE_USER');
            expect(authServiceMock.hasPermission).toHaveBeenCalledWith('CREATE_USER');
        });
    });
});
