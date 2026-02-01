import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
    let service: ThemeService;
    let localStorageMock: { [key: string]: string } = {};

    beforeEach(() => {
        localStorageMock = {};

        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn((key: string) => localStorageMock[key] || null),
                setItem: jest.fn((key: string, value: string) => {
                    localStorageMock[key] = value;
                })
            },
            writable: true
        });

        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        // Clear document classList
        document.documentElement.classList.remove('dark');
    });

    describe('with browser platform', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    ThemeService,
                    { provide: PLATFORM_ID, useValue: 'browser' }
                ]
            });
            service = TestBed.inject(ThemeService);
        });

        it('should be created', () => {
            expect(service).toBeTruthy();
        });

        it('should initialize with light mode by default', () => {
            expect(service.isDarkMode()).toBe(false);
        });

        it('should toggle theme to dark mode', () => {
            service.toggleTheme();

            expect(service.isDarkMode()).toBe(true);
            expect(document.documentElement.classList.contains('dark')).toBe(true);
        });

        it('should toggle theme back to light mode', () => {
            service.toggleTheme();
            service.toggleTheme();

            expect(service.isDarkMode()).toBe(false);
            expect(document.documentElement.classList.contains('dark')).toBe(false);
        });

        it('should save theme preference to localStorage', () => {
            service.toggleTheme();

            expect(window.localStorage.setItem).toHaveBeenCalledWith('Lofi Apps-theme', 'dark');
        });

        it('should load dark theme from localStorage', () => {
            localStorageMock['Lofi Apps-theme'] = 'dark';

            // Create new service instance to trigger constructor
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    ThemeService,
                    { provide: PLATFORM_ID, useValue: 'browser' }
                ]
            });
            const newService = TestBed.inject(ThemeService);

            expect(newService.isDarkMode()).toBe(true);
        });

        it('should load light theme from localStorage', () => {
            localStorageMock['Lofi Apps-theme'] = 'light';

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                providers: [
                    ThemeService,
                    { provide: PLATFORM_ID, useValue: 'browser' }
                ]
            });
            const newService = TestBed.inject(ThemeService);

            expect(newService.isDarkMode()).toBe(false);
        });
    });

    describe('with server platform', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({
                providers: [
                    ThemeService,
                    { provide: PLATFORM_ID, useValue: 'server' }
                ]
            });
            service = TestBed.inject(ThemeService);
        });

        it('should be created on server', () => {
            expect(service).toBeTruthy();
        });

        it('should not access localStorage on server', () => {
            expect(window.localStorage.getItem).not.toHaveBeenCalled();
        });
    });
});
