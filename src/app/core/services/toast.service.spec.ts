import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, ToastType } from './toast.service';

describe('ToastService', () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ToastService]
        });
        service = TestBed.inject(ToastService);
    });

    describe('show', () => {
        it('should add a toast message', () => {
            service.show('Test message', 'success');

            const toasts = service.toasts();
            expect(toasts).toHaveLength(1);
            expect(toasts[0].message).toBe('Test message');
            expect(toasts[0].type).toBe('success');
        });

        it('should auto-increment toast ids', () => {
            service.show('First message', 'info');
            service.show('Second message', 'error');

            const toasts = service.toasts();
            expect(toasts).toHaveLength(2);
            expect(toasts[0].id).toBe(0);
            expect(toasts[1].id).toBe(1);
        });

        it('should default to info type when not specified', () => {
            service.show('Default type message');

            const toasts = service.toasts();
            expect(toasts[0].type).toBe('info');
        });

        it('should support all toast types', () => {
            const types: ToastType[] = ['success', 'error', 'warning', 'info'];

            types.forEach((type, index) => {
                service.show(`Message ${index}`, type);
            });

            const toasts = service.toasts();
            expect(toasts).toHaveLength(4);
            expect(toasts.map(t => t.type)).toEqual(types);
        });
    });

    describe('remove', () => {
        it('should remove a toast by id', () => {
            service.show('First', 'info');
            service.show('Second', 'info');
            service.show('Third', 'info');

            service.remove(1);

            const toasts = service.toasts();
            expect(toasts).toHaveLength(2);
            expect(toasts.map(t => t.message)).toEqual(['First', 'Third']);
        });

        it('should do nothing when removing non-existent id', () => {
            service.show('Test', 'info');

            service.remove(999);

            expect(service.toasts()).toHaveLength(1);
        });
    });

    describe('auto-dismiss', () => {
        it('should auto-dismiss toast after 5 seconds', fakeAsync(() => {
            service.show('Auto dismiss', 'info');

            expect(service.toasts()).toHaveLength(1);

            tick(5000);

            expect(service.toasts()).toHaveLength(0);
        }));

        it('should only dismiss the specific toast after timeout', fakeAsync(() => {
            service.show('First', 'info');
            tick(2000);
            service.show('Second', 'info');

            tick(3000); // First toast reaches 5 seconds
            expect(service.toasts()).toHaveLength(1);
            expect(service.toasts()[0].message).toBe('Second');

            tick(2000); // Second toast reaches 5 seconds
            expect(service.toasts()).toHaveLength(0);
        }));
    });
});
