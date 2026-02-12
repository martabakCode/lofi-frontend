import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationManageComponent } from './notification-manage.component';
import { AdminNotificationFacade } from '../../facades/admin-notification.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('NotificationManageComponent', () => {
    let component: NotificationManageComponent;
    let fixture: ComponentFixture<NotificationManageComponent>;
    let facadeMock: jest.Mocked<AdminNotificationFacade>;

    beforeEach(() => {
        facadeMock = {
            items: signal([]),
            loading: signal(false),
            stats: signal(null),
            selectedIds: signal([]),
            totalSelected: signal(0),
            isAllSelected: signal(false),
            loadAllNotifications: jest.fn(),
            loadStats: jest.fn()
        } as unknown as jest.Mocked<AdminNotificationFacade>;

        TestBed.configureTestingModule({
            imports: [NotificationManageComponent],
            providers: [
                provideRouter([]),
                { provide: AdminNotificationFacade, useValue: facadeMock }
            ]
        });
        fixture = TestBed.createComponent(NotificationManageComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load notifications and stats on init', () => {
        fixture.detectChanges();
        expect(facadeMock.loadAllNotifications).toHaveBeenCalled();
        expect(facadeMock.loadStats).toHaveBeenCalled();
    });
});
