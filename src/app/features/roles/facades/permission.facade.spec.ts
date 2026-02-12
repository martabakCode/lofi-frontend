import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PermissionFacade } from './permission.facade';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Permission } from '../../../core/models/rbac.models';

describe('PermissionFacade', () => {
    let facade: PermissionFacade;
    let rbacServiceMock: jest.Mocked<RbacService>;
    let toastServiceMock: jest.Mocked<ToastService>;
    let routerMock: jest.Mocked<Router>;

    const mockPermissions: Permission[] = [
        { id: '1', name: 'CREATE_USER', description: 'Create User', module: 'USER', status: 'Active', createdAt: new Date().toISOString() },
        { id: '2', name: 'DELETE_USER', description: 'Delete User', module: 'USER', status: 'Active', createdAt: new Date().toISOString() }
    ];

    beforeEach(() => {
        rbacServiceMock = {
            getPermissions: jest.fn(),
            createPermission: jest.fn(),
            updatePermission: jest.fn(),
            deletePermission: jest.fn(),
            getAllPermissions: jest.fn()
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
                PermissionFacade,
                { provide: RbacService, useValue: rbacServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });
        facade = TestBed.inject(PermissionFacade);
    });

    it('should be created', () => {
        expect(facade).toBeTruthy();
    });

    describe('loadPermissions', () => {
        it('should load permissions', () => {
            rbacServiceMock.getPermissions.mockReturnValue(of({
                items: mockPermissions,
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.loadPermissions();

            expect(facade.loading()).toBe(true);
            expect(rbacServiceMock.getPermissions).toHaveBeenCalled();
        });
    });

    describe('CRUD operations', () => {
        it('should create permission', () => {
            rbacServiceMock.createPermission.mockReturnValue(of(mockPermissions[0]));

            facade.createPermission({ name: 'NEW_PERM', description: 'New Permission' }).subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Permission created successfully', 'success');
            });
        });

        it('should update permission', () => {
            rbacServiceMock.updatePermission.mockReturnValue(of(mockPermissions[0]));

            facade.updatePermission('1', { description: 'Updated' }).subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Permission updated successfully', 'success');
            });
        });

        it('should delete permission', () => {
            rbacServiceMock.deletePermission.mockReturnValue(of(undefined));

            facade.deletePermission('1').subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Permission deleted successfully', 'success');
            });
        });

        it('should export permissions', () => {
            rbacServiceMock.getAllPermissions.mockReturnValue(of(mockPermissions));

            facade.exportPermissions().subscribe(perms => {
                expect(perms).toEqual(mockPermissions);
            });
        });
    });

    describe('navigation', () => {
        it('should navigate back to roles', () => {
            facade.backToRoles();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/roles']);
        });
    });
});
