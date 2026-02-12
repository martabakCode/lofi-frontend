import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingComponent } from './landing.component';
import { ProductFacade } from '../products/facades/product.facade';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

describe('LandingComponent', () => {
    let component: LandingComponent;
    let fixture: ComponentFixture<LandingComponent>;
    let productFacadeMock: jest.Mocked<ProductFacade>;

    beforeEach(() => {
        productFacadeMock = {
            products: signal([]),
            loadProducts: jest.fn()
        } as unknown as jest.Mocked<ProductFacade>;

        TestBed.configureTestingModule({
            imports: [LandingComponent],
            providers: [
                provideRouter([]),
                { provide: ProductFacade, useValue: productFacadeMock }
            ]
        });
        fixture = TestBed.createComponent(LandingComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have problems defined', () => {
        expect(component.problems.length).toBeGreaterThan(0);
    });

    it('should have solutions defined', () => {
        expect(component.solutions.length).toBeGreaterThan(0);
    });

    it('should have steps defined', () => {
        expect(component.steps.length).toBeGreaterThan(0);
    });

    it('should have features defined', () => {
        expect(component.features.length).toBeGreaterThan(0);
    });

    it('should have benefits defined', () => {
        expect(component.benefits.length).toBeGreaterThan(0);
    });

    it('should have hero words', () => {
        expect(component.heroWords.length).toBeGreaterThan(0);
    });

    it('should toggle menu', () => {
        expect(component.isMenuOpen).toBe(false);
        component.isMenuOpen = true;
        expect(component.isMenuOpen).toBe(true);
    });

    describe('theme', () => {
        it('should toggle theme', () => {
            const initialTheme = component.isDarkMode;
            component.toggleTheme();
            expect(component.isDarkMode).toBe(!initialTheme);
        });
    });
});
