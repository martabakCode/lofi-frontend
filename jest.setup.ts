import 'jest-preset-angular/setup-env/zone';
import './jest-global-mocks';

import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Initialize Angular testing environment
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
    {
        errorOnUnknownElements: true,
        errorOnUnknownProperties: true
    }
);

// Global test configurations
globalThis.ngJest = {
    skipNgcc: true
};

// Suppress console errors during tests unless explicitly needed
global.console = {
    ...console,
    // Uncomment to ignore specific console methods during tests
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    // error: jest.fn(),
};
