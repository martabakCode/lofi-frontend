import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LocationService, Province, Regency, District, Village } from './location.service';

describe('LocationService', () => {
    let service: LocationService;
    let httpMock: HttpTestingController;
    const baseUrl = 'https://www.emsifa.com/api-wilayah-indonesia/api';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [LocationService]
        });
        service = TestBed.inject(LocationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getProvinces', () => {
        it('should fetch provinces and cache the result', () => {
            const mockProvinces: Province[] = [
                { id: '11', name: 'Aceh' },
                { id: '12', name: 'Sumatera Utara' }
            ];

            // First call
            service.getProvinces().subscribe(provinces => {
                expect(provinces).toEqual(mockProvinces);
            });

            const req = httpMock.expectOne(`${baseUrl}/provinces.json`);
            expect(req.request.method).toBe('GET');
            req.flush(mockProvinces);

            // Second call should use cached value (no HTTP request)
            service.getProvinces().subscribe(provinces => {
                expect(provinces).toEqual(mockProvinces);
            });
        });

        it('should handle error and return empty array', () => {
            service.getProvinces().subscribe(provinces => {
                expect(provinces).toEqual([]);
            });

            const req = httpMock.expectOne(`${baseUrl}/provinces.json`);
            req.error(new ProgressEvent('Network error'));
        });
    });

    describe('getRegencies', () => {
        it('should fetch regencies by province ID', () => {
            const mockRegencies: Regency[] = [
                { id: '1101', province_id: '11', name: 'Kab. Aceh Selatan' },
                { id: '1102', province_id: '11', name: 'Kab. Aceh Tenggara' }
            ];

            service.getRegencies('11').subscribe(regencies => {
                expect(regencies).toEqual(mockRegencies);
            });

            const req = httpMock.expectOne(`${baseUrl}/regencies/11.json`);
            expect(req.request.method).toBe('GET');
            req.flush(mockRegencies);
        });

        it('should handle error and return empty array', () => {
            service.getRegencies('11').subscribe(regencies => {
                expect(regencies).toEqual([]);
            });

            const req = httpMock.expectOne(`${baseUrl}/regencies/11.json`);
            req.error(new ProgressEvent('Network error'));
        });
    });

    describe('getDistricts', () => {
        it('should fetch districts by regency ID', () => {
            const mockDistricts: District[] = [
                { id: '110101', regency_id: '1101', name: 'Bakongan' },
                { id: '110102', regency_id: '1101', name: 'Kluet Utara' }
            ];

            service.getDistricts('1101').subscribe(districts => {
                expect(districts).toEqual(mockDistricts);
            });

            const req = httpMock.expectOne(`${baseUrl}/districts/1101.json`);
            expect(req.request.method).toBe('GET');
            req.flush(mockDistricts);
        });

        it('should handle error and return empty array', () => {
            service.getDistricts('1101').subscribe(districts => {
                expect(districts).toEqual([]);
            });

            const req = httpMock.expectOne(`${baseUrl}/districts/1101.json`);
            req.error(new ProgressEvent('Network error'));
        });
    });

    describe('getVillages', () => {
        it('should fetch villages by district ID', () => {
            const mockVillages: Village[] = [
                { id: '1101012001', district_id: '110101', name: 'Keude Bakongan' },
                { id: '1101012002', district_id: '110101', name: 'Ujong Mangki' }
            ];

            service.getVillages('110101').subscribe(villages => {
                expect(villages).toEqual(mockVillages);
            });

            const req = httpMock.expectOne(`${baseUrl}/villages/110101.json`);
            expect(req.request.method).toBe('GET');
            req.flush(mockVillages);
        });

        it('should handle error and return empty array', () => {
            service.getVillages('110101').subscribe(villages => {
                expect(villages).toEqual([]);
            });

            const req = httpMock.expectOne(`${baseUrl}/villages/110101.json`);
            req.error(new ProgressEvent('Network error'));
        });
    });
});
