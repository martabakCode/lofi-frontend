import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WorkflowStep {
    label: string;
    date?: string | Date;
    completed: boolean;
    current: boolean;
    by?: string;
    status?: string; // e.g. 'APPROVED', 'REJECTED'
}

@Component({
    selector: 'app-workflow-stepper',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="relative">
        <div *ngFor="let step of steps; let i = index; let last = last" class="relative pb-8 last:pb-0">
            <!-- Line connecting steps -->
            <span *ngIf="!last" 
                class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                aria-hidden="true"></span>
            
            <div class="relative flex space-x-3">
                <!-- Icon/Dot -->
                <div>
                    <span class="h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white"
                        [class.bg-green-500]="step.completed"
                        [class.bg-brand-main]="step.current"
                        [class.bg-gray-200]="!step.completed && !step.current">
                        
                        <i *ngIf="step.completed" class="pi pi-check text-white text-xs"></i>
                        <span *ngIf="!step.completed" class="text-white text-xs font-medium">{{ i + 1 }}</span>
                    </span>
                </div>
                
                <!-- Content -->
                <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                        <p class="text-sm font-medium" 
                            [class.text-gray-900]="step.completed || step.current"
                            [class.text-gray-500]="!step.completed && !step.current">
                            {{ step.label }}
                        </p>
                        <div *ngIf="step.by" class="mt-0.5 text-xs text-gray-500">
                             by {{ step.by }}
                        </div>
                    </div>
                    <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        <time *ngIf="step.date" [dateTime]="step.date.toString()">{{ step.date | date:'MMM d' }}</time>
                    </div>
                </div>
            </div>
        </div>
    </div>
  `
})
export class WorkflowStepperComponent {
    @Input() steps: WorkflowStep[] = [];
}
