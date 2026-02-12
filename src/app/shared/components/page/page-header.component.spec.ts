import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent } from './page-header.component';
import { provideRouter } from '@angular/router';

describe('PageHeaderComponent', () => {
    let component: PageHeaderComponent;
    let fixture: ComponentFixture<PageHeaderComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PageHeaderComponent],
            providers: [provideRouter([])]
        });
        fixture = TestBed.createComponent(PageHeaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render title', () => {
        component.title = 'Test Title';
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test Title');
    });

    it('should render subtitle', () => {
        component.title = 'Title';
        component.subtitle = 'Test Subtitle';
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test Subtitle');
    });
});
