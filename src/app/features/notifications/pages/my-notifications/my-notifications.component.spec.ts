import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyNotificationsComponent } from './my-notifications.component';
import { UserNotificationFacade } from '../../facades/user-notification.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('MyNotificationsComponent', () => {
    let component: MyNotificationsComponent;
    let fixture: ComponentFixture<MyNotificationsComponent>;
    let facadeMock: jest.Mocked<UserNotificationFacade>;

    beforeEach(() => {
        facadeMock = {
            items: signal([]),
            loading: signal(false),
            unreadCount: signal(0),
            loadMyNotifications: jest.fn()
        } as unknown as jest.Mocked<UserNotificationFacade>;

        TestBed.configureTestingModule({
            imports: [MyNotificationsComponent],
            providers: [
                provideRouter([]),
                { provide: UserNotificationFacade, useValue: facadeMock }
            ]
        });
        fixture = TestBed.createComponent(MyNotificationsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load notifications on init', () => {
        fixture.detectChanges();
        expect(facadeMock.loadMyNotifications).toHaveBeenCalled();
    });
});
