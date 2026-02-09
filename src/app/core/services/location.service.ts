import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

export interface Province {
    id: string;
    name: string;
}

export interface Regency {
    id: string;
    province_id: string;
    name: string;
}

export interface District {
    id: string;
    regency_id: string;
    name: string;
}

export interface Village {
    id: string;
    district_id: string;
    name: string;
}

/**
 * Indonesian Location Service
 * 
 * Uses the open-source wilayah-indonesia API
 * API Documentation: https://www.emsifa.com/api-wilayah-indonesia/
 */
@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private http = inject(HttpClient);
    private readonly baseUrl = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    // Cache for provinces (rarely changes)
    private provincesCache$: Observable<Province[]> | null = null;

    /**
     * Get all provinces in Indonesia
     */
    getProvinces(): Observable<Province[]> {
        if (!this.provincesCache$) {
            this.provincesCache$ = this.http.get<Province[]>(`${this.baseUrl}/provinces.json`).pipe(
                shareReplay(1),
                catchError(error => {
                    console.error('Error fetching provinces:', error);
                    return of([]);
                })
            );
        }
        return this.provincesCache$;
    }

    /**
     * Get regencies (kota/kabupaten) by province ID
     */
    getRegencies(provinceId: string): Observable<Regency[]> {
        return this.http.get<Regency[]>(`${this.baseUrl}/regencies/${provinceId}.json`).pipe(
            catchError(error => {
                console.error('Error fetching regencies:', error);
                return of([]);
            })
        );
    }

    /**
     * Get districts (kecamatan) by regency ID
     */
    getDistricts(regencyId: string): Observable<District[]> {
        return this.http.get<District[]>(`${this.baseUrl}/districts/${regencyId}.json`).pipe(
            catchError(error => {
                console.error('Error fetching districts:', error);
                return of([]);
            })
        );
    }

    /**
     * Get villages (kelurahan/desa) by district ID
     */
    getVillages(districtId: string): Observable<Village[]> {
        return this.http.get<Village[]>(`${this.baseUrl}/villages/${districtId}.json`).pipe(
            catchError(error => {
                console.error('Error fetching villages:', error);
                return of([]);
            })
        );
    }
}
