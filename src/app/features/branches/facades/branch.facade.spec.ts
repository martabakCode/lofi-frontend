import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BranchFacade } from './branch.facade';
import { RbacService } from '../../../core/services/rbac.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Branch } from '../../../core/models/rbac.models';

describe('BranchFacade', () => {
    let facade: BranchFacade;
    let rbacServiceMock: jest.Mocked<RbacService>;
    let toastServiceMock: jest.Mocked<ToastService>;
    let routerMock: jest.Mocked<Router>;

    const mockBranches: Branch[] = [
        { id: '1', name: 'Branch A', address: 'Address A', phone: '123', status: 'Active', createdAt: new Date().toISOString() },
        { id: '2', name: 'Branch B', address: 'Address B', phone: '456', status: 'Inactive', createdAt: new Date().toISOString() }
    ];

    beforeEach(() => {
        rbacServiceMock = {
            getBranches: jest.fn(),
            getBranchById: jest.fn(),
            createBranch: jest.fn(),
            updateBranch: jest.fn(),
            deleteBranch: jest.fn(),
            getAllBranches: jest.fn()
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
                BranchFacade,
                { provide: RbacService, useValue: rbacServiceMock },
                { provide: ToastService, useValue: toastServiceMock },
                { provide: Router, useValue: routerMock }
            ]
        });
        facade = TestBed.inject(BranchFacade);
    });

    it('should be created', () => {
        expect(facade).toBeTruthy();
    });

    describe('initial state', () => {
        it('should have empty items initially', () => {
            expect(facade.items()).toEqual([]);
        });

        it('should not be loading initially', () => {
            expect(facade.loading()).toBe(false);
        });

        it('should have no error initially', () => {
            expect(facade.error()).toBeNull();
        });
    });

    describe('loadBranches', () => {
        it('should load branches successfully', () => {
            rbacServiceMock.getBranches.mockReturnValue(of({
                items: mockBranches,
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.loadBranches();

            expect(facade.loading()).toBe(true);
            expect(rbacServiceMock.getBranches).toHaveBeenCalled();
        });

        it('should handle error when loading branches', () => {
            rbacServiceMock.getBranches.mockReturnValue(throwError(() => ({ message: 'Error', status: 500 })));

            facade.loadBranches();

            expect(toastServiceMock.show).toHaveBeenCalledWith('Error', 'error');
        });

        it('should not show toast for 401/403 errors', () => {
            rbacServiceMock.getBranches.mockReturnValue(throwError(() => ({ message: 'Forbidden', status: 403 })));

            facade.loadBranches();

            expect(toastServiceMock.show).not.toHaveBeenCalled();
        });
    });

    describe('pagination', () => {
        it('should set page and reload', () => {
            rbacServiceMock.getBranches.mockReturnValue(of({
                items: mockBranches,
                page: 2,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.setPage(2);

            expect(facade.pagination().page).toBe(2);
            expect(rbacServiceMock.getBranches).toHaveBeenCalled();
        });

        it('should set page size and reset page to 1', () => {
            rbacServiceMock.getBranches.mockReturnValue(of({
                items: mockBranches,
                page: 1,
                pageSize: 20,
                total: 2,
                totalPages: 1
            }));

            facade.setPageSize(20);

            expect(facade.pagination().pageSize).toBe(20);
            expect(facade.pagination().page).toBe(1);
        });
    });

    describe('sorting', () => {
        it('should set sort field and direction', () => {
            rbacServiceMock.getBranches.mockReturnValue(of({
                items: mockBranches,
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.setSort('name', 'desc');

            expect(facade.sort()).toEqual({ field: 'name', direction: 'desc' });
        });
    });

    describe('search', () => {
        it('should set search and reset page', () => {
            rbacServiceMock.getBranches.mockReturnValue(of({
                items: mockBranches,
                page: 1,
                pageSize: 10,
                total: 2,
                totalPages: 1
            }));

            facade.setSearch('test');

            expect(facade.search()).toBe('test');
            expect(facade.pagination().page).toBe(1);
        });
    });

    describe('getBranch', () => {
        it('should get branch by ID', () => {
            const branch = mockBranches[0];
            rbacServiceMock.getBranchById.mockReturnValue(of(branch));

            facade.getBranch('1').subscribe(result => {
                expect(result).toEqual(branch);
            });
        });
    });

    describe('createBranch', () => {
        it('should create branch successfully', () => {
            const newBranch = { name: 'New Branch', address: 'New Address' };
            rbacServiceMock.createBranch.mockReturnValue(of({ ...newBranch, id: '3' } as Branch));

            facade.createBranch(newBranch).subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Branch created successfully', 'success');
            });
        });
    });

    describe('updateBranch', () => {
        it('should update branch successfully', () => {
            rbacServiceMock.updateBranch.mockReturnValue(of(mockBranches[0]));

            facade.updateBranch('1', { name: 'Updated' }).subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Branch updated successfully', 'success');
            });
        });
    });

    describe('deleteBranch', () => {
        it('should delete branch successfully', () => {
            rbacServiceMock.deleteBranch.mockReturnValue(of(undefined));

            facade.deleteBranch('1').subscribe(() => {
                expect(toastServiceMock.show).toHaveBeenCalledWith('Branch deleted successfully', 'success');
            });
        });
    });

    describe('navigation', () => {
        it('should navigate to branch detail', () => {
            facade.viewBranch('1');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/branches', '1']);
        });

        it('should navigate to branch edit', () => {
            facade.editBranch('1');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/branches', '1', 'edit']);
        });

        it('should navigate to create branch', () => {
            facade.createNewBranch();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard/branches', 'new']);
        });
    });
});
