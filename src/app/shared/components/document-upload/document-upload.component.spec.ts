import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentUploadComponent, DocumentConfig } from './document-upload.component';
import { DocumentUploadService, DocumentUploadStatus } from '../../../core/services/document-upload.service';
import { signal, WritableSignal } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('DocumentUploadComponent', () => {
    let component: DocumentUploadComponent;
    let fixture: ComponentFixture<DocumentUploadComponent>;
    let docServiceMock: any;

    const mockDocs: DocumentConfig[] = [
        { type: 'KTP', label: 'Identity Card', required: true },
        { type: 'NPWP', label: 'Tax ID', required: false }
    ];

    const statuses: Record<string, WritableSignal<DocumentUploadStatus>> = {
        'KTP': signal<DocumentUploadStatus>('pending'),
        'NPWP': signal<DocumentUploadStatus>('pending')
    };

    beforeEach(async () => {
        docServiceMock = {
            getStatus: jest.fn((type: string) => statuses[type] ? statuses[type]() : 'pending'),
            getStatusSignal: jest.fn((type: string) => statuses[type]),
            uploadDocument: jest.fn(),
            resetStatuses: jest.fn()
        };

        await TestBed.configureTestingModule({
            imports: [DocumentUploadComponent],
            providers: [
                { provide: DocumentUploadService, useValue: docServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DocumentUploadComponent);
        component = fixture.componentInstance;
        component.documents = mockDocs;
        component.loanId = 'loan-123';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render all document items', () => {
        const items = fixture.debugElement.queryAll(By.css('.document-item'));
        expect(items.length).toBe(2);
    });

    it('should display correct labels', () => {
        const labels = fixture.debugElement.queryAll(By.css('h4'));
        expect(labels[0].nativeElement.textContent).toBe('Identity Card');
        expect(labels[1].nativeElement.textContent).toBe('Tax ID');
    });

    it('should show correct status text for pending', () => {
        const p = fixture.debugElement.query(By.css('p')).nativeElement;
        expect(p.textContent).toContain('Waiting for upload (Required)');
    });

    it('should handle file selection and call upload service', () => {
        const file = new File([''], 'test.png', { type: 'image/png' });
        const event = { target: { files: [file] } } as any;

        component.onFileSelected(event, 'KTP');

        expect(docServiceMock.uploadDocument).toHaveBeenCalledWith(
            'loan-123',
            file,
            'KTP',
            expect.any(Object)
        );
    });

    it('should not upload if loanId is missing', () => {
        component.loanId = null;
        const file = new File([''], 'test.png', { type: 'image/png' });
        const event = { target: { files: [file] } } as any;

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        component.onFileSelected(event, 'KTP');

        expect(docServiceMock.uploadDocument).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith('Cannot upload: loanId is not set');
        consoleSpy.mockRestore();
    });

    it('should show success checkmark and change button when done', () => {
        statuses['KTP'].set('done');
        fixture.detectChanges();

        const checkmark = fixture.debugElement.query(By.css('.text-green-600'));
        const changeBtn = fixture.debugElement.query(By.css('button'));

        expect(checkmark).toBeTruthy();
        expect(checkmark.nativeElement.textContent).toBe('✓');
        expect(changeBtn.nativeElement.textContent).toContain('Change');
    });

    it('should show spinner when uploading', () => {
        statuses['KTP'].set('uploading');
        fixture.detectChanges();

        const spinner = fixture.debugElement.query(By.css('.animate-spin'));
        expect(spinner).toBeTruthy();
        expect(spinner.nativeElement.textContent).toBe('⏳');
    });

    it('should calculate allRequiredUploaded correctly', () => {
        statuses['KTP'].set('pending');
        expect(component.allRequiredUploaded).toBe(false);

        statuses['KTP'].set('done');
        expect(component.allRequiredUploaded).toBe(true);
    });

    it('should reset statuses when calling reset()', () => {
        component.reset();
        expect(docServiceMock.resetStatuses).toHaveBeenCalled();
    });

    it('should allow reuploading a document', () => {
        statuses['KTP'].set('done');
        fixture.detectChanges();

        component.reupload('KTP');
        expect(statuses['KTP']()).toBe('pending');
    });
});
