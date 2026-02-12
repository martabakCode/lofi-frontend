import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationApiService } from './notification-api.service';
import { environment } from '../../../environments/environment';
import { Notification, NotificationFilters, NotificationStats, NotificationCreateRequest } from '../models/notification.models';

describe('NotificationApiService', () => {
    let service: NotificationApiService;
    let httpMock: HttpTestingController;
    const baseUrl = `${environment.apiUrl}/notifications`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NotificationApiService]
        });
        service = TestBed.inject(NotificationApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getUserNotifications', () => {
        it('should fetch user notifications', () => {
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    title: 'Test',
                    message: 'Test message',
                    type: 'INFO',
                    status: 'UNREAD',
                    createdAt: new Date().toISOString()
                }
            ];

            service.getUserNotifications().subscribe(notifications => {
                expect(notifications).toEqual(mockNotifications);
            });

            const req = httpMock.expectOne(`${baseUrl}`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockNotifications });
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', () => {
            service.markAsRead('1').subscribe(() => {
                expect(true).toBe(true);
            });

            const req = httpMock.expectOne(`${baseUrl}/1/read`);
            expect(req.request.method).toBe('PUT');
            req.flush({});
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', () => {
            service.markAllAsRead().subscribe(() => {
                expect(true).toBe(true);
            });

            const req = httpMock.expectOne(`${baseUrl}/mark-all-read`);
            expect(req.request.method).toBe('PUT');
            req.flush({});
        });
    });

    describe('getAllNotifications', () => {
        it('should fetch all notifications with filters', () => {
            const filters: NotificationFilters = {
                search: 'test',
                type: 'INFO',
                status: 'UNREAD'
            };

            const mockResponse = {
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: 10,
                number: 0
            };

            service.getAllNotifications(1, 10, filters).subscribe(response => {
                expect(response).toBeTruthy();
            });

            const req = httpMock.expectOne(req => req.url === `${baseUrl}`);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('page')).toBe('0');
            expect(req.request.params.get('size')).toBe('10');
            expect(req.request.params.get('search')).toBe('test');
            expect(req.request.params.get('type')).toBe('INFO');
            expect(req.request.params.get('status')).toBe('UNREAD');
            req.flush({ data: mockResponse });
        });

        it('should fetch all notifications without optional filters', () => {
            const filters: NotificationFilters = {};

            const mockResponse = {
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: 10,
                number: 0
            };

            service.getAllNotifications(1, 10, filters).subscribe(response => {
                expect(response).toBeTruthy();
            });

            const req = httpMock.expectOne(req => req.url === `${baseUrl}`);
            expect(req.request.params.get('page')).toBe('0');
            expect(req.request.params.get('size')).toBe('10');
            expect(req.request.params.has('search')).toBe(false);
            req.flush({ data: mockResponse });
        });
    });

    describe('getNotificationById', () => {
        it('should fetch notification by ID', () => {
            const mockNotification: Notification = {
                id: '1',
                title: 'Test',
                message: 'Test message',
                type: 'INFO',
                status: 'UNREAD',
                createdAt: new Date().toISOString()
            };

            service.getNotificationById('1').subscribe(notification => {
                expect(notification).toEqual(mockNotification);
            });

            const req = httpMock.expectOne(`${baseUrl}/1`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockNotification });
        });
    });

    describe('deleteNotification', () => {
        it('should delete notification', () => {
            service.deleteNotification('1').subscribe(() => {
                expect(true).toBe(true);
            });

            const req = httpMock.expectOne(`${baseUrl}/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush({});
        });
    });

    describe('getNotificationStats', () => {
        it('should fetch notification stats', () => {
            const mockStats: NotificationStats = {
                totalCount: 100,
                unreadCount: 20,
                readCount: 80
            };

            service.getNotificationStats().subscribe(stats => {
                expect(stats).toEqual(mockStats);
            });

            const req = httpMock.expectOne(`${baseUrl}/stats`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockStats });
        });
    });

    describe('createNotification', () => {
        it('should create notification', () => {
            const request: NotificationCreateRequest = {
                title: 'Test',
                message: 'Test message',
                type: 'INFO',
                userIds: ['user-1', 'user-2']
            };

            const mockNotification: Notification = {
                id: '1',
                title: 'Test',
                message: 'Test message',
                type: 'INFO',
                status: 'UNREAD',
                createdAt: new Date().toISOString()
            };

            service.createNotification(request).subscribe(notification => {
                expect(notification).toEqual(mockNotification);
            });

            const req = httpMock.expectOne(`${baseUrl}`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(request);
            req.flush({ data: mockNotification });
        });
    });

    describe('bulkMarkAsRead', () => {
        it('should mark multiple notifications as read', () => {
            const ids = ['1', '2', '3'];

            service.bulkMarkAsRead(ids).subscribe(() => {
                expect(true).toBe(true);
            });

            const req = httpMock.expectOne(`${baseUrl}/bulk-read`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual({ notificationIds: ids });
            req.flush({});
        });
    });

    describe('bulkDelete', () => {
        it('should delete multiple notifications', () => {
            const ids = ['1', '2', '3'];

            service.bulkDelete(ids).subscribe(() => {
                expect(true).toBe(true);
            });

            const req = httpMock.expectOne(`${baseUrl}/bulk-delete`);
            expect(req.request.method).toBe('DELETE');
            expect(req.request.body).toEqual({ notificationIds: ids });
            req.flush({});
        });
    });

    describe('getNotificationsByUser', () => {
        it('should fetch notifications by user ID', () => {
            const mockResponse = {
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: 10,
                number: 0
            };

            service.getNotificationsByUser('user-1', 1, 10).subscribe(response => {
                expect(response).toBeTruthy();
            });

            const req = httpMock.expectOne(req => req.url === `${baseUrl}`);
            expect(req.request.method).toBe('GET');
            expect(req.request.params.get('userId')).toBe('user-1');
            expect(req.request.params.get('page')).toBe('0');
            expect(req.request.params.get('size')).toBe('10');
            req.flush({ data: mockResponse });
        });
    });
});
