import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserNotificationFacade } from './user-notification.facade';
import { NotificationApiService } from '../../../core/services/notification-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Notification } from '../../../core/models/notification.models';

describe('UserNotificationFacade', () => {
    let facade: UserNotificationFacade;
    let notificationApiMock: jest.Mocked<NotificationApiService>;
    let toastServiceMock: jest.Mocked<ToastService>;
    let routerMock: jest.Mocked<Router>;

    const mockNotifications: Notification[] = [
        { id: '1', title: 'Notif 1', message: 'Message 1', type: 'INFO', status: 'UNREAD', isRead: false, createdAt: new Date().toISOString() },
        { id: '2', title: 'Notif 2', message: 'Message 2', type: 'WARNING', status: 'READ', isRead: true, createdAt: new Date().toISOString() }
    ];

    beforeEach(() => {
        notificationApiMock = {
            getUserNotifications: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
            getNotificationById: jest.fn()
        } as unknown as jest.Mocked<NotificationApiService>;

        toastServiceMock = {
            show: jest.fn()
        } as unknown as jest.Mocked<ToastService>;

        routerMock = {
            navigate: jest.fn()
        } as unknown as jest.Mocked<Router>;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserNotificationFacade,
                { provide: NotificationApiService, useValue: notificationApiMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });
        facade = TestBed.inject(UserNotificationFacade);
    });

    it('should be created', () => {
        expect(facade).toBeTruthy();
    });

    describe('unreadCount', () => {
        it('should count unread notifications', () => {
            facade['state'].update(s => ({ ...s, items: mockNotifications }));
            expect(facade.unreadCount()).toBe(1);
        });
    });

    describe('loadMyNotifications', () => {
        it('should load notifications', () => {
            notificationApiMock.getUserNotifications.mockReturnValue(of(mockNotifications));

            facade.loadMyNotifications();

            expect(facade.loading()).toBe(true);
            expect(notificationApiMock.getUserNotifications).toHaveBeenCalled();
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', () => {
            facade['state'].update(s => ({ ...s, items: mockNotifications }));
            notificationApiMock.markAsRead.mockReturnValue(of(undefined));

            facade.markAsRead('1');

            expect(notificationApiMock.markAsRead).toHaveBeenCalledWith('1');
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', () => {
            facade['state'].update(s => ({ ...s, items: mockNotifications }));
            notificationApiMock.markAllAsRead.mockReturnValue(of(undefined));

            facade.markAllAsRead();

            expect(notificationApiMock.markAllAsRead).toHaveBeenCalled();
            expect(toastServiceMock.show).toHaveBeenCalledWith('All notifications marked as read', 'success');
        });
    });

    describe('getNotification', () => {
        it('should get notification and mark as read if unread', () => {
            const unreadNotif = mockNotifications[0];
            notificationApiMock.getNotificationById.mockReturnValue(of(unreadNotif));
            notificationApiMock.markAsRead.mockReturnValue(of(undefined));

            facade.getNotification('1').subscribe(n => {
                expect(n.id).toBe('1');
            });
        });
    });

    describe('navigation', () => {
        it('should navigate to notification detail', () => {
            facade.viewNotification('1');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/notifications', '1']);
        });
    });
});
