import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';

export interface PresignUploadResponse {
    uploadUrl: string;
    objectKey: string;
    documentId: string;
}

export interface DownloadUrlResponse {
    downloadUrl: string;
    fileName: string;
}

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/documents`;

    presignUpload(loanId: string | null, fileName: string, documentType: string, contentType: string): Observable<PresignUploadResponse> {
        return this.http.post<ApiResponse<PresignUploadResponse>>(`${this.apiUrl}/presign-upload`, {
            loanId,
            fileName,
            documentType,
            contentType
        }).pipe(
            map(res => res.data)
        );
    }

    uploadFileToUrl(url: string, file: File): Observable<any> {
        return this.http.put(url, file, {
            headers: {
                'Content-Type': file.type
            }
        });
    }

    // Helper to do both steps
    uploadDocument(loanId: string | null, file: File, documentType: string): Observable<PresignUploadResponse> {
        let presignResponse: PresignUploadResponse;
        return this.presignUpload(loanId, file.name, documentType, file.type).pipe(
            switchMap(presign => {
                presignResponse = presign;
                return this.uploadFileToUrl(presign.uploadUrl, file);
            }),
            map(() => presignResponse)
        );
    }

    uploadProfilePicture(file: File): Observable<PresignUploadResponse> {
        return this.uploadDocument(null, file, 'PROFILE_PICTURE');
    }

    getDownloadUrl(documentId: string): Observable<DownloadUrlResponse> {
        return this.http.get<ApiResponse<DownloadUrlResponse>>(`${this.apiUrl}/${documentId}/download`).pipe(
            map(res => res.data)
        );
    }
}
