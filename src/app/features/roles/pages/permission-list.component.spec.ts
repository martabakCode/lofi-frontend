import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionListComponent } from './permission-list.component';
import { PermissionFacade } from '../facades/permission.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('PermissionListComponent', () => {
    let component: PermissionListComponent;
    let fixture: ComponentFixture<PermissionListComponent>;
    let permissionFacadeMock: jest.Mocked<PermissionFacade>;

    beforeEach(() => {
        permissionFacadeMock = {
            items: signal([]),
            loading: signal(false),
            pagination: signal({ page: 1, pageSize: 10, total: 0, totalPages: 1 }),
            loadPermissions: jest.fn()
        } as unknown as jest.Mocked<PermissionFacade>;

        TestBed.configureTestingModule({
            imports: [PermissionListComponent],
            providers: [
                provideRouter([]),
                { provide: PermissionFacade, useValue: permissionFacadeMock }
            ]
        });
        fixture = TestBed.createComponent(PermissionListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load permissions on init', () => {
        fixture.detectChanges();
        expect(permissionFacadeMock.loadPermissions).toHaveBeenCalled();
    });
});
