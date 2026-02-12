import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserFacade } from '../facades/user.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('UserListComponent', () => {
    let component: UserListComponent;
    let fixture: ComponentFixture<UserListComponent>;
    let userFacadeMock: jest.Mocked<UserFacade>;

    beforeEach(() => {
        userFacadeMock = {
            items: signal([]),
            loading: signal(false),
            pagination: signal({ page: 1, pageSize: 10, total: 0, totalPages: 1 }),
            loadUsers: jest.fn(),
            loadFilterOptions: jest.fn()
        } as unknown as jest.Mocked<UserFacade>;

        TestBed.configureTestingModule({
            imports: [UserListComponent],
            providers: [
                provideRouter([]),
                { provide: UserFacade, useValue: userFacadeMock }
            ]
        });
        fixture = TestBed.createComponent(UserListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load users on init', () => {
        fixture.detectChanges();
        expect(userFacadeMock.loadUsers).toHaveBeenCalled();
        expect(userFacadeMock.loadFilterOptions).toHaveBeenCalled();
    });
});
