import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { provideRouter } from '@angular/router';

describe('EmptyStateComponent', () => {
    let component: EmptyStateComponent;
    let fixture: ComponentFixture<EmptyStateComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [EmptyStateComponent],
            providers: [provideRouter([])]
        });
        fixture = TestBed.createComponent(EmptyStateComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render title', () => {
        component.title = 'No Data';
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('No Data');
    });

    it('should render message', () => {
        component.message = 'There is no data to display';
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('There is no data to display');
    });
});
