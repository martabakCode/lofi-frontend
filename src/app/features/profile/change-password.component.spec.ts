import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordComponent } from './change-password.component';
import { ProfileService } from '../../core/services/profile.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('ChangePasswordComponent', () => {
    let component: ChangePasswordComponent;
    let fixture: ComponentFixture<ChangePasswordComponent>;
    let profileServiceMock: jest.Mocked<ProfileService>;

    beforeEach(() => {
        profileServiceMock = {
            changePassword: jest.fn().mockReturnValue(of({}))
        } as unknown as jest.Mocked<ProfileService>;

        TestBed.configureTestingModule({
            imports: [ChangePasswordComponent],
            providers: [
                provideRouter([]),
                { provide: ProfileService, useValue: profileServiceMock }
            ]
        });
        fixture = TestBed.createComponent(ChangePasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should require current password', () => {
        const control = component.passwordForm.get('currentPassword');
        expect(control?.hasError('required')).toBe(true);
    });

    it('should require new password', () => {
        const control = component.passwordForm.get('newPassword');
        expect(control?.hasError('required')).toBe(true);
    });
});
