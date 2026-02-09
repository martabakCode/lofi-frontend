import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModalComponent } from './confirmation-modal.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('ConfirmationModalComponent', () => {
    let component: ConfirmationModalComponent;
    let fixture: ComponentFixture<ConfirmationModalComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmationModalComponent, FormsModule]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not show modal when isOpen is false', () => {
        component.isOpen = false;
        fixture.detectChanges();

        const modal = fixture.debugElement.query(By.css('.modal-overlay'));
        expect(modal).toBeNull();
    });

    it('should show modal when isOpen is true', () => {
        component.isOpen = true;
        fixture.detectChanges();

        const modal = fixture.debugElement.query(By.css('.modal-overlay'));
        expect(modal).toBeTruthy();
    });

    it('should display correct title and message', () => {
        component.isOpen = true;
        component.title = 'Test Title';
        component.message = 'Test Message';
        fixture.detectChanges();

        const title = fixture.debugElement.query(By.css('h3')).nativeElement;
        const message = fixture.debugElement.query(By.css('p')).nativeElement;

        expect(title.textContent).toBe('Test Title');
        expect(message.textContent).toBe('Test Message');
    });

    it('should emit close event when cancel button is clicked', () => {
        jest.spyOn(component.close, 'emit');
        component.isOpen = true;
        fixture.detectChanges();

        const cancelBtn = fixture.debugElement.query(By.css('.btn-secondary'));
        cancelBtn.triggerEventHandler('click', null);

        expect(component.close.emit).toHaveBeenCalled();
        expect(component.isOpen).toBe(false);
    });

    it('should emit confirm event with empty notes when notes are not required', () => {
        jest.spyOn(component.confirm, 'emit');
        component.isOpen = true;
        component.requireNotes = false;
        fixture.detectChanges();

        const confirmBtn = fixture.debugElement.query(By.css('.btn-primary'));
        confirmBtn.triggerEventHandler('click', null);

        expect(component.confirm.emit).toHaveBeenCalledWith('');
    });

    it('should show error and not emit confirm when notes are required but empty', () => {
        jest.spyOn(component.confirm, 'emit');
        component.isOpen = true;
        component.requireNotes = true;
        component.notes = '';
        fixture.detectChanges();

        const confirmBtn = fixture.debugElement.query(By.css('.btn-primary'));
        confirmBtn.triggerEventHandler('click', null);

        fixture.detectChanges();
        const errorMsg = fixture.debugElement.query(By.css('.text-red-500'));

        expect(component.showError).toBe(true);
        expect(errorMsg).toBeTruthy();
        expect(component.confirm.emit).not.toHaveBeenCalled();
    });

    it('should emit confirm with notes when notes are required and provided', () => {
        jest.spyOn(component.confirm, 'emit');
        component.isOpen = true;
        component.requireNotes = true;
        component.notes = 'Some notes';
        fixture.detectChanges();

        const confirmBtn = fixture.debugElement.query(By.css('.btn-primary'));
        confirmBtn.triggerEventHandler('click', null);

        expect(component.confirm.emit).toHaveBeenCalledWith('Some notes');
    });

    it('should close modal when clicking on overlay', () => {
        jest.spyOn(component, 'onClose');
        component.isOpen = true;
        fixture.detectChanges();

        const overlay = fixture.debugElement.query(By.css('.modal-overlay'));
        overlay.triggerEventHandler('click', null);

        expect(component.onClose).toHaveBeenCalled();
    });

    it('should not close modal when clicking on content', () => {
        jest.spyOn(component, 'onClose');
        component.isOpen = true;
        fixture.detectChanges();

        const content = fixture.debugElement.query(By.css('.modal-content'));
        content.triggerEventHandler('click', { stopPropagation: () => { } });

        // The stopPropagation logic is in the template as (click)="$event.stopPropagation()"
        // So clicking content shouldn't trigger onClose from the overlay
        expect(component.onClose).not.toHaveBeenCalled();
    });
});
