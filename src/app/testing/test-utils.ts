import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Helper function to get element by test id
 */
export function getByTestId<T>(fixture: ComponentFixture<T>, testId: string) {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
}

/**
 * Helper function to get all elements by test id
 */
export function getAllByTestId<T>(fixture: ComponentFixture<T>, testId: string) {
    return fixture.debugElement.queryAll(By.css(`[data-testid="${testId}"]`));
}

/**
 * Helper function to trigger input event
 */
export function setInputValue<T>(
    fixture: ComponentFixture<T>,
    selector: string,
    value: string
) {
    const element = fixture.debugElement.query(By.css(selector));
    if (element) {
        element.nativeElement.value = value;
        element.nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    }
}

/**
 * Helper function to click element
 */
export function clickElement<T>(fixture: ComponentFixture<T>, selector: string) {
    const element = fixture.debugElement.query(By.css(selector));
    if (element) {
        element.nativeElement.click();
        fixture.detectChanges();
    }
}

/**
 * Mock factory for creating paginated responses
 */
export function createPaginatedResponse<T>(items: T[], page = 0, total = items.length) {
    return {
        items,
        total,
        page,
        pageSize: 10,
        totalPages: Math.ceil(total / 10)
    };
}

/**
 * Mock factory for API responses
 */
export function createApiResponse<T>(data: T, success = true, message = 'Success') {
    return {
        success,
        message,
        data
    };
}
