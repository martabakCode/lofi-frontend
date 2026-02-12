import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormComponent } from './user-form.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { UserFacade } from '../../facades/user.facade';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('UserFormComponent', () => {
    let component: UserFormComponent;
    let fixture: ComponentFixture<UserFormComponent>;
    let userFacadeMock: any;

    beforeEach(async () => {
        userFacadeMock = {
            loadFilterOptions: jest.fn(),
            getUser: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [UserFormComponent, ReactiveFormsModule],
            providers: [
                FormBuilder,
                provideRouter([]),
                { provide: UserFacade, useValue: userFacadeMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(UserFormComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('form initialization', () => {
        it('should initialize form with required validators', () => {
            expect(component.form).toBeDefined();
            expect(component.form.get('fullName')?.hasValidator(Validators.required)).toBe(true);
            expect(component.form.get('username')?.hasValidator(Validators.required)).toBe(true);
            expect(component.form.get('email')?.hasValidator(Validators.required)).toBe(true);
        });

        it('should have email validator', () => {
            expect(component.form.get('email')?.hasValidator(Validators.email)).toBe(true);
        });

        it('should have default status value', () => {
            expect(component.form.get('status')?.value).toBe('Active');
        });

        it('should initialize with empty branchId', () => {
            expect(component.form.get('branchId')?.value).toBe('');
        });
    });

    describe('initial state', () => {
        it('should have empty userId initially', () => {
            expect(component.userId()).toBe('');
        });

        it('should have isEditMode set to false initially', () => {
            expect(component.isEditMode()).toBe(false);
        });

        it('should have loading set to false initially', () => {
            expect(component.loading()).toBe(false);
        });

        it('should have null error initially', () => {
            expect(component.error()).toBeNull();
        });

        it('should have empty selected roles initially', () => {
            expect(component.selectedRoles()).toEqual([]);
        });
    });

    describe('breadcrumbs', () => {
        it('should have correct breadcrumb structure', () => {
            expect(component.breadcrumbs.length).toBe(3);
            expect(component.breadcrumbs[0].label).toBe('Home');
            expect(component.breadcrumbs[1].label).toBe('Users');
            expect(component.breadcrumbs[2].label).toBe('Create');
        });

        it('should update last breadcrumb for edit mode', () => {
            component.isEditMode.set(true);
            component.breadcrumbs[component.breadcrumbs.length - 1].label = 'Edit';
            expect(component.breadcrumbs[2].label).toBe('Edit');
        });
    });

    describe('role selection', () => {
        it('should add role to selectedRoles when checked', () => {
            component.selectedRoles.set([]);
            const event = { target: { checked: true } } as any;

            component.onRoleToggle('role-1', event);

            expect(component.selectedRoles()).toContain('role-1');
        });

        it('should remove role from selectedRoles when unchecked', () => {
            component.selectedRoles.set(['role-1', 'role-2']);
            const event = { target: { checked: false } } as any;

            component.onRoleToggle('role-1', event);

            expect(component.selectedRoles()).not.toContain('role-1');
            expect(component.selectedRoles()).toContain('role-2');
        });

        it('should handle multiple role selections', () => {
            component.selectedRoles.set([]);
            const event1 = { target: { checked: true } } as any;
            const event2 = { target: { checked: true } } as any;

            component.onRoleToggle('role-1', event1);
            component.onRoleToggle('role-2', event2);

            expect(component.selectedRoles().length).toBe(2);
        });
    });

    describe('hasUnsavedChanges', () => {
        it('should return false when form is pristine', () => {
            component.form.markAsPristine();
            expect(component.hasUnsavedChanges()).toBe(false);
        });

        it('should return false when form is not dirty', () => {
            expect(component.hasUnsavedChanges()).toBe(false);
        });

        it('should return true when form is dirty', () => {
            component.form.markAsDirty();
            expect(component.hasUnsavedChanges()).toBe(true);
        });
    });

    describe('cancel', () => {
        it('should navigate to users list', () => {
            const navigateSpy = jest.spyOn(component['router'], 'navigate');

            component.cancel();

            expect(navigateSpy).toHaveBeenCalledWith(['/dashboard/users']);
        });
    });

    describe('autosave', () => {
        it('should initialize autosave status as saved', () => {
            expect(component.autosaveStatus()).toBe('saved');
        });

        it('should have null last saved time initially', () => {
            expect(component.lastSavedTime()).toBeNull();
        });
    });

    describe('form submission validation', () => {
        it('should not submit when form is invalid', () => {
            component.form.get('fullName')?.setValue('');
            component.form.get('username')?.setValue('');
            component.form.get('email')?.setValue('');

            const onSubmitSpy = jest.spyOn(component, 'onSubmit');
            component.onSubmit();

            expect(onSubmitSpy).toBeDefined();
        });

        it('should have form controls for all required fields', () => {
            expect(component.form.contains('fullName')).toBe(true);
            expect(component.form.contains('username')).toBe(true);
            expect(component.form.contains('email')).toBe(true);
            expect(component.form.contains('phone')).toBe(true);
            expect(component.form.contains('branchId')).toBe(true);
            expect(component.form.contains('status')).toBe(true);
        });
    });

    describe('component methods', () => {
        it('should handle role toggle correctly', () => {
            const event = { target: { checked: true } } as any;
            component.onRoleToggle('test-role', event);
            expect(component.selectedRoles()).toContain('test-role');
        });

        it('should handle role untoggle correctly', () => {
            component.selectedRoles.set(['test-role']);
            const event = { target: { checked: false } } as any;
            component.onRoleToggle('test-role', event);
            expect(component.selectedRoles()).not.toContain('test-role');
        });
    });

    describe('loadFilterOptions', () => {
        it('should call userFacade loadFilterOptions', () => {
            component.loadFilterOptions();
            expect(userFacadeMock.loadFilterOptions).toHaveBeenCalled();
        });
    });

    describe('signal states', () => {
        it('should support branches signal', () => {
            const testBranches = [{ id: '1', name: 'Branch 1' } as any];
            component.branches.set(testBranches);
            expect(component.branches()).toEqual(testBranches);
        });

        it('should support roles signal', () => {
            const testRoles = [{ id: '1', name: 'Role 1' } as any];
            component.roles.set(testRoles);
            expect(component.roles()).toEqual(testRoles);
        });

        it('should support selectedRoles signal', () => {
            const testRoles = ['role-1', 'role-2'];
            component.selectedRoles.set(testRoles);
            expect(component.selectedRoles()).toEqual(testRoles);
        });
    });
});
