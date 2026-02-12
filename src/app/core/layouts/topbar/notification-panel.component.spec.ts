import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationPanelComponent } from './notification-panel.component';
import { UserNotificationFacade } from '../../../features/notifications/facades/user-notification.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('NotificationPanelComponent', () => {
    let component: NotificationPanelComponent;
    let fixture: ComponentFixture<NotificationPanelComponent>;
    let facadeMock: jest.Mocked<UserNotificationFacade>;

    beforeEach(() => {
        facadeMock = {
            items: signal([]),
            loading: signal(false),
            unreadCount: signal(0),
            loadMyNotifications: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn()
        } as unknown as jest.Mocked<UserNotificationFacade>;

        TestBed.configureTestingModule({
            imports: [NotificationPanelComponent],
            providers: [
                provideRouter([]),
                { provide: UserNotificationFacade, useValue: facadeMock }
            ]
        });
        fixture = TestBed.createComponent(NotificationPanelComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load notifications on init', () => {
        expect(facadeMock.loadMyNotifications).toHaveBeenCalled();
    });

    describe('toggle', () => {
        it('should toggle isOpen state', () => {
            expect(component.isOpen()).toBe(false);
            component.toggle();
            expect(component.isOpen()).toBe(true);
        });
    });

    describe('markAsRead', () => {
        it('should call facade markAsRead', () => {
            component.markAsRead('1');
            expect(facadeMock.markAsRead).toHaveBeenCalledWith('1');
        });
    });

    describe('markAllRead', () => {
        it('should call facade markAllAsRead', () => {
            component.markAllRead();
            expect(facadeMock.markAllAsRead).toHaveBeenCalled();
        });
    });

    describe('formatTime', () => {
        it('should return "Just now" for recent notification', () => {
            const now = new Date().toISOString();
            expect(component.formatTime(now)).toBe('Just now');
        });

        it('should return minutes ago', () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            expect(component.formatTime(fiveMinutesAgo)).toBe('5m ago');
        });

        it('should return hours ago', () => {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            expect(component.formatTime(twoHoursAgo)).toBe('2h ago');
        });

        it('should return days ago', () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
            expect(component.formatTime(threeDaysAgo)).toBe('3d ago');
        });
    });

    describe('getIconClass', () => {
        it('should return loan icon', () => {
            expect(component.getIconClass('LOAN')).toContain('pi-money-bill');
        });

        it('should return payment icon', () => {
            expect(component.getIconClass('PAYMENT')).toContain('pi-wallet');
        });

        it('should return account icon', () => {
            expect(component.getIconClass('ACCOUNT')).toContain('pi-user');
        });

        it('should return system icon', () => {
            expect(component.getIconClass('SYSTEM')).toContain('pi-cog');
        });

        it('should return default bell icon', () => {
            expect(component.getIconClass('OTHER')).toContain('pi-bell');
        });
    });

    describe('hasUnread', () => {
        it('should be true when there are unread notifications', () => {
            facadeMock.unreadCount = signal(5);
            fixture = TestBed.createComponent(NotificationPanelComponent);
            component = fixture.componentInstance;
            expect(component.hasUnread()).toBe(true);
        });

        it('should be false when no unread notifications', () => {
            facadeMock.unreadCount = signal(0);
            fixture = TestBed.createComponent(NotificationPanelComponent);
            component = fixture.componentInstance;
            expect(component.hasUnread()).toBe(false);
        });
    });
});
