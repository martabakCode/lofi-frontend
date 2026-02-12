import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';

describe('SearchInputComponent', () => {
    let component: SearchInputComponent;
    let fixture: ComponentFixture<SearchInputComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SearchInputComponent]
        });
        fixture = TestBed.createComponent(SearchInputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit search event', (done) => {
        component.searchChange.subscribe(value => {
            expect(value).toBe('test');
            done();
        });
        component.onSearch('test');
    });
});
