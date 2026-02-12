import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchDetailComponent } from './branch-detail.component';
import { provideRouter } from '@angular/router';

describe('BranchDetailComponent', () => {
    let component: BranchDetailComponent;
    let fixture: ComponentFixture<BranchDetailComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BranchDetailComponent],
            providers: [provideRouter([])]
        }).compileComponents();

        fixture = TestBed.createComponent(BranchDetailComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('initial state', () => {
        it('should have empty branchId initially', () => {
            expect(component.branchId()).toBe('');
        });

        it('should have null branch initially', () => {
            expect(component.branch()).toBeNull();
        });

        it('should have loading set to false initially', () => {
            expect(component.loading()).toBe(false);
        });

        it('should have null error initially', () => {
            expect(component.error()).toBeNull();
        });

        it('should have empty branch staff initially', () => {
            expect(component.branchStaff()).toEqual([]);
        });

        it('should have assign modal closed initially', () => {
            expect(component.isAssignModalOpen()).toBe(false);
        });
    });

    describe('getInitials', () => {
        it('should return correct initials for two word name', () => {
            expect(component.getInitials('John Doe')).toBe('JD');
        });

        it('should return first letter for single word name', () => {
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

    describe('getRoleDisplayName', () => {
        it('should remove ROLE_ prefix', () => {
            expect(component.getRoleDisplayName('ROLE_ADMIN')).toBe('ADMIN');
        });

        it('should replace underscore with space', () => {
            expect(component.getRoleDisplayName('ROLE_BRANCH_MANAGER')).toBe('BRANCH MANAGER');
        });

        it('should handle role object', () => {
            expect(component.getRoleDisplayName({ name: 'ROLE_USER' })).toBe('USER');
        });

        it('should return Unknown for null', () => {
            expect(component.getRoleDisplayName(null)).toBe('Unknown');
        });
    });

    describe('hasLocation', () => {
        it('should return true when branch has coordinates', () => {
            const branch = { latitude: '-6.2088', longitude: '106.8456' } as any;
            expect(component.hasLocation(branch)).toBe(true);
        });

        it('should return false when latitude is missing', () => {
            const branch = { latitude: null, longitude: '106.8456' } as any;
            expect(component.hasLocation(branch)).toBe(false);
        });

        it('should return false when longitude is missing', () => {
            const branch = { latitude: '-6.2088', longitude: null } as any;
            expect(component.hasLocation(branch)).toBe(false);
        });
    });

    describe('getLocation', () => {
        it('should parse coordinates correctly', () => {
            const branch = { latitude: '-6.2088', longitude: '106.8456' } as any;
            const coords = component.getLocation(branch);
            expect(coords.latitude).toBe(-6.2088);
            expect(coords.longitude).toBe(106.8456);
        });

        it('should return 0 for missing latitude', () => {
            const branch = { latitude: null, longitude: '106.8456' } as any;
            const coords = component.getLocation(branch);
            expect(coords.latitude).toBe(0);
        });

        it('should return 0 for missing longitude', () => {
            const branch = { latitude: '-6.2088', longitude: null } as any;
            const coords = component.getLocation(branch);
            expect(coords.longitude).toBe(0);
        });
    });

    describe('staff filtering', () => {
        it('should return all staff when filter is ALL', () => {
            const testStaff = [
                { id: '1', roles: [{ name: 'ROLE_BRANCH_MANAGER' }] },
                { id: '2', roles: [{ name: 'ROLE_MARKETING' }] }
            ] as any;
            component.branchStaff.set(testStaff);
            component.setStaffFilter('ALL');
            expect(component.filteredBranchStaff()).toEqual(testStaff);
        });

        it('should filter by BRANCH_MANAGER role', () => {
            const testStaff = [
                { id: '1', roles: [{ name: 'ROLE_BRANCH_MANAGER' }] },
                { id: '2', roles: [{ name: 'ROLE_MARKETING' }] }
            ] as any;
            component.branchStaff.set(testStaff);
            component.setStaffFilter('BRANCH_MANAGER');
            expect(component.filteredBranchStaff().length).toBe(1);
            expect(component.filteredBranchStaff()[0].id).toBe('1');
        });

        it('should filter by MARKETING role', () => {
            const testStaff = [
                { id: '1', roles: [{ name: 'ROLE_BRANCH_MANAGER' }] },
                { id: '2', roles: [{ name: 'ROLE_MARKETING' }] }
            ] as any;
            component.branchStaff.set(testStaff);
            component.setStaffFilter('MARKETING');
            expect(component.filteredBranchStaff().length).toBe(1);
            expect(component.filteredBranchStaff()[0].id).toBe('2');
        });
    });

    describe('staff stats', () => {
        it('should calculate correct statistics', () => {
            const testStaff = [
                { id: '1', roles: [{ name: 'ROLE_BRANCH_MANAGER' }] },
                { id: '2', roles: [{ name: 'ROLE_MARKETING' }] },
                { id: '3', roles: [{ name: 'ROLE_BRANCH_MANAGER' }] }
            ] as any;
            component.branchStaff.set(testStaff);
            const stats = component.staffStats();
            expect(stats.total).toBe(3);
            expect(stats.bmCount).toBe(2);
            expect(stats.marketingCount).toBe(1);
        });

        it('should handle empty staff list', () => {
            component.branchStaff.set([]);
            const stats = component.staffStats();
            expect(stats.total).toBe(0);
            expect(stats.bmCount).toBe(0);
            expect(stats.marketingCount).toBe(0);
        });
    });

    describe('modal operations', () => {
        it('should open assign modal', () => {
            component.openAssignModal();
            expect(component.isAssignModalOpen()).toBe(true);
        });

        it('should close assign modal and reset state', () => {
            component.openAssignModal();
            component.selectedUserId.set('user-1');
            component.closeAssignModal();
            expect(component.isAssignModalOpen()).toBe(false);
            expect(component.selectedUserId()).toBe('');
        });

        it('should reset selected staff role to MARKETING', () => {
            component.selectedStaffRole.set('BRANCH_MANAGER');
            component.openAssignModal();
            expect(component.selectedStaffRole()).toBe('MARKETING');
        });
    });
});
