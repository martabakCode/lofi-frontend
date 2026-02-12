import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../../../environments/environment';
import { ProductResponse, CreateProductRequest } from '../models/product.models';

describe('ProductService', () => {
    let service: ProductService;
    let httpMock: HttpTestingController;
    const baseUrl = `${environment.apiUrl}/products`;

    const mockProduct: ProductResponse = {
        id: '1',
        productCode: 'P001',
        productName: 'Personal Loan',
        description: 'A personal loan product',
        interestRate: 12.5,
        adminFee: 100,
        minTenor: 6,
        maxTenor: 36,
        minLoanAmount: 1000,
        maxLoanAmount: 50000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProductService]
        });
        service = TestBed.inject(ProductService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('getProducts', () => {
        it('should fetch products with pagination', () => {
            const mockResponse = {
                content: [mockProduct],
                totalElements: 1,
                totalPages: 1,
                size: 10,
                number: 0
            };

            service.getProducts({ page: 1, pageSize: 10 }).subscribe(response => {
                expect(response.items.length).toBe(1);
                expect(response.total).toBe(1);
            });

            const req = httpMock.expectOne(req => req.url === baseUrl);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockResponse });
        });

        it('should fetch products with status filter', () => {
            const mockResponse = {
                content: [mockProduct],
                totalElements: 1,
                totalPages: 1,
                size: 10,
                number: 0
            };

            service.getProducts({ page: 1, pageSize: 10, status: 'active' }).subscribe();

            const req = httpMock.expectOne(req => req.url === baseUrl);
            expect(req.request.params.get('status')).toBe('active');
            req.flush({ data: mockResponse });
        });
    });

    describe('getAllProducts', () => {
        it('should fetch all products', () => {
            service.getAllProducts().subscribe(products => {
                expect(products.length).toBe(1);
                expect(products[0].id).toBe('1');
            });

            const req = httpMock.expectOne(`${baseUrl}/all`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: [mockProduct] });
        });
    });

    describe('getProductById', () => {
        it('should fetch product by ID', () => {
            service.getProductById('1').subscribe(product => {
                expect(product.id).toBe('1');
                expect(product.productName).toBe('Personal Loan');
            });

            const req = httpMock.expectOne(`${baseUrl}/1`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockProduct });
        });
    });

    describe('createProduct', () => {
        it('should create a new product', () => {
            const newProduct: CreateProductRequest = {
                productCode: 'P002',
                productName: 'Business Loan',
                description: 'A business loan product',
                interestRate: 15,
                adminFee: 200,
                minTenor: 12,
                maxTenor: 60,
                minLoanAmount: 5000,
                maxLoanAmount: 100000
            };

            service.createProduct(newProduct).subscribe(product => {
                expect(product.id).toBe('1');
            });

            const req = httpMock.expectOne(baseUrl);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(newProduct);
            req.flush({ data: mockProduct });
        });
    });

    describe('updateProduct', () => {
        it('should update existing product', () => {
            const updateData = { productName: 'Updated Loan' };

            service.updateProduct('1', updateData).subscribe(product => {
                expect(product.id).toBe('1');
            });

            const req = httpMock.expectOne(`${baseUrl}/1`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updateData);
            req.flush({ data: mockProduct });
        });
    });

    describe('deleteProduct', () => {
        it('should delete product', () => {
            service.deleteProduct('1').subscribe(() => {
                expect(true).toBe(true);
            });

            const req = httpMock.expectOne(`${baseUrl}/1`);
            expect(req.request.method).toBe('DELETE');
            req.flush({ data: null });
        });
    });
});
