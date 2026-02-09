import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';
import { By } from '@angular/platform-browser';

describe('ThemeToggleComponent', () => {
    let component: ThemeToggleComponent;
    let fixture: ComponentFixture<ThemeToggleComponent>;
    let themeServiceMock: jest.Mocked<ThemeService>;

    beforeEach(async () => {
        themeServiceMock = {
            toggleTheme: jest.fn(),
            isDarkMode: jest.fn().mockReturnValue(false)
        } as unknown as jest.Mocked<ThemeService>;

        await TestBed.configureTestingModule({
            imports: [ThemeToggleComponent],
            providers: [
                { provide: ThemeService, useValue: themeServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ThemeToggleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display moon icon when in light mode', () => {
        themeServiceMock.isDarkMode.mockReturnValue(false);
        fixture.detectChanges();

        const span = fixture.debugElement.query(By.css('span')).nativeElement;
        expect(span.textContent).toBe('🌙');
    });

    it('should display sun icon when in dark mode', () => {
        themeServiceMock.isDarkMode.mockReturnValue(true);
        fixture.detectChanges();

        const span = fixture.debugElement.query(By.css('span')).nativeElement;
        expect(span.textContent).toBe('☀️');
    });

    it('should call toggleTheme on click', () => {
        const button = fixture.debugElement.query(By.css('button'));
        button.triggerEventHandler('click', null);

        expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
    });

    it('should have correct aria-label based on theme', () => {
        // Light mode
        themeServiceMock.isDarkMode.mockReturnValue(false);
        fixture.detectChanges();
        let button = fixture.debugElement.query(By.css('button')).nativeElement;
        expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');

        // Dark mode
        themeServiceMock.isDarkMode.mockReturnValue(true);
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button')).nativeElement;
        expect(button.getAttribute('aria-label')).toBe('Switch to light mode');
    });
});
