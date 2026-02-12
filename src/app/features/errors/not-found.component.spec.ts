import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotFoundComponent } from './not-found.component';
import { provideRouter } from '@angular/router';

describe('NotFoundComponent', () => {
    let component: NotFoundComponent;
    let fixture: ComponentFixture<NotFoundComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NotFoundComponent],
            providers: [provideRouter([])]
        });
        fixture = TestBed.createComponent(NotFoundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display 404 text', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('404');
    });

    it('should display page not found message', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Page Not Found');
    });

    it('should have back to home link', () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const link = compiled.querySelector('a');
        expect(link).toBeTruthy();
        expect(link?.textContent).toContain('Back to Home');
    });
});
