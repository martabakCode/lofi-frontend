import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse, toPaginatedResponse } from '../models/api.models';
import { Notification, NotificationFilters, NotificationListResponse, NotificationStats, NotificationCreateRequest } from '../models/notification.models';

@Injectable({
    providedIn: 'root'
})
export class NotificationApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/notifications`;

    private buildParams(page: number, pageSize: number, filters: NotificationFilters): HttpParams {
        let params = new HttpParams()
            .set('page', (page - 1).toString())
            .set('size', pageSize.toString());

        if (filters.search) {
            params = params.set('search', filters.search);
        }
        if (filters.type) {
            params = params.set('type', filters.type);
        }
        if (filters.status) {
            params = params.set('status', filters.status);
        }

        return params;
    }

    getUserNotifications(): Observable<Notification[]> {
        return this.http.get<ApiResponse<Notification[]>>(`${this.baseUrl}`).pipe(
            map(res => res.data)
        );
    }

    markAsRead(id: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/${id}/read`, {});
    }

    markAllAsRead(): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/mark-all-read`, {});
    }

    getAllNotifications(page: number, pageSize: number, filters: NotificationFilters): Observable<NotificationListResponse> {
        const params = this.buildParams(page, pageSize, filters);
        return this.http.get<ApiResponse<PaginatedResponse<Notification>>>(`${this.baseUrl}`, { params }).pipe(
            map(res => toPaginatedResponse(res.data))
        );
    }

    getNotificationById(id: string): Observable<Notification> {
        return this.http.get<ApiResponse<Notification>>(`${this.baseUrl}/${id}`).pipe(
            map(res => res.data)
        );
    }

    deleteNotification(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    // Admin Only Endpoints

    getNotificationStats(): Observable<NotificationStats> {
        return this.http.get<ApiResponse<NotificationStats>>(`${this.baseUrl}/stats`).pipe(
            map(res => res.data)
        );
    }

    createNotification(request: NotificationCreateRequest): Observable<Notification> {
        return this.http.post<ApiResponse<Notification>>(`${this.baseUrl}`, request).pipe(
            map(res => res.data)
        );
    }

    bulkMarkAsRead(ids: string[]): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/bulk-read`, { notificationIds: ids });
    }

    bulkDelete(ids: string[]): Observable<void> {
        return this.http.request<void>('DELETE', `${this.baseUrl}/bulk-delete`, {
            body: { notificationIds: ids }
        });
    }

    getNotificationsByUser(userId: string, page: number, pageSize: number): Observable<NotificationListResponse> {
        const params = new HttpParams()
            .set('userId', userId)
            .set('page', (page - 1).toString())
            .set('size', pageSize.toString());

        return this.http.get<ApiResponse<PaginatedResponse<Notification>>>(`${this.baseUrl}`, { params }).pipe(
            map(res => toPaginatedResponse(res.data))
        );
    }
}
