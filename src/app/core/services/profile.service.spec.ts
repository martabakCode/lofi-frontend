import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService, UserProfile } from './profile.service';
import { environment } from '../../../environments/environment';

describe('ProfileService', () => {
    let service: ProfileService;
    let httpMock: HttpTestingController;

    const mockProfile: UserProfile = {
        id: 'user-1',
        fullName: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '081234567890',
        profilePictureUrl: 'https://example.com/avatar.jpg',
        branch: {
            id: 'branch-1',
            name: 'Main Branch'
        },
        biodata: {
            incomeSource: 'Salary',
            incomeType: 'Monthly',
            monthlyIncome: 10000000,
            age: 30,
            nik: '1234567890123456',
            dateOfBirth: '1994-01-01',
            placeOfBirth: 'Jakarta',
            city: 'Jakarta',
            address: 'Jl. Test No. 123',
            province: 'DKI Jakarta',
            district: 'Kebayoran Baru',
            subDistrict: 'Senayan',
            postalCode: '12190',
            gender: 'MALE',
            maritalStatus: 'SINGLE',
            education: 'BACHELOR',
            occupation: 'EMPLOYEE',
            longitude: 106.8,
            latitude: -6.2
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProfileService]
        });

        service = TestBed.inject(ProfileService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getProfile', () => {
        it('should fetch user profile', (done) => {
            service.getProfile().subscribe(response => {
                expect(response.data).toEqual(mockProfile);
                expect(response.data.fullName).toBe('John Doe');
                expect(response.data.email).toBe('john@example.com');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
            expect(req.request.method).toBe('GET');
            req.flush({ success: true, data: mockProfile });
        });

        it('should handle error when fetching profile fails', (done) => {
            service.getProfile().subscribe({
                error: (error) => {
                    expect(error.status).toBe(500);
                    done();
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
            req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
        });
    });

    describe('updateProfile', () => {
        it('should update user profile', (done) => {
            const updateData = {
                fullName: 'Jane Doe',
                phoneNumber: '089876543210'
            };

            const updatedProfile = { ...mockProfile, ...updateData };

            service.updateProfile(updateData).subscribe(response => {
                expect(response.data.fullName).toBe('Jane Doe');
                expect(response.data.phoneNumber).toBe('089876543210');
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(expect.objectContaining(updateData));
            req.flush({ success: true, data: updatedProfile });
        });

        it('should flatten biodata fields in request', (done) => {
            const updateData = {
                fullName: 'John Doe',
                biodata: {
                    city: 'Bandung',
                    address: 'Jl. New Address'
                }
            };

            service.updateProfile(updateData).subscribe(() => {
                done();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/users/profile`);
            expect(req.request.body).toEqual(expect.objectContaining({
                fullName: 'John Doe',
                city: 'Bandung',
                address: 'Jl. New Address'
            }));
            req.flush({ success: true, data: mockProfile });
        });
    });
});
