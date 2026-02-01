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
    observe() { }
    unobserve() { }
    disconnect() { }
}

global.ResizeObserver = ResizeObserverMock;

// Mock for IntersectionObserver
class IntersectionObserverMock {
    constructor() { }
    disconnect() { }
    observe() { }
    takeRecords() { return []; }
    unobserve() { }
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

    addEventListener() { }
    removeEventListener() { }
    dispatchEvent() { return true; }
} as any;
