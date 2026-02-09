import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlaBadgeComponent } from './sla-badge.component';
import { SlaService } from '../../../core/services/sla.service';
import { of } from 'rxjs';
import { LoanSLA } from '../../../core/models/loan.models';
import { By } from '@angular/platform-browser';

describe('SlaBadgeComponent', () => {
    let component: SlaBadgeComponent;
    let fixture: ComponentFixture<SlaBadgeComponent>;
    let slaServiceMock: jest.Mocked<SlaService>;

    const mockSla: LoanSLA = {
        targetSeconds: 86400,
        remainingSeconds: 43200,
        isExpired: false,
        status: 'SAFE'
    };

    beforeEach(async () => {
        slaServiceMock = {
            getSlaStatus: jest.fn().mockReturnValue(of(mockSla)),
            formatDuration: jest.fn().mockReturnValue('12:00:00')
        } as unknown as jest.Mocked<SlaService>;

        await TestBed.configureTestingModule({
            imports: [SlaBadgeComponent],
            providers: [
                { provide: SlaService, useValue: slaServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SlaBadgeComponent);
        component = fixture.componentInstance;
        component.startTime = new Date().toISOString();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with SLA data from service', () => {
        expect(slaServiceMock.getSlaStatus).toHaveBeenCalledWith(component.startTime, 24);
        expect(component.sla()).toEqual(mockSla);
        expect(component.timeDisplay()).toBe('12:00:00');
    });

    it('should display the time correctly', () => {
        const span = fixture.debugElement.query(By.css('span.font-mono')).nativeElement;
        expect(span.textContent).toBe('12:00:00');
    });

    it('should update classes based on status', () => {
        // Test WARNING status
        const warningSla: LoanSLA = { ...mockSla, status: 'WARNING' };
        slaServiceMock.getSlaStatus.mockReturnValue(of(warningSla));

        component.ngOnInit();
        fixture.detectChanges();

        const div = fixture.debugElement.query(By.css('div[class*="rounded-lg"]')).nativeElement;
        expect(div.className).toContain('text-amber-600');
    });

    it('should update progress progressColor based on status', () => {
        // Test CRITICAL status
        const criticalSla: LoanSLA = { ...mockSla, status: 'CRITICAL' };
        slaServiceMock.getSlaStatus.mockReturnValue(of(criticalSla));

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.progressColor()).toBe('bg-red-500');
    });

    it('should calculate progress percentage correctly', () => {
        const halfSla: LoanSLA = {
            targetSeconds: 100,
            remainingSeconds: 60,
            isExpired: false,
            status: 'SAFE'
        };
        slaServiceMock.getSlaStatus.mockReturnValue(of(halfSla));

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.progress()).toBe(60);
    });

    it('should handle EXPIRED status', () => {
        const expiredSla: LoanSLA = {
            targetSeconds: 100,
            remainingSeconds: 0,
            isExpired: true,
            status: 'EXPIRED'
        };
        slaServiceMock.getSlaStatus.mockReturnValue(of(expiredSla));

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.progressColor()).toBe('bg-slate-400');
    });
});
