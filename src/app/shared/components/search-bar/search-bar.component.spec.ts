import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
    let component: SearchBarComponent;
    let fixture: ComponentFixture<SearchBarComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SearchBarComponent]
        });
        fixture = TestBed.createComponent(SearchBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render placeholder', () => {
        component.placeholder = 'Search...';
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('input');
        expect(input.placeholder).toBe('Search...');
    });

    it('should emit search event', (done) => {
        component.search.subscribe(value => {
            expect(value).toBe('test');
            done();
        });
        component.onSearch({ target: { value: 'test' } } as any);
    });
});
