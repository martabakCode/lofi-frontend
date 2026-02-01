import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RbacService, UserFilterParams, BranchFilterParams, PermissionFilterParams, RoleFilterParams } from './rbac.service';
import { environment } from '../../../environments/environment';
import { Branch, Permission, Role, User } from '../models/rbac.models';

describe('RbacService', () => {
    let service: RbacService;
    let httpMock: HttpTestingController;

    const mockBranch: Branch = {
        id: 'branch-1',
        name: 'Main Branch',
        address: '123 Main St',
        city: 'Jakarta',
        state: 'DKI Jakarta',
        zipCode: '12190',
        phone: '021-1234567'
    };

    const mockPermission: Permission = {
        id: 'perm-1',
        name: 'LOAN_READ',
        description: 'Can read loan data'
    };

    const mockRole: Role = {
        id: 'role-1',
        name: 'MARKETING',
        description: 'Marketing role',
        permissions: [mockPermission]
    };

    const mockUser: User = {
        id: 'user-1',
        username: 'johndoe',
        fullName: 'John Doe',
        email: 'john@example.com',
        roles: [mockRole],
        branch: mockBranch,
        status: 'Active'
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RbacService]
        });

        service = TestBed.inject(RbacService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    // Branch Tests
    describe('getBranches', () => {
        it('should fetch paginated branches', (done) => {
            const mockResponse = {
                items: [mockBranch],
                meta: {
                    page: 0,
                    size: 10,
                    totalItems: 1,
                    totalPages: 1
                }
            };

            service.getBranches({ page: 0, pageSize: 10 }).subscribe(response => {
                expect(response.items).toHaveLength(1);
                expect(response.items[0].name).toBe('Main Branch');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches?page=0&size=10`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockResponse });
        });

        it('should handle search parameter for branches', (done) => {
            const params: BranchFilterParams = { page: 0, pageSize: 10, search: 'Main' };

            service.getBranches(params).subscribe(() => {
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches?page=0&size=10&search=Main`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: { items: [], meta: { page: 0, size: 10, totalItems: 0, totalPages: 0 } } });
        });
    });

    describe('getAllBranches', () => {
        it('should fetch all branches without pagination', (done) => {
            service.getAllBranches().subscribe(branches => {
                expect(branches).toHaveLength(1);
                expect(branches[0].name).toBe('Main Branch');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches/all`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: [mockBranch] });
        });
    });

    describe('createBranch', () => {
        it('should create a new branch', (done) => {
            const newBranch: Partial<Branch> = {
                name: 'New Branch',
                address: '456 New St',
                city: 'Bandung'
            };

            service.createBranch(newBranch).subscribe(branch => {
                expect(branch.name).toBe('Main Branch');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newBranch);
            req.flush({ data: mockBranch });
        });
    });

    describe('updateBranch', () => {
        it('should update an existing branch', (done) => {
            const updateData: Partial<Branch> = { name: 'Updated Branch' };

            service.updateBranch('branch-1', updateData).subscribe(branch => {
                expect(branch.id).toBe('branch-1');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches/branch-1`);
            expect(req.request.method).toBe('PUT');
            req.flush({ data: { ...mockBranch, ...updateData } });
        });
    });

    describe('deleteBranch', () => {
        it('should delete a branch', (done) => {
            service.deleteBranch('branch-1').subscribe(() => {
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches/branch-1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    // Permission Tests
    describe('getPermissions', () => {
        it('should fetch paginated permissions', (done) => {
            const mockResponse = {
                items: [mockPermission],
                meta: { page: 0, size: 10, totalItems: 1, totalPages: 1 }
            };

            service.getPermissions({ page: 0, pageSize: 10 }).subscribe(response => {
                expect(response.items).toHaveLength(1);
                expect(response.items[0].name).toBe('LOAN_READ');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/permissions?page=0&size=10`);
            req.flush({ data: mockResponse });
        });
    });

    describe('getAllPermissions', () => {
        it('should fetch all permissions', (done) => {
            service.getAllPermissions().subscribe(permissions => {
                expect(permissions).toHaveLength(1);
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/permissions/all`);
            req.flush({ data: [mockPermission] });
        });
    });

    describe('createPermission', () => {
        it('should create a new permission', (done) => {
            const newPerm: Partial<Permission> = { name: 'LOAN_WRITE', description: 'Can write loans' };

            service.createPermission(newPerm).subscribe(permission => {
                expect(permission.name).toBe('LOAN_READ');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/permissions`);
            expect(req.request.method).toBe('POST');
            req.flush({ data: mockPermission });
        });
    });

    // Role Tests
    describe('getRoles', () => {
        it('should fetch paginated roles', (done) => {
            const mockResponse = {
                items: [mockRole],
                meta: { page: 0, size: 10, totalItems: 1, totalPages: 1 }
            };

            service.getRoles({ page: 0, pageSize: 10 }).subscribe(response => {
                expect(response.items).toHaveLength(1);
                expect(response.items[0].name).toBe('MARKETING');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/roles?page=0&size=10`);
            req.flush({ data: mockResponse });
        });
    });

    describe('getAllRoles', () => {
        it('should fetch all roles', (done) => {
            service.getAllRoles().subscribe(roles => {
                expect(roles).toHaveLength(1);
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/roles/all`);
            req.flush({ data: [mockRole] });
        });
    });

    describe('getRoleById', () => {
        it('should fetch role by id', (done) => {
            service.getRoleById('role-1').subscribe(role => {
                expect(role.id).toBe('role-1');
                expect(role.name).toBe('MARKETING');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/roles/role-1`);
            req.flush({ data: mockRole });
        });
    });

    describe('createRole', () => {
        it('should create a new role', (done) => {
            const newRole = {
                name: 'ADMIN',
                description: 'Admin role',
                permissionIds: ['perm-1']
            };

            service.createRole(newRole).subscribe(role => {
                expect(role.name).toBe('MARKETING');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/roles`);
            expect(req.request.method).toBe('POST');
            req.flush({ data: mockRole });
        });
    });

    describe('updateRole', () => {
        it('should update an existing role', (done) => {
            const updateData = { description: 'Updated description' };

            service.updateRole('role-1', updateData).subscribe(role => {
                expect(role.id).toBe('role-1');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/roles/role-1`);
            expect(req.request.method).toBe('PUT');
            req.flush({ data: mockRole });
        });
    });

    describe('deleteRole', () => {
        it('should delete a role', (done) => {
            service.deleteRole('role-1').subscribe(() => {
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/roles/role-1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    // User Tests
    describe('getUsers', () => {
        it('should fetch paginated users', (done) => {
            const mockResponse = {
                items: [mockUser],
                meta: { page: 0, size: 10, totalItems: 1, totalPages: 1 }
            };

            service.getUsers({ page: 0, pageSize: 10 }).subscribe(response => {
                expect(response.items).toHaveLength(1);
                expect(response.items[0].fullName).toBe('John Doe');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/users?page=0&size=10`);
            req.flush({ data: mockResponse });
        });

        it('should handle filter parameters', (done) => {
            const params: UserFilterParams = {
                page: 0,
                pageSize: 10,
                role: 'MARKETING',
                branch: 'branch-1',
                status: 'Active'
            };

            service.getUsers(params).subscribe(() => {
                done();
            });

            const req = httpMock.expectOne(
                `${environment.apiUrl}/users?page=0&size=10&role=MARKETING&branch=branch-1&status=Active`
            );
            expect(req.request.method).toBe('GET');
            req.flush({ data: { items: [], meta: { page: 0, size: 10, totalItems: 0, totalPages: 0 } } });
        });
    });

    describe('getUserById', () => {
        it('should fetch user by id', (done) => {
            service.getUserById('user-1').subscribe(user => {
                expect(user.id).toBe('user-1');
                expect(user.username).toBe('johndoe');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/users/user-1`);
            req.flush({ data: mockUser });
        });
    });

    describe('createUser', () => {
        it('should create a new user', (done) => {
            const newUser: Partial<User> = {
                username: 'janedoe',
                fullName: 'Jane Doe',
                email: 'jane@example.com'
            };

            service.createUser(newUser).subscribe(user => {
                expect(user.fullName).toBe('John Doe');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/users`);
            expect(req.request.method).toBe('POST');
            req.flush({ data: mockUser });
        });
    });

    describe('updateUser', () => {
        it('should update an existing user', (done) => {
            const updateData: Partial<User> = { fullName: 'Updated Name' };

            service.updateUser('user-1', updateData).subscribe(user => {
                expect(user.id).toBe('user-1');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/users/user-1`);
            expect(req.request.method).toBe('PUT');
            req.flush({ data: mockUser });
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', (done) => {
            service.deleteUser('user-1').subscribe(() => {
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/users/admin/users/user-1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });

    // Branch Staff Tests
    describe('getBranchStaff', () => {
        it('should fetch staff for a branch', (done) => {
            service.getBranchStaff('branch-1').subscribe(staff => {
                expect(staff).toHaveLength(1);
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches/branch-1/staff`);
            req.flush({ data: [mockUser] });
        });
    });

    describe('assignStaffToBranch', () => {
        it('should assign staff to branch with role', (done) => {
            service.assignStaffToBranch('branch-1', 'user-1', 'BRANCH_MANAGER').subscribe(() => {
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches/branch-1/assign-staff`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({ userId: 'user-1', role: 'BRANCH_MANAGER' });
            req.flush(null);
        });
    });

    describe('removeStaffFromBranch', () => {
        it('should remove staff from branch', (done) => {
            service.removeStaffFromBranch('branch-1', 'user-1').subscribe(() => {
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/rbac/branches/branch-1/remove-staff/user-1`);
            expect(req.request.method).toBe('DELETE');
            req.flush(null);
        });
    });
});
