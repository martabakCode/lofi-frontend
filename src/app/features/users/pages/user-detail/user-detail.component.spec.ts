import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailComponent } from './user-detail.component';
import { provideRouter } from '@angular/router';
import { UserFacade } from '../../facades/user.facade';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('UserDetailComponent', () => {
    let component: UserDetailComponent;
    let fixture: ComponentFixture<UserDetailComponent>;
    let userFacadeMock: any;

    const createMockUser = () => ({
        id: 'user-1',
        username: 'johndoe',
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        avatar: 'https://example.com/avatar.jpg',
        status: 'Active' as const,
        roles: [
            { id: 'role-1', name: 'ROLE_ADMIN', permissions: [] }
        ],
        branch: {
            id: 'branch-1',
            name: 'Main Branch',
            address: '123 Main St',
            city: 'Jakarta',
            state: 'DKI',
            zipCode: '12345',
            phone: '021-1234567'
        }
    });

    beforeEach(async () => {
        userFacadeMock = {
            getUser: jest.fn(),
            editUser: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [UserDetailComponent],
            providers: [
                provideRouter([]),
                { provide: UserFacade, useValue: userFacadeMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UserDetailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('initial state', () => {
        it('should have empty userId initially', () => {
            expect(component.userId()).toBe('');
        });

        it('should have null user initially', () => {
            expect(component.user()).toBeNull();
        });

        it('should have loading set to false initially', () => {
            expect(component.loading()).toBe(false);
        });

        it('should have null error initially', () => {
            expect(component.error()).toBeNull();
        });

        it('should have default activity items', () => {
            const items = component.activityItems();
            expect(items.length).toBe(3);
        });
    });

    describe('breadcrumbs', () => {
        it('should have correct breadcrumb structure', () => {
            expect(component.breadcrumbs.length).toBe(3);
            expect(component.breadcrumbs[0].label).toBe('Home');
            expect(component.breadcrumbs[1].label).toBe('Users');
            expect(component.breadcrumbs[2].label).toBe('Details');
        });
    });

    describe('header actions', () => {
        it('should have edit action defined', () => {
            expect(component.headerActions.length).toBe(1);
            expect(component.headerActions[0].label).toBe('Edit');
            expect(component.headerActions[0].icon).toBe('pi-pencil');
            expect(component.headerActions[0].variant).toBe('primary');
        });

        it('should call editUser when edit action is clicked', () => {
            const editUserSpy = jest.spyOn(userFacadeMock, 'editUser');
            component.headerActions[0].click();
            expect(editUserSpy).toHaveBeenCalled();
        });
    });

    describe('getInitials', () => {
        it('should return correct initials for full name', () => {
            expect(component.getInitials('John Doe')).toBe('JD');
        });

        it('should return first letter for single name', () => {
            expect(component.getInitials('John')).toBe('J');
        });

        it('should return ?? for empty name', () => {
            expect(component.getInitials('')).toBe('??');
        });

        it('should handle multiple spaces', () => {
            expect(component.getInitials('John   Doe')).toBe('JD');
        });

        it('should handle lowercase names', () => {
            expect(component.getInitials('john doe')).toBe('JD');
        });
    });

    describe('getRoleIconClass', () => {
        it('should return brand main color for any role', () => {
            const role = { name: 'ROLE_ADMIN' };
            expect(component.getRoleIconClass(role)).toBe('text-brand-main');
        });

        it('should handle role string', () => {
            const role = 'ROLE_USER';
            expect(component.getRoleIconClass(role)).toBe('text-brand-main');
        });
    });

    describe('loadUser', () => {
        it('should load user successfully', () => {
            const mockUser = createMockUser();
            userFacadeMock.getUser.mockReturnValue(of(mockUser));

            component.userId.set('user-1');
            component.loadUser();

            expect(component.user()).toEqual(mockUser);
            expect(component.loading()).toBe(false);
            expect(component.error()).toBeNull();
        });

        it('should handle error on load failure', () => {
            userFacadeMock.getUser.mockReturnValue(of(null));

            component.userId.set('user-1');
            component.loadUser();

            expect(component.user()).toBeNull();
            expect(component.loading()).toBe(false);
        });
    });

    describe('editUser', () => {
        it('should call userFacade editUser with userId', () => {
            const editUserSpy = jest.spyOn(userFacadeMock, 'editUser');
            component.userId.set('user-1');

            component.editUser();

            expect(editUserSpy).toHaveBeenCalledWith('user-1');
        });
    });

    describe('backToList', () => {
        it('should navigate to users list', () => {
            const navigateSpy = jest.spyOn(component['router'], 'navigate');

            component.backToList();

            expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/users']);
        });
    });

    describe('user loading state', () => {
        it('should show loading when loading is true', () => {
            component.loading.set(true);
            expect(component.loading()).toBe(true);
        });

        it('should hide loading when loading is false', () => {
            component.loading.set(false);
            expect(component.loading()).toBe(false);
        });
    });

    describe('user error state', () => {
        it('should show error message when error is set', () => {
            component.error.set('Failed to load user');
            expect(component.error()).toBe('Failed to load user');
        });

        it('should clear error when user loads successfully', () => {
            const mockUser = createMockUser();
            component.error.set('Previous error');
            userFacadeMock.getUser.mockReturnValue(of(mockUser));

            component.loadUser();

            expect(component.error()).toBeNull();
        });
    });

    describe('signal updates', () => {
        it('should support user signal updates', () => {
            const mockUser = createMockUser();
            component.user.set(mockUser);
            expect(component.user()).toEqual(mockUser);
        });

        it('should support loading signal updates', () => {
            component.loading.set(true);
            expect(component.loading()).toBe(true);
        });

        it('should support error signal updates', () => {
            component.error.set('Test error');
            expect(component.error()).toBe('Test error');
        });

        it('should support activityItems signal updates', () => {
            const newItems = [{ type: 'success', title: 'New Activity' }];
            component.activityItems.set(newItems as any);
            expect(component.activityItems()).toEqual(newItems);
        });
    });
});
