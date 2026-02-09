import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    profilePictureUrl?: string;
    branch?: {
        id: string;
        name: string;
    };
    biodata?: UserBiodata;
}

export interface UserBiodata {
    incomeSource?: string;
    incomeType?: string;
    monthlyIncome?: number;
    age?: number;
    nik?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    city?: string;
    address?: string;
    province?: string;
    district?: string;
    subDistrict?: string;
    postalCode?: string;
    gender?: string;
    maritalStatus?: string;
    education?: string;
    occupation?: string;
    longitude?: number;
    latitude?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProfileService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/users/me`;

    getProfile(): Observable<ApiResponse<UserProfile>> {
        return this.http.get<ApiResponse<UserProfile>>(this.apiUrl);
    }

    updateProfile(profile: Partial<UserProfile & UserBiodata>): Observable<ApiResponse<UserProfile>> {
        // Flatten the request for the backend UpdateProfileRequest
        const request = {
            fullName: profile.fullName,
            phoneNumber: profile.phoneNumber,
            profilePictureUrl: profile.profilePictureUrl,
            ...profile // includes biodata fields
        };
        return this.http.put<ApiResponse<UserProfile>>(this.apiUrl, request);
    }
}
