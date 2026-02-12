import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AdminNotificationFacade } from './admin-notification.facade';
import { NotificationApiService } from '../../../core/services/notification-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { of } from 'rxjs';
import { Notification, NotificationStats } from '../../../core/models/notification.models';

describe('AdminNotificationFacade', () => {
    let facade: AdminNotificationFacade;
    let notificationApiMock: jest.Mocked<NotificationApiService>;
    let toastServiceMock: jest.Mocked<ToastService>;

    const mockNotifications: Notification[] = [
        { id: '1', title: 'Notif 1', message: 'Message 1', type: 'INFO', status: 'UNREAD', isRead: false, createdAt: new Date().toISOString() },
        { id: '2', title: 'Notif 2', message: 'Message 2', type: 'WARNING', status: 'READ', isRead: true, createdAt: new Date().toISOString() }
    ];

    const mockStats: NotificationStats = {
        totalCount: 100,
        unreadCount: 20,
        readCount: 80
    };

    beforeEach(() => {
        notificationApiMock = {
            getAllNotifications: jest.fn(),
            getNotificationStats: jest.fn(),
            createNotification: jest.fn(),
            bulkMarkAsRead: jest.fn(),
            bulkDelete: jest.fn(),
            deleteNotification: jest.fn()
        } as unknown as jest.Mocked<NotificationApiService>;

        toastServiceMock = {
            show: jest.fn()
        } as unknown as jest.Mocked<ToastService>;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AdminNotificationFacade,
                { provide: NotificationApiService, useValue: notificationApiMock },
                { provide: ToastService, useValue: toastServiceMock }
            ]
        });
        facade = TestBed.inject(AdminNotificationFacade);
    });

    it('should be created', () => {
        expect(facade).toBeTruthy();
    });

    describe('computed properties', () => {
        it('should calculate totalSelected', () => {
            facade['state'].update(s => ({ ...s, selectedIds: ['1', '2'] }));
            expect(facade.totalSelected()).toBe(2);
        });

        it('should calculate isAllSelected', () => {
            facade['state'].update(s => ({ ...s, items: mockNotifications, selectedIds: ['1', '2'] }));
            expect(facade.isAllSelected()).toBe(true);
        });
    });

    describe('loadAllNotifications', () => {
        it('should load all notifications', () => {
            notificationApiMock.getAllNotifications.mockReturnValue(of({
                items: mockNotifications,
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.loadAllNotifications();

            expect(facade.loading()).toBe(true);
            expect(notificationApiMock.getAllNotifications).toHaveBeenCalled();
        });
    });

    describe('loadStats', () => {
        it('should load notification stats', () => {
            notificationApiMock.getNotificationStats.mockReturnValue(of(mockStats));

            facade.loadStats();

            expect(notificationApiMock.getNotificationStats).toHaveBeenCalled();
        });
    });

    describe('createNotification', () => {
        it('should create notification', () => {
            notificationApiMock.createNotification.mockReturnValue(of(mockNotifications[0]));

            facade.createNotification({
                title: 'New',
                message: 'Message',
                type: 'INFO',
                userIds: ['user-1']
            });

            expect(notificationApiMock.createNotification).toHaveBeenCalled();
        });
    });

    describe('selection', () => {
        it('should toggle selection', () => {
            facade.toggleSelection('1');
            expect(facade.selectedIds()).toContain('1');

            facade.toggleSelection('1');
            expect(facade.selectedIds()).not.toContain('1');
        });

        it('should toggle all selection', () => {
            facade['state'].update(s => ({ ...s, items: mockNotifications }));
            
            facade.toggleAllSelection();
            expect(facade.selectedIds().length).toBe(2);

            facade.toggleAllSelection();
            expect(facade.selectedIds().length).toBe(0);
        });
    });

    describe('bulk operations', () => {
        it('should bulk mark as read', () => {
            facade['state'].update(s => ({ ...s, selectedIds: ['1', '2'] }));
            notificationApiMock.bulkMarkAsRead.mockReturnValue(of(undefined));

            facade.bulkMarkAsRead();

            expect(notificationApiMock.bulkMarkAsRead).toHaveBeenCalledWith(['1', '2']);
        });

        it('should skip bulk mark as read if no selection', () => {
            facade.bulkMarkAsRead();
            expect(notificationApiMock.bulkMarkAsRead).not.toHaveBeenCalled();
        });

        it('should bulk delete', () => {
            facade['state'].update(s => ({ ...s, selectedIds: ['1', '2'] }));
            notificationApiMock.bulkDelete.mockReturnValue(of(undefined));

            facade.bulkDelete();

            expect(notificationApiMock.bulkDelete).toHaveBeenCalledWith(['1', '2']);
        });
    });

    describe('deleteNotification', () => {
        it('should delete notification', () => {
            notificationApiMock.deleteNotification.mockReturnValue(of(undefined));

            facade.deleteNotification('1');

            expect(notificationApiMock.deleteNotification).toHaveBeenCalledWith('1');
        });
    });
});
