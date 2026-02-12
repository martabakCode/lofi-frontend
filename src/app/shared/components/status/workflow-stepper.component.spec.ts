import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkflowStepperComponent, WorkflowStep } from './workflow-stepper.component';
import { By } from '@angular/platform-browser';

describe('WorkflowStepperComponent', () => {
    let component: WorkflowStepperComponent;
    let fixture: ComponentFixture<WorkflowStepperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WorkflowStepperComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(WorkflowStepperComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('steps rendering', () => {
        it('should render all provided steps', () => {
            component.steps = [
                { label: 'Step 1', completed: true, current: false },
                { label: 'Step 2', completed: false, current: true },
                { label: 'Step 3', completed: false, current: false }
            ];
            fixture.detectChanges();

            const stepElements = fixture.debugElement.queryAll(By.css('.relative.flex'));
            expect(stepElements.length).toBe(3);
        });

        it('should render no steps when steps array is empty', () => {
            component.steps = [];
            fixture.detectChanges();

            const stepElements = fixture.debugElement.queryAll(By.css('.relative.flex'));
            expect(stepElements.length).toBe(0);
        });
    });

    describe('completed step styling', () => {
        it('should apply green background for completed steps', () => {
            component.steps = [
                { label: 'Completed Step', completed: true, current: false }
            ];
            fixture.detectChanges();

            const stepIcon = fixture.debugElement.query(By.css('.h-8.w-8'));
            expect(stepIcon.nativeElement.classList.contains('bg-green-500')).toBe(true);
        });

        it('should show check icon for completed steps', () => {
            component.steps = [
                { label: 'Completed Step', completed: true, current: false }
            ];
            fixture.detectChanges();

            const checkIcon = fixture.debugElement.query(By.css('.pi-check'));
            expect(checkIcon).toBeTruthy();
        });

        it('should apply correct text color for completed step labels', () => {
            component.steps = [
                { label: 'Completed Step', completed: true, current: false }
            ];
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('.text-sm.font-medium'));
            expect(label.nativeElement.classList.contains('text-gray-900')).toBe(true);
        });
    });

    describe('current step styling', () => {
        it('should apply brand main background for current step', () => {
            component.steps = [
                { label: 'Current Step', completed: false, current: true }
            ];
            fixture.detectChanges();

            const stepIcon = fixture.debugElement.query(By.css('.h-8.w-8'));
            expect(stepIcon.nativeElement.classList.contains('bg-brand-main')).toBe(true);
        });

        it('should show step number for current step', () => {
            component.steps = [
                { label: 'Current Step', completed: false, current: true }
            ];
            fixture.detectChanges();

            const stepNumber = fixture.debugElement.query(By.css('.text-xs.font-medium'));
            expect(stepNumber).toBeTruthy();
            expect(stepNumber.nativeElement.textContent).toContain('1');
        });
    });

    describe('pending step styling', () => {
        it('should apply gray background for pending steps', () => {
            component.steps = [
                { label: 'Pending Step', completed: false, current: false }
            ];
            fixture.detectChanges();

            const stepIcon = fixture.debugElement.query(By.css('.h-8.w-8'));
            expect(stepIcon.nativeElement.classList.contains('bg-gray-200')).toBe(true);
        });

        it('should show step number for pending steps', () => {
            component.steps = [
                { label: 'Pending Step', completed: false, current: false }
            ];
            fixture.detectChanges();

            const stepNumber = fixture.debugElement.query(By.css('.text-xs.font-medium'));
            expect(stepNumber).toBeTruthy();
        });

        it('should apply gray text color for pending step labels', () => {
            component.steps = [
                { label: 'Pending Step', completed: false, current: false }
            ];
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('.text-sm.font-medium'));
            expect(label.nativeElement.classList.contains('text-gray-500')).toBe(true);
        });
    });

    describe('step content', () => {
        it('should render step label', () => {
            component.steps = [
                { label: 'Application Submitted', completed: true, current: false }
            ];
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('.text-sm.font-medium'));
            expect(label.nativeElement.textContent).toContain('Application Submitted');
        });

        it('should render step date when provided', () => {
            const testDate = new Date('2024-01-15');
            component.steps = [
                { label: 'Step with Date', completed: true, current: false, date: testDate }
            ];
            fixture.detectChanges();

            const dateElement = fixture.debugElement.query(By.css('time'));
            expect(dateElement).toBeTruthy();
        });

        it('should not render date element when date is not provided', () => {
            component.steps = [
                { label: 'Step without Date', completed: true, current: false }
            ];
            fixture.detectChanges();

            const dateElement = fixture.debugElement.query(By.css('time'));
            expect(dateElement).toBeFalsy();
        });

        it('should render by information when provided', () => {
            component.steps = [
                { label: 'Approved Step', completed: true, current: false, by: 'John Doe' }
            ];
            fixture.detectChanges();

            const byElement = fixture.debugElement.query(By.css('.text-xs.text-gray-500'));
            expect(byElement.nativeElement.textContent).toContain('John Doe');
        });

        it('should not render by element when not provided', () => {
            component.steps = [
                { label: 'Step without by', completed: true, current: false }
            ];
            fixture.detectChanges();

            const byElements = fixture.debugElement.queryAll(By.css('.text-xs.text-gray-500'));
            const byElement = byElements.find(el => el.nativeElement.textContent.includes('by'));
            expect(byElement).toBeFalsy();
        });
    });

    describe('connecting lines', () => {
        it('should show connecting line between steps', () => {
            component.steps = [
                { label: 'Step 1', completed: true, current: false },
                { label: 'Step 2', completed: false, current: false }
            ];
            fixture.detectChanges();

            const lineElement = fixture.debugElement.query(By.css('.h-full.w-0\\.5'));
            expect(lineElement).toBeTruthy();
        });

        it('should not show connecting line for last step', () => {
            component.steps = [
                { label: 'Step 1', completed: true, current: false },
                { label: 'Last Step', completed: false, current: false }
            ];
            fixture.detectChanges();

            const stepElements = fixture.debugElement.queryAll(By.css('.relative.pb-8'));
            const lastStep = stepElements[1];
            const lineInLastStep = lastStep.query(By.css('.h-full.w-0\\.5'));
            expect(lineInLastStep).toBeFalsy();
        });

        it('should not show connecting line when only one step', () => {
            component.steps = [
                { label: 'Single Step', completed: true, current: false }
            ];
            fixture.detectChanges();

            const lineElement = fixture.debugElement.query(By.css('.h-full.w-0\\.5'));
            expect(lineElement).toBeFalsy();
        });
    });

    describe('step numbering', () => {
        it('should show correct step number for first step', () => {
            component.steps = [
                { label: 'Step 1', completed: false, current: false }
            ];
            fixture.detectChanges();

            const stepNumber = fixture.debugElement.query(By.css('.text-xs.font-medium'));
            expect(stepNumber.nativeElement.textContent).toContain('1');
        });

        it('should show correct step number for second step', () => {
            component.steps = [
                { label: 'Step 1', completed: true, current: false },
                { label: 'Step 2', completed: false, current: true }
            ];
            fixture.detectChanges();

            const stepNumbers = fixture.debugElement.queryAll(By.css('.text-xs.font-medium'));
            expect(stepNumbers[1].nativeElement.textContent).toContain('2');
        });
    });

    describe('input changes', () => {
        it('should update steps when input changes', () => {
            component.steps = [
                { label: 'Initial Step', completed: true, current: false }
            ];
            fixture.detectChanges();

            component.steps = [
                { label: 'Updated Step', completed: false, current: true }
            ];
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('.text-sm.font-medium'));
            expect(label.nativeElement.textContent).toContain('Updated Step');
        });

        it('should handle empty steps array', () => {
            component.steps = [
                { label: 'Step', completed: true, current: false }
            ];
            fixture.detectChanges();

            component.steps = [];
            fixture.detectChanges();

            const stepElements = fixture.debugElement.queryAll(By.css('.relative.flex'));
            expect(stepElements.length).toBe(0);
        });
    });

    describe('layout structure', () => {
        it('should have relative container', () => {
            fixture.detectChanges();

            const container = fixture.debugElement.query(By.css('.relative'));
            expect(container).toBeTruthy();
        });

        it('should use flex layout for steps', () => {
            component.steps = [
                { label: 'Test Step', completed: true, current: false }
            ];
            fixture.detectChanges();

            const stepContainer = fixture.debugElement.query(By.css('.flex.items-center.justify-center'));
            expect(stepContainer).toBeTruthy();
        });

        it('should apply ring-4 ring-white to step icon', () => {
            component.steps = [
                { label: 'Test Step', completed: true, current: false }
            ];
            fixture.detectChanges();

            const stepIcon = fixture.debugElement.query(By.css('.ring-4.ring-white'));
            expect(stepIcon).toBeTruthy();
        });
    });
});
