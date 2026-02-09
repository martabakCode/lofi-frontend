import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SortableHeaderComponent, SortConfig } from './sortable-header.component';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';

@Component({
    template: `
    <table>
      <thead>
        <tr>
          <app-sortable-header 
            field="name" 
            [sortField]="currentSort" 
            [sortDirection]="currentDir"
            (sort)="onSort($event)">
            Name
          </app-sortable-header>
        </tr>
      </thead>
    </table>
  `,
    standalone: true,
    imports: [SortableHeaderComponent]
})
class TestHostComponent {
    currentSort = '';
    currentDir: 'asc' | 'desc' = 'asc';
    onSort(config: SortConfig) {
        this.currentSort = config.field;
        this.currentDir = config.direction;
    }
}

describe('SortableHeaderComponent', () => {
    let component: SortableHeaderComponent;
    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent, SortableHeaderComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        hostComponent = fixture.componentInstance;
        component = fixture.debugElement.query(By.directive(SortableHeaderComponent)).componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display non-active sort icon initially', () => {
        const icon = fixture.debugElement.query(By.css('.pi-sort'));
        expect(icon).toBeTruthy();
    });

    it('should project content', () => {
        const th = fixture.debugElement.query(By.css('th')).nativeElement;
        expect(th.textContent).toContain('Name');
    });

    it('should emit sort event when clicked', () => {
        const th = fixture.debugElement.query(By.css('th'));
        th.triggerEventHandler('click', null);

        expect(hostComponent.currentSort).toBe('name');
        expect(hostComponent.currentDir).toBe('asc');
    });

    it('should toggle direction when active field is clicked', () => {
        hostComponent.currentSort = 'name';
        hostComponent.currentDir = 'asc';
        fixture.detectChanges();

        const th = fixture.debugElement.query(By.css('th'));
        th.triggerEventHandler('click', null);

        expect(hostComponent.currentDir).toBe('desc');
    });

    it('should show asc icon when active and direction is asc', () => {
        hostComponent.currentSort = 'name';
        hostComponent.currentDir = 'asc';
        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('.pi-sort-up'));
        expect(icon).toBeTruthy();
    });

    it('should show desc icon when active and direction is desc', () => {
        hostComponent.currentSort = 'name';
        hostComponent.currentDir = 'desc';
        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('.pi-sort-down'));
        expect(icon).toBeTruthy();
    });

    it('should apply active class when field matches', () => {
        hostComponent.currentSort = 'name';
        fixture.detectChanges();

        const th = fixture.debugElement.query(By.css('th')).nativeElement;
        expect(th.classList.contains('text-brand-main')).toBe(true);
    });
});
