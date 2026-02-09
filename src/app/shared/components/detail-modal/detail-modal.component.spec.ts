import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailModalComponent } from './detail-modal.component';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

@Component({
    template: `
    <app-detail-modal [isOpen]="isOpen" title="Test Modal">
      <div id="test-content">Modal Content</div>
      <ng-template #footer>
        <button id="custom-footer">Custom Footer</button>
      </ng-template>
    </app-detail-modal>
  `,
    standalone: true,
    imports: [DetailModalComponent]
})
class TestHostComponent {
    isOpen = false;
}

describe('DetailModalComponent', () => {
    let component: DetailModalComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, DetailModalComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        hostComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(DetailModalComponent)).componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show modal when isOpen is true', () => {
        hostComponent.isOpen = true;
        fixture.detectChanges();

        const modal = fixture.debugElement.query(By.css('.modal-overlay'));
        expect(modal).toBeTruthy();
    });

    it('should hide modal when isOpen is false', () => {
        hostComponent.isOpen = false;
        fixture.detectChanges();

        const modal = fixture.debugElement.query(By.css('.modal-overlay'));
        expect(modal).toBeNull();
    });

    it('should project content into modal body', () => {
        hostComponent.isOpen = true;
        fixture.detectChanges();

        const content = fixture.debugElement.query(By.css('#test-content'));
        expect(content).toBeTruthy();
        expect(content.nativeElement.textContent).toBe('Modal Content');
    });

    it('should display correct title', () => {
        hostComponent.isOpen = true;
        fixture.detectChanges();

        const title = fixture.debugElement.query(By.css('h3')).nativeElement;
        expect(title.textContent).toBe('Test Modal');
    });

    it('should call onClose and emit close event when close button is clicked', () => {
        const closeSpy = jest.spyOn(component.close, 'emit');
        hostComponent.isOpen = true;
        fixture.detectChanges();

        const closeBtn = fixture.debugElement.query(By.css('button.text-text-muted'));
        closeBtn.triggerEventHandler('click', null);

        expect(closeSpy).toHaveBeenCalled();
        expect(component.isOpenValue()).toBe(false);
    });

    it('should show footer when showFooter is true', () => {
        hostComponent.isOpen = true;
        component.showFooter = true;
        fixture.detectChanges();

        const footer = fixture.debugElement.query(By.css('.border-t'));
        expect(footer).toBeTruthy();
    });

    it('should hide footer when showFooter is false', () => {
        hostComponent.isOpen = true;
        component.showFooter = false;
        fixture.detectChanges();

        const footer = fixture.debugElement.query(By.css('.border-t'));
        expect(footer).toBeNull();
    });

    it('should render custom footer template if provided', () => {
        hostComponent.isOpen = true;
        fixture.detectChanges();

        const customFooter = fixture.debugElement.query(By.css('#custom-footer'));
        expect(customFooter).toBeTruthy();
        expect(customFooter.nativeElement.textContent).toBe('Custom Footer');
    });
});
