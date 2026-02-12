import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchListComponent } from './branch-list.component';
import { BranchFacade } from '../facades/branch.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('BranchListComponent', () => {
    let component: BranchListComponent;
    let fixture: ComponentFixture<BranchListComponent>;
    let branchFacadeMock: jest.Mocked<BranchFacade>;

    beforeEach(() => {
        branchFacadeMock = {
            items: signal([]),
            loading: signal(false),
            pagination: signal({ page: 1, pageSize: 10, total: 0, totalPages: 1 }),
            loadBranches: jest.fn()
        } as unknown as jest.Mocked<BranchFacade>;

        TestBed.configureTestingModule({
            imports: [BranchListComponent],
            providers: [
                provideRouter([]),
                { provide: BranchFacade, useValue: branchFacadeMock }
            ]
        });
        fixture = TestBed.createComponent(BranchListComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load branches on init', () => {
        fixture.detectChanges();
        expect(branchFacadeMock.loadBranches).toHaveBeenCalled();
    });
});
