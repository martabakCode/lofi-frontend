import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportButtonComponent } from './export-button.component';

describe('ExportButtonComponent', () => {
    let component: ExportButtonComponent;
    let fixture: ComponentFixture<ExportButtonComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ExportButtonComponent]
        });
        fixture = TestBed.createComponent(ExportButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit export event', (done) => {
        component.export.subscribe(() => {
            expect(true).toBe(true);
            done();
        });
        component.onExport();
    });

    it('should handle disabled state', () => {
        component.disabled = true;
        fixture.detectChanges();
        expect(component.disabled).toBe(true);
    });
});
