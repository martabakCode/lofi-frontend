import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('MainLayoutComponent', () => {
    let component: MainLayoutComponent;
    let fixture: ComponentFixture<MainLayoutComponent>;
    let authServiceMock: jest.Mocked<AuthService>;
    let themeServiceMock: jest.Mocked<ThemeService>;
    let notificationServiceMock: jest.Mocked<NotificationService>;

    beforeEach(() => {
        authServiceMock = {
            currentUser: signal(null),
            logout: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        themeServiceMock = {
            isDarkMode: signal(false)
        } as unknown as jest.Mocked<ThemeService>;

        notificationServiceMock = {
            requestPermission: jest.fn()
        } as unknown as jest.Mocked<NotificationService>;

        TestBed.configureTestingModule({
            imports: [MainLayoutComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
                { provide: ThemeService, useValue: themeServiceMock },
                { provide: NotificationService, useValue: notificationServiceMock }
            ]
        });
        fixture = TestBed.createComponent(MainLayoutComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should request notification permission on init', () => {
        fixture.detectChanges();
        expect(notificationServiceMock.requestPermission).toHaveBeenCalled();
    });

    describe('sidebar', () => {
        it('should toggle sidebar', () => {
            expect(component.isSidebarOpen()).toBe(false);
            component.toggleSidebar();
            expect(component.isSidebarOpen()).toBe(true);
            component.toggleSidebar();
            expect(component.isSidebarOpen()).toBe(false);
        });

        it('should close sidebar', () => {
            component.isSidebarOpen.set(true);
            component.closeSidebar();
            expect(component.isSidebarOpen()).toBe(false);
        });

        it('should handle sidebar collapse', () => {
            component.onSidebarToggleCollapse(true);
            expect(component.isSidebarCollapsed()).toBe(true);
            component.onSidebarToggleCollapse(false);
            expect(component.isSidebarCollapsed()).toBe(false);
        });
    });

    describe('logout', () => {
        it('should call auth service logout', () => {
            component.logout();
            expect(authServiceMock.logout).toHaveBeenCalled();
        });
    });
});
