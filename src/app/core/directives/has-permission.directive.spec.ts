import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HasPermissionDirective } from './has-permission.directive';
import { AuthService } from '../services/auth.service';

// Test component to host the directive
@Component({
    template: `
    <div *appHasPermission="'LOAN_READ'">
      Can Read Loans
    </div>
    <div *appHasPermission="'LOAN_WRITE'">
      Can Write Loans
    </div>
  `,
    standalone: true,
    imports: [HasPermissionDirective]
})
class TestComponent { }

describe('HasPermissionDirective', () => {
    let fixture: ComponentFixture<TestComponent>;
    let authServiceMock: jest.Mocked<AuthService>;

    beforeEach(() => {
        authServiceMock = {
            currentUser: signal(null),
            hasPermission: jest.fn()
        } as unknown as jest.Mocked<AuthService>;

        TestBed.configureTestingModule({
            imports: [TestComponent],
            providers: [
                { provide: AuthService, useValue: authServiceMock }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
    });

    it('should create component', () => {
        expect(fixture).toBeTruthy();
    });

    it('should show element when user has permission', () => {
        authServiceMock.hasPermission.mockImplementation((perm: string) => perm === 'LOAN_READ');

        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('div'));
        expect(elements.length).toBe(1);
        expect(elements[0].nativeElement.textContent).toContain('Can Read Loans');
    });

    it('should hide element when user does not have permission', () => {
        authServiceMock.hasPermission.mockReturnValue(false);

        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('div'));
        expect(elements.length).toBe(0);
    });

    it('should react to permission changes', () => {
        // Initially has permission
        authServiceMock.hasPermission.mockReturnValue(true);
        fixture.detectChanges();

        let elements = fixture.debugElement.queryAll(By.css('div'));
        expect(elements.length).toBe(2);

        // Update mock to remove permission
        authServiceMock.hasPermission.mockReturnValue(false);
        authServiceMock.currentUser.set({
            id: '1',
            email: 'test@example.com',
            username: 'test',
            roles: [],
            permissions: []
        });

        fixture.detectChanges();

        elements = fixture.debugElement.queryAll(By.css('div'));
        expect(elements.length).toBe(0);
    });

    it('should handle multiple directives with different permissions', () => {
        authServiceMock.hasPermission.mockImplementation((perm: string) => {
            return perm === 'LOAN_READ';
        });

        fixture.detectChanges();

        const elements = fixture.debugElement.queryAll(By.css('div'));
        expect(elements.length).toBe(1);
        expect(elements[0].nativeElement.textContent).toContain('Can Read Loans');
    });
});
