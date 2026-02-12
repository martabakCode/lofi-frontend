import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageToolbarComponent } from './page-toolbar.component';

describe('PageToolbarComponent', () => {
    let component: PageToolbarComponent;
    let fixture: ComponentFixture<PageToolbarComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PageToolbarComponent]
        });
        fixture = TestBed.createComponent(PageToolbarComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
