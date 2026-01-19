import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../core/models/api.models';
import { ProductResponse, CreateProductRequest } from '../models/product.models';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/products`;

    getProducts(): Observable<ProductResponse[]> {
        return this.http.get<ApiResponse<PaginatedResponse<ProductResponse>>>(this.baseUrl).pipe(
            map(res => res.data.items || res.data.content || [])
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
