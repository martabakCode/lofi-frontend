import 'jest-preset-angular/setup-jest';
import './jest-global-mocks';

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
