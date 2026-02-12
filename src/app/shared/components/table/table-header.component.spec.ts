import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableHeaderComponent } from './table-header.component';

describe('TableHeaderComponent', () => {
    let component: TableHeaderComponent<any>;
    let fixture: ComponentFixture<TableHeaderComponent<any>>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TableHeaderComponent]
        });
        fixture = TestBed.createComponent(TableHeaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
