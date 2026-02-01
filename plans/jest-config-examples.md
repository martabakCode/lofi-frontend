# Jest Configuration Examples

## 1. jest.config.ts

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1'
  },
  transform: {
    '^.+\\.(ts|js|mjs|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
        isolatedModules: true
      }
    ]
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/main.server.ts',
    '!src/server.ts',
    '!src/**/*.routes.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  testMatch: [
    '<rootDir>/src/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/.angular/'
  ],
  verbose: true,
  clearMocks: true,
  restoreMocks: true
};

export default config;
```

## 2. jest.setup.ts

```typescript
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
```

## 3. jest-global-mocks.ts

```typescript
/**
 * Global mocks for Angular-specific APIs and browser features
 * that are not available in JSDOM test environment
 */

// Mock for Angular's ng-zone
Object.defineProperty(global, 'Zone', {
  value: {
    current: {
      fork: () => ({ run: (fn: Function) => fn() })
    }
  }
});

// Mock for ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock for IntersectionObserver
class IntersectionObserverMock {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
}

global.IntersectionObserver = IntersectionObserverMock as any;

// Mock for matchMedia
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

// Mock for localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock for sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock for navigator.geolocation
const geolocationMock = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};
Object.defineProperty(global.navigator, 'geolocation', {
  value: geolocationMock
});

// Mock for CSS animations/transitions
Object.defineProperty(window, 'CSS', {
  value: {
    supports: jest.fn().mockReturnValue(true),
    escape: (str: string) => str
  }
});

// Mock for requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock for Element.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock for Element.animate
Element.prototype.animate = jest.fn().mockReturnValue({
  onfinish: null,
  cancel: jest.fn(),
  finish: jest.fn(),
  pause: jest.fn(),
  play: jest.fn(),
  reverse: jest.fn(),
  effect: null,
  ready: Promise.resolve(),
  finished: Promise.resolve()
});

// Mock for clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue('')
  }
});

// Mock for BroadcastChannel
global.BroadcastChannel = class {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onmessageerror: ((event: MessageEvent) => void) | null = null;

  constructor(channelName: string) {
    this.name = channelName;
  }

  postMessage(message: any) {
    // Mock implementation
  }

  close() {
    // Mock implementation
  }

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() { return true; }
} as any;
```

## 4. Updated tsconfig.spec.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": [
      "jest",
      "node"
    ],
    "esModuleInterop": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*.d.ts",
    "src/**/*.spec.ts"
  ]
}
```

## 5. Updated package.json Scripts

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "serve:ssr:lofi-frontend": "node dist/lofi-frontend/server/server.mjs"
  }
}
```

## 6. Dependencies to Install

```bash
# Install Jest and related packages
npm install --save-dev jest @types/jest jest-preset-angular ts-jest

# Install testing utilities
npm install --save-dev @testing-library/angular @testing-library/jest-dom
```

Or add to package.json devDependencies:

```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "jest-preset-angular": "^14.0.0",
    "ts-jest": "^29.1.0",
    "@testing-library/angular": "^17.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```
