import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService, PresignUploadResponse, DownloadUrlResponse } from './document.service';
import { environment } from '../../../environments/environment';

describe('DocumentService', () => {
    let service: DocumentService;
    let httpMock: HttpTestingController;
    const apiUrl = `${environment.apiUrl}/documents`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DocumentService]
        });
        service = TestBed.inject(DocumentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe('presignUpload', () => {
        it('should get presigned upload URL', () => {
            const mockResponse: PresignUploadResponse = {
                uploadUrl: 'https://s3.amazonaws.com/bucket/upload',
                objectKey: 'documents/test-file.pdf',
                documentId: 'doc-123'
            };

            service.presignUpload('loan-123', 'test-file.pdf', 'KTP', 'application/pdf')
                .subscribe(response => {
                    expect(response).toEqual(mockResponse);
                });

            const req = httpMock.expectOne(`${apiUrl}/presign-upload`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual({
                loanId: 'loan-123',
                fileName: 'test-file.pdf',
                documentType: 'KTP',
                contentType: 'application/pdf'
            });
            req.flush({ data: mockResponse });
        });

        it('should handle null loanId', () => {
            const mockResponse: PresignUploadResponse = {
                uploadUrl: 'https://s3.amazonaws.com/bucket/upload',
                objectKey: 'documents/test-file.pdf',
                documentId: 'doc-123'
            };

            service.presignUpload(null, 'test-file.pdf', 'KTP', 'application/pdf')
                .subscribe(response => {
                    expect(response).toEqual(mockResponse);
                });

            const req = httpMock.expectOne(`${apiUrl}/presign-upload`);
            expect(req.request.body.loanId).toBeNull();
            req.flush({ data: mockResponse });
        });
    });

    describe('uploadFileToUrl', () => {
        it('should upload file to presigned URL', () => {
            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const uploadUrl = 'https://s3.amazonaws.com/bucket/upload';

            service.uploadFileToUrl(uploadUrl, file).subscribe(response => {
                expect(response).toBeTruthy();
            });

            const req = httpMock.expectOne(uploadUrl);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toBe(file);
            expect(req.request.headers.get('Content-Type')).toBe('application/pdf');
            req.flush({});
        });
    });

    describe('uploadDocument', () => {
        it('should upload document in two steps', () => {
            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const presignResponse: PresignUploadResponse = {
                uploadUrl: 'https://s3.amazonaws.com/bucket/upload',
                objectKey: 'documents/test-file.pdf',
                documentId: 'doc-123'
            };

            service.uploadDocument('loan-123', file, 'KTP').subscribe(response => {
                expect(response).toEqual(presignResponse);
            });

            // First request: presign
            const presignReq = httpMock.expectOne(`${apiUrl}/presign-upload`);
            expect(presignReq.request.method).toBe('POST');
            presignReq.flush({ data: presignResponse });

            // Second request: upload to presigned URL
            const uploadReq = httpMock.expectOne(presignResponse.uploadUrl);
            expect(uploadReq.request.method).toBe('PUT');
            uploadReq.flush({});
        });
    });

    describe('uploadProfilePicture', () => {
        it('should upload profile picture', () => {
            const file = new File(['content'], 'profile.jpg', { type: 'image/jpeg' });
            const presignResponse: PresignUploadResponse = {
                uploadUrl: 'https://s3.amazonaws.com/bucket/upload',
                objectKey: 'documents/profile.jpg',
                documentId: 'doc-456'
            };

            service.uploadProfilePicture(file).subscribe(response => {
                expect(response).toEqual(presignResponse);
            });

            const presignReq = httpMock.expectOne(`${apiUrl}/presign-upload`);
            expect(presignReq.request.body.documentType).toBe('PROFILE_PICTURE');
            expect(presignReq.request.body.loanId).toBeNull();
            presignReq.flush({ data: presignResponse });

            const uploadReq = httpMock.expectOne(presignResponse.uploadUrl);
            uploadReq.flush({});
        });
    });

    describe('getDownloadUrl', () => {
        it('should get download URL for document', () => {
            const mockResponse: DownloadUrlResponse = {
                downloadUrl: 'https://s3.amazonaws.com/bucket/download',
                fileName: 'test-file.pdf'
            };

            service.getDownloadUrl('doc-123').subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(`${apiUrl}/doc-123/download`);
            expect(req.request.method).toBe('GET');
            req.flush({ data: mockResponse });
        });
    });
});
