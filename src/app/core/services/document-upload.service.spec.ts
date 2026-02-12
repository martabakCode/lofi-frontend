import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentUploadService } from './document-upload.service';
import { DocumentService, PresignUploadResponse } from './document.service';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';
import { of, throwError } from 'rxjs';

describe('DocumentUploadService', () => {
    let service: DocumentUploadService;
    let documentServiceMock: jest.Mocked<DocumentService>;
    let toastServiceMock: jest.Mocked<ToastService>;

    beforeEach(() => {
        documentServiceMock = {
            uploadDocument: jest.fn()
        } as unknown as jest.Mocked<DocumentService>;

        toastServiceMock = {
            show: jest.fn()
        } as unknown as jest.Mocked<ToastService>;

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                DocumentUploadService,
                { provide: DocumentService, useValue: documentServiceMock },
                { provide: ToastService, useValue: toastServiceMock }
            ]
        });
        service = TestBed.inject(DocumentUploadService);
    });

    afterEach(() => {
        service.resetStatuses();
        jest.clearAllMocks();
    });

    describe('getStatusSignal', () => {
        it('should return status signal for KTP', () => {
            const signal = service.getStatusSignal('KTP');
            expect(signal).toBeTruthy();
            expect(signal?.()).toBe('pending');
        });

        it('should return status signal for SELFIE_KTP', () => {
            const signal = service.getStatusSignal('SELFIE_KTP');
            expect(signal).toBeTruthy();
        });

        it('should return status signal for NPWP', () => {
            const signal = service.getStatusSignal('NPWP');
            expect(signal).toBeTruthy();
        });

        it('should return status signal for SLIP_GAJI', () => {
            const signal = service.getStatusSignal('SLIP_GAJI');
            expect(signal).toBeTruthy();
        });

        it('should return null for unknown type', () => {
            const signal = service.getStatusSignal('UNKNOWN');
            expect(signal).toBeNull();
        });
    });

    describe('allDocumentsUploaded', () => {
        it('should return false when documents are pending', () => {
            expect(service.allDocumentsUploaded()).toBe(false);
        });

        it('should return true when all required documents are done', () => {
            service.ktpStatus.set('done');
            service.selfieKtpStatus.set('done');
            service.npwpStatus.set('done');
            expect(service.allDocumentsUploaded()).toBe(true);
        });

        it('should return false when one document is not done', () => {
            service.ktpStatus.set('done');
            service.selfieKtpStatus.set('done');
            service.npwpStatus.set('pending');
            expect(service.allDocumentsUploaded()).toBe(false);
        });
    });

    describe('allMarketingDocumentsUploaded', () => {
        it('should return false when slip gaji is pending', () => {
            service.ktpStatus.set('done');
            service.selfieKtpStatus.set('done');
            service.npwpStatus.set('done');
            service.slipGajiStatus.set('pending');
            expect(service.allMarketingDocumentsUploaded()).toBe(false);
        });

        it('should return true when all documents including slip gaji are done', () => {
            service.ktpStatus.set('done');
            service.selfieKtpStatus.set('done');
            service.npwpStatus.set('done');
            service.slipGajiStatus.set('done');
            expect(service.allMarketingDocumentsUploaded()).toBe(true);
        });
    });

    describe('resetStatuses', () => {
        it('should reset all statuses to pending', () => {
            service.ktpStatus.set('done');
            service.selfieKtpStatus.set('done');
            service.npwpStatus.set('done');
            service.slipGajiStatus.set('done');

            service.resetStatuses();

            expect(service.ktpStatus()).toBe('pending');
            expect(service.selfieKtpStatus()).toBe('pending');
            expect(service.npwpStatus()).toBe('pending');
            expect(service.slipGajiStatus()).toBe('pending');
        });
    });

    describe('uploadDocument', () => {
        it('should upload document successfully', (done) => {
            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const mockResponse: PresignUploadResponse = {
                uploadUrl: 'https://s3.amazonaws.com/upload',
                objectKey: 'key',
                documentId: 'doc-123'
            };

            documentServiceMock.uploadDocument.mockReturnValue(of(mockResponse));

            const onSuccess = jest.fn();
            service.uploadDocument('loan-123', file, 'KTP', { onSuccess });

            expect(service.ktpStatus()).toBe('uploading');

            setTimeout(() => {
                expect(service.ktpStatus()).toBe('done');
                expect(toastServiceMock.show).toHaveBeenCalledWith('KTP uploaded successfully', 'success');
                expect(onSuccess).toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should handle upload error', (done) => {
            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const error = { status: 500, statusText: 'Server Error', url: '/api/upload', error: {}, message: 'Error' };

            documentServiceMock.uploadDocument.mockReturnValue(throwError(() => error));

            const onError = jest.fn();
            service.uploadDocument('loan-123', file, 'KTP', { onError });

            expect(service.ktpStatus()).toBe('uploading');

            setTimeout(() => {
                expect(service.ktpStatus()).toBe('error');
                expect(toastServiceMock.show).toHaveBeenCalledWith('Failed to upload KTP', 'error');
                expect(onError).toHaveBeenCalledWith(error);
                done();
            }, 0);
        });

        it('should not show toast when silent mode is enabled', (done) => {
            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
            const mockResponse: PresignUploadResponse = {
                uploadUrl: 'https://s3.amazonaws.com/upload',
                objectKey: 'key',
                documentId: 'doc-123'
            };

            documentServiceMock.uploadDocument.mockReturnValue(of(mockResponse));

            service.uploadDocument('loan-123', file, 'KTP', { silent: true });

            setTimeout(() => {
                expect(toastServiceMock.show).not.toHaveBeenCalled();
                done();
            }, 0);
        });

        it('should do nothing for unknown document type', () => {
            const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

            service.uploadDocument('loan-123', file, 'UNKNOWN_TYPE');

            expect(documentServiceMock.uploadDocument).not.toHaveBeenCalled();
        });
    });

    describe('isDocumentUploaded', () => {
        it('should return true when document is uploaded', () => {
            service.ktpStatus.set('done');
            expect(service.isDocumentUploaded('KTP')).toBe(true);
        });

        it('should return false when document is not uploaded', () => {
            service.ktpStatus.set('pending');
            expect(service.isDocumentUploaded('KTP')).toBe(false);
        });

        it('should return false for unknown document type', () => {
            expect(service.isDocumentUploaded('UNKNOWN')).toBe(false);
        });
    });

    describe('getStatus', () => {
        it('should return current status of document type', () => {
            service.ktpStatus.set('uploading');
            expect(service.getStatus('KTP')).toBe('uploading');
        });

        it('should return pending for unknown document type', () => {
            expect(service.getStatus('UNKNOWN')).toBe('pending');
        });
    });
});
