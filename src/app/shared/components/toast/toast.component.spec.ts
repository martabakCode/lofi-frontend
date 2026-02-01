import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ToastComponent } from './toast.component';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ToastComponent', () => {
    let component: ToastComponent;
    let fixture: ComponentFixture<ToastComponent>;
    let toastServiceMock: jest.Mocked<ToastService>;

    beforeEach(() => {
        toastServiceMock = {
            toasts: signal<ToastMessage[]>([]),
            remove: jest.fn()
        } as unknown as jest.Mocked<ToastService>;

        TestBed.configureTestingModule({
            imports: [ToastComponent, NoopAnimationsModule],
            providers: [
                { provide: ToastService, useValue: toastServiceMock }
            ]
        });

        fixture = TestBed.createComponent(ToastComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display no toasts when empty', () => {
        toastServiceMock.toasts.set([]);
        fixture.detectChanges();

        const toastElements = fixture.debugElement.queryAll(By.css('[class*="rounded-lg"]'));
        expect(toastElements.length).toBe(0);
    });

    it('should display toasts when present', () => {
        toastServiceMock.toasts.set([
            { id: 1, message: 'Test message', type: 'info' }
        ]);
        fixture.detectChanges();

        const toastElements = fixture.debugElement.queryAll(By.css('.pointer-events-auto'));
        expect(toastElements.length).toBe(1);
    });

    it('should display multiple toasts', () => {
        toastServiceMock.toasts.set([
            { id: 1, message: 'First message', type: 'success' },
            { id: 2, message: 'Second message', type: 'error' }
        ]);
        fixture.detectChanges();

        const toastElements = fixture.debugElement.queryAll(By.css('.pointer-events-auto'));
        expect(toastElements.length).toBe(2);
    });

    it('should call remove when toast is clicked', () => {
        toastServiceMock.toasts.set([
            { id: 1, message: 'Click me', type: 'info' }
        ]);
        fixture.detectChanges();

        const toastElement = fixture.debugElement.query(By.css('.pointer-events-auto'));
        toastElement.triggerEventHandler('click', null);

        expect(toastServiceMock.remove).toHaveBeenCalledWith(1);
    });

    describe('getClasses', () => {
        it('should return green class for success type', () => {
            const result = component.getClasses('success');
            expect(result).toBe('bg-green-600');
        });

        it('should return red class for error type', () => {
            const result = component.getClasses('error');
            expect(result).toBe('bg-red-600');
        });

        it('should return yellow class for warning type', () => {
            const result = component.getClasses('warning');
            expect(result).toBe('bg-yellow-600');
        });

        it('should return blue class for info type', () => {
            const result = component.getClasses('info');
            expect(result).toBe('bg-blue-600');
        });
    });

    it('should display correct icon for success toast', () => {
        toastServiceMock.toasts.set([
            { id: 1, message: 'Success!', type: 'success' }
        ]);
        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('span')).nativeElement;
        expect(icon.textContent).toContain('✅');
    });

    it('should display correct icon for error toast', () => {
        toastServiceMock.toasts.set([
            { id: 1, message: 'Error!', type: 'error' }
        ]);
        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('span')).nativeElement;
        expect(icon.textContent).toContain('❌');
    });

    it('should display correct icon for warning toast', () => {
        toastServiceMock.toasts.set([
            { id: 1, message: 'Warning!', type: 'warning' }
        ]);
        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('span')).nativeElement;
        expect(icon.textContent).toContain('⚠️');
    });

    it('should display correct icon for info toast', () => {
        toastServiceMock.toasts.set([
            { id: 1, message: 'Info!', type: 'info' }
        ]);
        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('span')).nativeElement;
        expect(icon.textContent).toContain('ℹ️');
    });
});
