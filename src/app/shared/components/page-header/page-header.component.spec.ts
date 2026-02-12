import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageHeaderComponent, BreadcrumbItem, HeaderAction } from './page-header.component';
import { provideRouter } from '@angular/router';

describe('PageHeaderComponent', () => {
    let component: PageHeaderComponent;
    let fixture: ComponentFixture<PageHeaderComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PageHeaderComponent],
            providers: [provideRouter([])]
        });
        fixture = TestBed.createComponent(PageHeaderComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('getButtonClass', () => {
        it('should return primary button class by default', () => {
            expect(component.getButtonClass()).toContain('btn-primary');
        });

        it('should return secondary button class', () => {
            expect(component.getButtonClass('secondary')).toContain('btn-secondary');
        });

        it('should return danger button class', () => {
            expect(component.getButtonClass('danger')).toContain('btn-danger');
        });
    });

    describe('onActionClick', () => {
        it('should emit action click event', () => {
            const action: HeaderAction = { label: 'Test', icon: 'pi-plus' };
            const spy = jest.spyOn(component.actionClick, 'emit');

            component.onActionClick(action);

            expect(spy).toHaveBeenCalledWith(action);
        });

        it('should call action click handler if provided', () => {
            const clickHandler = jest.fn();
            const action: HeaderAction = { label: 'Test', click: clickHandler };

            component.onActionClick(action);

            expect(clickHandler).toHaveBeenCalled();
        });
    });

    it('should render title', () => {
        component.title = 'Test Title';
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test Title');
    });

    it('should render description', () => {
        component.title = 'Title';
        component.description = 'Test Description';
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test Description');
    });

    it('should render breadcrumbs', () => {
        component.breadcrumbs = [
            { label: 'Home', link: '/' },
            { label: 'Current' }
        ];
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Home');
        expect(compiled.textContent).toContain('Current');
    });

    it('should render actions', () => {
        component.title = 'Title';
        component.actions = [
            { label: 'Add', icon: 'pi-plus', variant: 'primary' }
        ];
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Add');
    });
});
