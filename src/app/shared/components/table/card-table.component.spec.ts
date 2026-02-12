import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardTableComponent } from './card-table.component';
import { provideRouter } from '@angular/router';

describe('CardTableComponent', () => {
    let component: CardTableComponent<any>;
    let fixture: ComponentFixture<CardTableComponent<any>>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CardTableComponent],
            providers: [provideRouter([])]
        });
        fixture = TestBed.createComponent(CardTableComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
