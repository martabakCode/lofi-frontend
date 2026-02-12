import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';

describe('AppComponent', () => {
    let notificationServiceMock: jest.Mocked<NotificationService>;

    beforeEach(() => {
        notificationServiceMock = {} as unknown as jest.Mocked<NotificationService>;

        TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                { provide: NotificationService, useValue: notificationServiceMock }
            ]
        });
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should render router outlet', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('router-outlet')).toBeTruthy();
    });

    it('should render toast component', () => {
        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('app-toast')).toBeTruthy();
    });
});
