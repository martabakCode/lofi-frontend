import { TestBed } from '@angular/core/testing';
import { SlaService } from './sla.service';
import { firstValueFrom, take, toArray } from 'rxjs';

describe('SlaService', () => {
    let service: SlaService;

    beforeEach(() => {
        service = new SlaService();
    });

    it('should calculate SAFE status correctly', async () => {
        const now = new Date();
        // Start 1 hour ago
        const startTime = new Date(now.getTime() - 60 * 60 * 1000).toISOString();

        const sla$ = service.getSlaStatus(startTime, 24).pipe(take(1));
        const sla = await firstValueFrom(sla$);

        expect(sla.status).toBe('SAFE');
        expect(sla.isExpired).toBe(false);
        expect(sla.remainingSeconds).toBeGreaterThan(20 * 3600);
    });

    it('should calculate EXPIRED status correctly', async () => {
        const now = new Date();
        // Start 25 hours ago
        const startTime = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();

        const sla$ = service.getSlaStatus(startTime, 24).pipe(take(1));
        const sla = await firstValueFrom(sla$);

        expect(sla.status).toBe('EXPIRED');
        expect(sla.isExpired).toBe(true);
        expect(sla.remainingSeconds).toBe(0);
    });

    it('should format duration correctly', () => {
        expect(service.formatDuration(3661)).toBe('01:01:01');
        expect(service.formatDuration(60)).toBe('00:01:00');
    });
});
