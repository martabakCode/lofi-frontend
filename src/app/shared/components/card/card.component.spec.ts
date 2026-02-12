import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { By } from '@angular/platform-browser';

describe('CardComponent', () => {
    let component: CardComponent;
    let fixture: ComponentFixture<CardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CardComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(CardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('title and subtitle', () => {
        it('should render title when provided', () => {
            component.title = 'Test Card Title';
            fixture.detectChanges();

            const titleElement = fixture.debugElement.query(By.css('h3'));
            expect(titleElement).toBeTruthy();
            expect(titleElement.nativeElement.textContent).toContain('Test Card Title');
        });

        it('should not render title header when title is empty', () => {
            component.title = '';
            fixture.detectChanges();

            const headerElement = fixture.debugElement.query(By.css('.border-b'));
            expect(headerElement).toBeFalsy();
        });

        it('should render subtitle when provided', () => {
            component.title = 'Test Title';
            component.subtitle = 'Test Subtitle';
            fixture.detectChanges();

            const subtitleElement = fixture.debugElement.query(By.css('p'));
            expect(subtitleElement).toBeTruthy();
            expect(subtitleElement.nativeElement.textContent).toContain('Test Subtitle');
        });

        it('should not render subtitle when not provided', () => {
            component.title = 'Test Title';
            component.subtitle = '';
            fixture.detectChanges();

            const subtitleElement = fixture.debugElement.query(By.css('p'));
            expect(subtitleElement).toBeFalsy();
        });
    });

    describe('icon', () => {
        it('should render icon when provided', () => {
            component.title = 'Test Title';
            component.icon = 'pi-user';
            fixture.detectChanges();

            const iconElement = fixture.debugElement.query(By.css('.pi-user'));
            expect(iconElement).toBeTruthy();
        });

        it('should not render icon container when icon is empty', () => {
            component.title = 'Test Title';
            component.icon = '';
            fixture.detectChanges();

            const iconContainer = fixture.debugElement.query(By.css('.w-8'));
            expect(iconContainer).toBeFalsy();
        });
    });

    describe('footer', () => {
        it('should not render footer by default', () => {
            component.hasFooter = false;
            fixture.detectChanges();

            const footerElement = fixture.debugElement.query(By.css('.bg-bg-muted'));
            expect(footerElement).toBeFalsy();
        });

        it('should render footer when hasFooter is true', () => {
            component.hasFooter = true;
            fixture.detectChanges();

            const footerElement = fixture.debugElement.query(By.css('.bg-bg-muted'));
            expect(footerElement).toBeTruthy();
        });

        it('should project footer content when hasFooter is true', () => {
            component.hasFooter = true;
            fixture.detectChanges();

            const footerContent = fixture.debugElement.query(By.css('[footer]'));
            expect(footerContent).toBeTruthy();
        });
    });

    describe('content projection', () => {
        it('should project main content', () => {
            fixture.detectChanges();

            const mainContent = fixture.debugElement.query(By.css('.px-6.py-4.flex-1'));
            expect(mainContent).toBeTruthy();
        });

        it('should project header actions', () => {
            fixture.detectChanges();

            const headerActions = fixture.debugElement.query(By.css('[header-actions]'));
            expect(headerActions).toBeTruthy();
        });
    });

    describe('styling classes', () => {
        it('should apply correct base classes', () => {
            fixture.detectChanges();

            const cardElement = fixture.debugElement.query(By.css('.bg-bg-surface'));
            expect(cardElement).toBeTruthy();
            expect(cardElement.nativeElement.classList.contains('rounded-xl')).toBe(true);
            expect(cardElement.nativeElement.classList.contains('shadow-sm')).toBe(true);
        });

        it('should apply correct border classes', () => {
            fixture.detectChanges();

            const cardElement = fixture.debugElement.query(By.css('.border-border-default'));
            expect(cardElement).toBeTruthy();
        });

        it('should apply flex layout classes', () => {
            fixture.detectChanges();

            const cardElement = fixture.debugElement.query(By.css('.flex.flex-col'));
            expect(cardElement).toBeTruthy();
        });
    });

    describe('input property changes', () => {
        it('should update title when input changes', () => {
            fixture.detectChanges();
            component.title = 'Updated Title';
            fixture.detectChanges();

            const titleElement = fixture.debugElement.query(By.css('h3'));
            expect(titleElement.nativeElement.textContent).toContain('Updated Title');
        });

        it('should update icon when input changes', () => {
            component.title = 'Test';
            fixture.detectChanges();
            component.icon = 'pi-star';
            fixture.detectChanges();

            const iconElement = fixture.debugElement.query(By.css('.pi-star'));
            expect(iconElement).toBeTruthy();
        });

        it('should update hasFooter when input changes', () => {
            fixture.detectChanges();
            component.hasFooter = true;
            fixture.detectChanges();

            const footerElement = fixture.debugElement.query(By.css('.bg-bg-muted'));
            expect(footerElement).toBeTruthy();
        });
    });
});
