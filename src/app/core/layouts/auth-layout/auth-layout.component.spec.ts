import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthLayoutComponent } from './auth-layout.component';
import { provideRouter } from '@angular/router';

describe('AuthLayoutComponent', () => {
    let component: AuthLayoutComponent;
    let fixture: ComponentFixture<AuthLayoutComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AuthLayoutComponent],
            providers: [provideRouter([])]
        });
        fixture = TestBed.createComponent(AuthLayoutComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
