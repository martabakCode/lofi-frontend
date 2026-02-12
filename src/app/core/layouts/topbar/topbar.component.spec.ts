import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopbarComponent } from './topbar.component';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

describe('TopbarComponent', () => {
    let component: TopbarComponent;
    let fixture: ComponentFixture<TopbarComponent>;
    let themeServiceMock: jest.Mocked<ThemeService>;

    beforeEach(() => {
        themeServiceMock = {
            isDarkMode: signal(false)
        } as unknown as jest.Mocked<ThemeService>;

        TestBed.configureTestingModule({
            imports: [TopbarComponent],
            providers: [
                provideRouter([]),
                { provide: ThemeService, useValue: themeServiceMock }
            ]
        });
        fixture = TestBed.createComponent(TopbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit toggle sidebar event', (done) => {
        component.onToggleSidebar.subscribe(() => {
            expect(true).toBe(true);
            done();
        });
        component.onToggleSidebar.emit();
    });

    describe('onSearch', () => {
        it('should navigate on search with query', () => {
            component.searchQuery = 'test loan';
            const navigateSpy = jest.spyOn(component['router'], 'navigate');
            component.onSearch();
            expect(navigateSpy).toHaveBeenCalledWith(
                ['/dashboard/loans/review'],
                { queryParams: { search: 'test loan' } }
            );
        });

        it('should not navigate on empty search', () => {
            component.searchQuery = '   ';
            const navigateSpy = jest.spyOn(component['router'], 'navigate');
            component.onSearch();
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });
});
