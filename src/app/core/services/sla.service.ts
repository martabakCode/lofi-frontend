import { Injectable } from '@angular/core';
import { interval, map, Observable, startWith } from 'rxjs';
import { LoanSLA } from '../models/loan.models';

@Injectable({
    providedIn: 'root'
})
export class SlaService {
    /**
     * OBSERVER PATTERN
     * Provides real-time SLA updates.
     */
    getSlaStatus(startTime: string, targetHours: number = 24): Observable<LoanSLA> {
        const start = new Date(startTime).getTime();
        const targetMs = targetHours * 60 * 60 * 1000;
        const end = start + targetMs;

        return interval(1000).pipe(
            startWith(0),
            map(() => {
                const now = new Date().getTime();
                const remainingMs = end - now;
                const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
                const isExpired = remainingSeconds <= 0;

                let status: LoanSLA['status'] = 'SAFE';
                const percentRemaining = (remainingMs / targetMs) * 100;

                if (isExpired) {
                    status = 'EXPIRED';
                } else if (percentRemaining < 10) {
                    status = 'CRITICAL';
                } else if (percentRemaining < 25) {
                    status = 'WARNING';
                }

                return {
                    targetSeconds: targetMs / 1000,
                    remainingSeconds,
                    isExpired,
                    status
                };
            })
        );
    }

    formatDuration(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}
