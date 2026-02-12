import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserFacade } from './user.facade';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { User, Branch, Role } from '../../../core/models/rbac.models';

describe('UserFacade', () => {
    let facade: UserFacade;
    let rbacServiceMock: jest.Mocked<RbacService>;
    let toastServiceMock: jest.Mocked<ToastService>;
    let routerMock: jest.Mocked<Router>;

    const mockUsers: User[] = [
        { id: '1', fullName: 'User A', email: 'a@test.com', status: 'Active', roles: [], branch: null, username: 'usera' },
        { id: '2', fullName: 'User B', email: 'b@test.com', status: 'Inactive', roles: [], branch: null, username: 'userb' }
    ];

    const mockBranches: Branch[] = [
        { id: '1', name: 'Branch A', address: 'Address A', phone: '123', status: 'Active', createdAt: new Date().toISOString() }
    ];

    const mockRoles: Role[] = [
        { id: '1', name: 'ROLE_ADMIN', description: 'Admin', status: 'Active', permissions: [], createdAt: new Date().toISOString() }
    ];

    beforeEach(() => {
        rbacServiceMock = {
            getUsers: jest.fn(),
            getUserById: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            getAllBranches: jest.fn(),
            getAllRoles: jest.fn()
        } as unknown as jest.Mocked<RbacService>;

        toastServiceMock = {
            show: jest.fn()
        } as unknown as jest.Mocked<ToastService>;

        routerMock = {
            navigate: jest.fn()
        } as unknown as jest.Mocked<Router>;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                UserFacade,
                { provide: RbacService, useValue: rbacServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });
        facade = TestBed.inject(UserFacade);
    });

    it('should be created', () => {
        expect(facade).toBeTruthy();
    });

    describe('computed properties', () => {
        it('should calculate hasActiveFilters', () => {
            expect(facade.hasActiveFilters()).toBe(false);
        });

        it('should calculate activeUserCount', () => {
            facade['state'].update(s => ({ ...s, items: mockUsers }));
            expect(facade.activeUserCount()).toBe(1);
        });

        it('should calculate inactiveUserCount', () => {
            facade['state'].update(s => ({ ...s, items: mockUsers }));
            expect(facade.inactiveUserCount()).toBe(1);
        });
    });

    describe('loadFilterOptions', () => {
        it('should load branches and roles', () => {
            rbacServiceMock.getAllBranches.mockReturnValue(of(mockBranches));
            rbacServiceMock.getAllRoles.mockReturnValue(of(mockRoles));

            facade.loadFilterOptions();

            expect(rbacServiceMock.getAllBranches).toHaveBeenCalled();
            expect(rbacServiceMock.getAllRoles).toHaveBeenCalled();
        });
    });

    describe('filters', () => {
        it('should set filter value', () => {
            rbacServiceMock.getUsers.mockReturnValue(of({
                items: mockUsers,
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.setFilter('role', 'ADMIN');

            expect(facade.filters().role).toBe('ADMIN');
        });

        it('should clear all filters', () => {
            rbacServiceMock.getUsers.mockReturnValue(of({
                items: mockUsers,
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.clearFilters();

            expect(facade.filters()).toEqual({
                search: '',
                role: '',
                branch: '',
                status: ''
            });
        });
    });

    describe('CRUD operations', () => {
        it('should create user', () => {
            rbacServiceMock.createUser.mockReturnValue(of(mockUsers[0]));

            facade.createUser({ fullName: 'New User' }).subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('User created successfully', 'success');
            });
        });

        it('should update user', () => {
            rbacServiceMock.updateUser.mockReturnValue(of(mockUsers[0]));

            facade.updateUser('1', { fullName: 'Updated' }).subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('User updated successfully', 'success');
            });
        });

        it('should delete user', () => {
            rbacServiceMock.deleteUser.mockReturnValue(of(undefined));

            facade.deleteUser('1').subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('User deleted successfully', 'success');
            });
        });

        it('should export users', () => {
            rbacServiceMock.getUsers.mockReturnValue(of({
                items: mockUsers,
                page: 1,
                pageSize: 1000,
                total: 2,
                totalPages: 1
            }));

            facade.exportUsers().subscribe(users => {
                expect(users).toEqual(mockUsers);
            });
        });
    });

    describe('navigation', () => {
        it('should navigate to user detail', () => {
            facade.viewUser('1');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/users', '1']);
        });

        it('should navigate to create user', () => {
            facade.createNewUser();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/users', 'new']);
        });
    });
});
