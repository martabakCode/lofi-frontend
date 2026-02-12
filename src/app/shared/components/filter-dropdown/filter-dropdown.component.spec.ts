import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterDropdownComponent } from './filter-dropdown.component';

describe('FilterDropdownComponent', () => {
    let component: FilterDropdownComponent;
    let fixture: ComponentFixture<FilterDropdownComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FilterDropdownComponent]
        });
        fixture = TestBed.createComponent(FilterDropdownComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render label', () => {
        component.label = 'Status';
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Status');
    });
});
