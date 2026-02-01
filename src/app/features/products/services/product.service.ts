import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse, PaginationParams, toPaginatedResponse } from '../../../core/models/api.models';
import { ProductResponse, CreateProductRequest } from '../models/product.models';

export interface ProductFilterParams extends PaginationParams {
    status?: 'active' | 'inactive';
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/products`;

    private buildParams(params: PaginationParams): HttpParams {
        let httpParams = new HttpParams();
        if (params.page !== undefined) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.pageSize !== undefined) {
            httpParams = httpParams.set('size', params.pageSize.toString());
        }
        if (params.sort) {
            httpParams = httpParams.set('sort', params.sort);
        }
        if (params.search) {
            httpParams = httpParams.set('search', params.search);
        }
        return httpParams;
    }

    getProducts(params?: ProductFilterParams): Observable<{ items: ProductResponse[]; total: number; page: number; pageSize: number; totalPages: number }> {
        let httpParams = this.buildParams(params || {});

        if (params?.status) {
            httpParams = httpParams.set('status', params.status);
        }

        return this.http.get<ApiResponse<PaginatedResponse<ProductResponse>>>(this.baseUrl, { params: httpParams }).pipe(
            map(res => toPaginatedResponse(res.data))
        );
    }

    getAllProducts(): Observable<ProductResponse[]> {
        return this.http.get<ApiResponse<ProductResponse[]>>(`${this.baseUrl}/all`).pipe(
            map(res => res.data)
        );
    }

    getProductById(id: string): Observable<ProductResponse> {
        return this.http.get<ApiResponse<ProductResponse>>(`${this.baseUrl}/${id}`).pipe(
            map(res => res.data)
        );
    }

    createProduct(request: CreateProductRequest): Observable<ProductResponse> {
        return this.http.post<ApiResponse<ProductResponse>>(this.baseUrl, request).pipe(
            map(res => res.data)
        );
    }

    updateProduct(id: string, request: Partial<CreateProductRequest>): Observable<ProductResponse> {
        return this.http.put<ApiResponse<ProductResponse>>(`${this.baseUrl}/${id}`, request).pipe(
            map(res => res.data)
        );
    }

    deleteProduct(id: string): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
            map(() => undefined)
        );
    }
}
