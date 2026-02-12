import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent, StatusType } from './status-badge.component';
import { By } from '@angular/platform-browser';

describe('StatusBadgeComponent', () => {
    let component: StatusBadgeComponent;
    let fixture: ComponentFixture<StatusBadgeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [StatusBadgeComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(StatusBadgeComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('status type mappings - SUCCESS', () => {
        const successStatuses: StatusType[] = ['SUCCESS', 'ACTIVE', 'APPROVED', 'COMPLETED'];

        successStatuses.forEach(status => {
            it(`should apply success classes for status: ${status}`, () => {
                component.status = status;
                fixture.detectChanges();

                const badgeElement = fixture.debugElement.query(By.css('span'));
                expect(badgeElement.nativeElement.classList.contains('bg-[var(--success-bg)]')).toBe(true);
                expect(badgeElement.nativeElement.classList.contains('text-[var(--success-text)]')).toBe(true);
            });

            it(`should apply green dot for status: ${status}`, () => {
                component.status = status;
                fixture.detectChanges();

                const dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
                expect(dotElement.nativeElement.classList.contains('bg-green-400')).toBe(true);
            });
        });
    });

    describe('status type mappings - WARNING', () => {
        const warningStatuses: StatusType[] = ['WARNING', 'PENDING', 'REVIEW', 'SUBMITTED'];

        warningStatuses.forEach(status => {
            it(`should apply warning classes for status: ${status}`, () => {
                component.status = status;
                fixture.detectChanges();

                const badgeElement = fixture.debugElement.query(By.css('span'));
                expect(badgeElement.nativeElement.classList.contains('bg-[var(--warning-bg)]')).toBe(true);
                expect(badgeElement.nativeElement.classList.contains('text-[var(--warning-text)]')).toBe(true);
            });

            it(`should apply yellow dot for status: ${status}`, () => {
                component.status = status;
                fixture.detectChanges();

                const dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
                expect(dotElement.nativeElement.classList.contains('bg-yellow-400')).toBe(true);
            });
        });
    });

    describe('status type mappings - ERROR', () => {
        const errorStatuses: StatusType[] = ['ERROR', 'REJECTED', 'INACTIVE', 'DELETE'];

        errorStatuses.forEach(status => {
            it(`should apply error classes for status: ${status}`, () => {
                component.status = status;
                fixture.detectChanges();

                const badgeElement = fixture.debugElement.query(By.css('span'));
                expect(badgeElement.nativeElement.classList.contains('bg-[var(--error-bg)]')).toBe(true);
                expect(badgeElement.nativeElement.classList.contains('text-[var(--error-text)]')).toBe(true);
            });

            it(`should apply red dot for status: ${status}`, () => {
                component.status = status;
                fixture.detectChanges();

                const dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
                expect(dotElement.nativeElement.classList.contains('bg-red-400')).toBe(true);
            });
        });
    });

    describe('status type mappings - INFO', () => {
        const infoStatuses: StatusType[] = ['INFO', 'DRAFT'];

        infoStatuses.forEach(status => {
            it(`should apply info classes for status: ${status}`, () => {
                component.status = status;
                fixture.detectChanges();

                const badgeElement = fixture.debugElement.query(By.css('span'));
                expect(badgeElement.nativeElement.classList.contains('bg-[var(--info-bg)]')).toBe(true);
                expect(badgeElement.nativeElement.classList.contains('text-[var(--info-text)]')).toBe(true);
            });

            it(`should apply blue dot for status: ${status}`, () => {
                component.status = status;
                fixture.detectChanges();

                const dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
                expect(dotElement.nativeElement.classList.contains('bg-blue-400')).toBe(true);
            });
        });
    });

    describe('default status', () => {
        it('should apply default classes for unknown status', () => {
            component.status = 'UNKNOWN' as StatusType;
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('bg-bg-muted')).toBe(true);
            expect(badgeElement.nativeElement.classList.contains('text-text-secondary')).toBe(true);
        });

        it('should apply gray dot for default status', () => {
            component.status = '' as StatusType;
            fixture.detectChanges();

            const dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
            expect(dotElement.nativeElement.classList.contains('bg-gray-400')).toBe(true);
        });

        it('should apply gray dot for unknown status', () => {
            component.status = 'RANDOM' as StatusType;
            fixture.detectChanges();

            const dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
            expect(dotElement.nativeElement.classList.contains('bg-gray-400')).toBe(true);
        });
    });

    describe('label', () => {
        it('should display label when provided', () => {
            component.status = 'SUCCESS';
            component.label = 'Custom Label';
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.textContent).toContain('Custom Label');
        });

        it('should display status when label is not provided', () => {
            component.status = 'PENDING';
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.textContent).toContain('PENDING');
        });

        it('should prioritize label over status', () => {
            component.status = 'ERROR';
            component.label = 'Custom Error Label';
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.textContent).toContain('Custom Error Label');
            expect(badgeElement.nativeElement.textContent).not.toContain('ERROR');
        });
    });

    describe('showDot', () => {
        it('should show dot by default', () => {
            component.status = 'SUCCESS';
            fixture.detectChanges();

            const dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
            expect(dotElement).toBeTruthy();
        });

        it('should hide dot when showDot is false', () => {
            component.status = 'SUCCESS';
            component.showDot = false;
            fixture.detectChanges();

            const dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
            expect(dotElement).toBeFalsy();
        });

        it('should hide dot when showDot is explicitly false', () => {
            component.status = 'PENDING';
            component.showDot = false;
            fixture.detectChanges();

            const dotElement = fixture.debugElement.query(By.css('.rounded-full'));
            expect(dotElement).toBeFalsy();
        });
    });

    describe('base classes', () => {
        it('should apply inline-flex class', () => {
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('inline-flex')).toBe(true);
        });

        it('should apply items-center class', () => {
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('items-center')).toBe(true);
        });

        it('should apply rounded-full class', () => {
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('rounded-full')).toBe(true);
        });

        it('should apply text-xs font-medium class', () => {
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('text-xs')).toBe(true);
            expect(badgeElement.nativeElement.classList.contains('font-medium')).toBe(true);
        });

        it('should apply border class', () => {
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('border')).toBe(true);
        });
    });

    describe('case insensitivity', () => {
        it('should handle lowercase status', () => {
            component.status = 'success' as StatusType;
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('bg-[var(--success-bg)]')).toBe(true);
        });

        it('should handle mixed case status', () => {
            component.status = 'SuCcEsS' as StatusType;
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('bg-[var(--success-bg)]')).toBe(true);
        });

        it('should handle uppercase status', () => {
            component.status = 'PENDING';
            fixture.detectChanges();

            const badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('bg-[var(--warning-bg)]')).toBe(true);
        });
    });

    describe('ngOnInit', () => {
        it('should call ngOnInit without errors', () => {
            expect(() => component.ngOnInit()).not.toThrow();
        });
    });

    describe('status property changes', () => {
        it('should update badge class when status changes', () => {
            component.status = 'SUCCESS';
            fixture.detectChanges();

            let badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('bg-[var(--success-bg)]')).toBe(true);

            component.status = 'ERROR';
            fixture.detectChanges();

            badgeElement = fixture.debugElement.query(By.css('span'));
            expect(badgeElement.nativeElement.classList.contains('bg-[var(--error-bg)]')).toBe(true);
        });

        it('should update dot class when status changes', () => {
            component.status = 'SUCCESS';
            fixture.detectChanges();

            let dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
            expect(dotElement.nativeElement.classList.contains('bg-green-400')).toBe(true);

            component.status = 'ERROR';
            fixture.detectChanges();

            dotElement = fixture.debugElement.query(By.css('.w-1\\.5'));
            expect(dotElement.nativeElement.classList.contains('bg-red-400')).toBe(true);
        });
    });
});
