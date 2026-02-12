import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableRowComponent } from './table-row.component';

describe('TableRowComponent', () => {
    let component: TableRowComponent<any>;
    let fixture: ComponentFixture<TableRowComponent<any>>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TableRowComponent]
        });
        fixture = TestBed.createComponent(TableRowComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
