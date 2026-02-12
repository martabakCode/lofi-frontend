import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoleListComponent } from './role-list.component';
import { RoleFacade } from '../facades/role.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('RoleListComponent', () => {
    let component: RoleListComponent;
    let fixture: ComponentFixture<RoleListComponent>;
    let roleFacadeMock: jest.Mocked<RoleFacade>;

    beforeEach(() => {
        roleFacadeMock = {
            items: signal([]),
            loading: signal(false),
            pagination: signal({ page: 1, pageSize: 10, total: 0, totalPages: 1 }),
            loadRoles: jest.fn()
        } as unknown as jest.Mocked<RoleFacade>;

        TestBed.configureTestingModule({
            imports: [RoleListComponent],
            providers: [
                provideRouter([]),
                { provide: RoleFacade, useValue: roleFacadeMock }
            ]
        });
        fixture = TestBed.createComponent(RoleListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load roles on init', () => {
        fixture.detectChanges();
        expect(roleFacadeMock.loadRoles).toHaveBeenCalled();
    });
});
