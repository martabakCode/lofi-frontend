import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RoleFacade } from './role.facade';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Role } from '../../../core/models/rbac.models';

describe('RoleFacade', () => {
    let facade: RoleFacade;
    let rbacServiceMock: jest.Mocked<RbacService>;
    let toastServiceMock: jest.Mocked<ToastService>;
    let routerMock: jest.Mocked<Router>;

    const mockRoles: Role[] = [
        { id: '1', name: 'ROLE_ADMIN', description: 'Admin', status: 'Active', permissions: [], createdAt: new Date().toISOString() },
        { id: '2', name: 'ROLE_USER', description: 'User', status: 'Active', permissions: [], createdAt: new Date().toISOString() }
    ];

    beforeEach(() => {
        rbacServiceMock = {
            getRoles: jest.fn(),
            getRoleById: jest.fn(),
            createRole: jest.fn(),
            updateRole: jest.fn(),
            deleteRole: jest.fn(),
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
                RoleFacade,
                { provide: RbacService, useValue: rbacServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });
        facade = TestBed.inject(RoleFacade);
    });

    it('should be created', () => {
        expect(facade).toBeTruthy();
    });

    describe('loadRoles', () => {
        it('should load roles', () => {
            rbacServiceMock.getRoles.mockReturnValue(of({
                items: mockRoles,
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.loadRoles();

            expect(facade.loading()).toBe(true);
            expect(rbacServiceMock.getRoles).toHaveBeenCalled();
        });
    });

    describe('CRUD operations', () => {
        it('should create role', () => {
            rbacServiceMock.createRole.mockReturnValue(of(mockRoles[0]));

            facade.createRole({ name: 'NEW_ROLE', description: 'New Role' }).subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Role created successfully', 'success');
            });
        });

        it('should update role', () => {
            rbacServiceMock.updateRole.mockReturnValue(of(mockRoles[0]));

            facade.updateRole('1', { description: 'Updated' }).subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Role updated successfully', 'success');
            });
        });

        it('should delete role', () => {
            rbacServiceMock.deleteRole.mockReturnValue(of(undefined));

            facade.deleteRole('1').subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Role deleted successfully', 'success');
            });
        });
    });

    describe('navigation', () => {
        it('should navigate to view role', () => {
            facade.viewRole('1');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/roles', '1']);
        });

        it('should navigate to edit role', () => {
            facade.editRole('1');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/roles', '1', 'edit']);
        });

        it('should navigate to create role', () => {
            facade.createNewRole();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/roles', 'new']);
        });

        it('should navigate to permissions', () => {
            facade.viewPermissions();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/roles', 'permissions']);
        });
    });
});
