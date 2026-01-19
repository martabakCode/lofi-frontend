import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlaService } from '../../../core/services/sla.service';
import { LoanSLA } from '../../../core/models/loan.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sla-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 group relative cursor-help">
      <div [ngClass]="{
            'inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300': true,
            'bg-green-500/10 text-green-600 border border-green-500/20': sla().status === 'SAFE',
            'bg-amber-500/10 text-amber-600 border border-amber-500/20': sla().status === 'WARNING',
            'bg-red-500/10 text-red-600 border border-red-500/20 animate-pulse': sla().status === 'CRITICAL',
            'bg-surface-900 text-white border border-surface-700 dark:text-surface-100': sla().status === 'EXPIRED'
        }">
        <i class="pi pi-clock mr-1.5" [class.pi-spin]="sla().status === 'CRITICAL'"></i>
        <span class="font-mono font-bold">{{ timeDisplay() }}</span>
      </div>
      
      <!-- Tooltip -->
      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-surface-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible z-10 shadow-xl dark:text-surface-100">
        <span class="text-xs font-semibold">SLA Status: {{ sla().status }}</span>
        <div class="w-full bg-surface-600/20 h-1 rounded-full mt-1">
          <div [className]="'h-full rounded-full transition-all duration-500 ' + progressColor()" 
               [style.width.%]="progress()"></div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class SlaBadgeComponent implements OnInit {
  @Input({ required: true }) startTime!: string;
  @Input() targetHours: number = 24;

  private slaService = inject(SlaService);
  private destroy$ = new Subject<void>();

  sla = signal<LoanSLA>({
    targetSeconds: 0,
    remainingSeconds: 0,
    isExpired: false,
    status: 'SAFE'
  });

  timeDisplay = signal<string>('00:00:00');
  progress = signal<number>(100);
  progressColor = signal<string>('bg-green-500 dark:bg-green-500');

  ngOnInit() {
    this.slaService.getSlaStatus(this.startTime, this.targetHours)
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.sla.set(status);
        this.timeDisplay.set(this.slaService.formatDuration(status.remainingSeconds));

        const prog = (status.remainingSeconds / status.targetSeconds) * 100;
        this.progress.set(prog);

        switch (status.status) {
          case 'SAFE': this.progressColor.set('bg-green-500'); break;
          case 'WARNING': this.progressColor.set('bg-amber-500'); break;
          case 'CRITICAL': this.progressColor.set('bg-red-500'); break;
          case 'EXPIRED': this.progressColor.set('bg-surface-400'); break;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
