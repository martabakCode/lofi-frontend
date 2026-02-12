import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let authServiceMock: jest.Mocked<AuthService>;
    let profileServiceMock: jest.Mocked<ProfileService>;

    beforeEach(() => {
        authServiceMock = {
            currentUser: signal({ id: '1', fullName: 'Test User', email: 'test@test.com' })
        } as unknown as jest.Mocked<AuthService>;

        profileServiceMock = {
            updateProfile: jest.fn().mockReturnValue(of({})),
            uploadAvatar: jest.fn().mockReturnValue(of({}))
        } as unknown as jest.Mocked<ProfileService>;

        TestBed.configureTestingModule({
            imports: [ProfileComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authServiceMock },
                { provide: ProfileService, useValue: profileServiceMock }
            ]
        });
        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
