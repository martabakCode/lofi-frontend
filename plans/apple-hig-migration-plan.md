# Apple HIG Migration Plan - Code Analysis

## Overview

This document identifies all files in the codebase that need to be updated to use the new Apple HIG Tailwind configuration and component patterns.

---

## Files Requiring Updates

### 1. Core Styling Files

| File | Status | Changes Needed |
|------|---------|---------------|
| [`tailwind.config.ts`](tailwind.config.ts) | ⚠️ **UPDATE** | Replace with new Apple HIG configuration |
| [`src/styles/components.css`](src/styles/components.css) | ⚠️ **UPDATE** | Add new component styles and utilities |

---

### 2. List Pages (4 files)

| File | Current Classes | New Classes Needed |
|------|----------------|-------------------|
| [`src/app/features/products/product-list/product-list.component.html`](src/app/features/products/product-list/product-list.component.html) | `btn-primary`, `btn-secondary`, `stats-grid`, `stat-card`, `stat-icon`, `card`, `form-input`, `form-select`, `error-alert`, `table-card`, `table-container`, `data-table`, `status-badge`, `actions-cell`, `btn-action` | ✅ Already using correct classes - **MINIMAL CHANGES** |
| [`src/app/features/users/pages/user-list.component.html`](src/app/features/users/pages/user-list.component.html) | Same as above + `role-badge`, `role-tags`, `user-info`, `user-avatar` | ✅ Already using correct classes - **MINIMAL CHANGES** |
| [`src/app/features/branches/pages/branch-list.component.html`](src/app/features/branches/pages/branch-list.component.html) | Same as above | ✅ Already using correct classes - **MINIMAL CHANGES** |
| [`src/app/features/roles/pages/role-list.component.html`](src/app/features/roles/pages/role-list.component.html) | Same as above | ✅ Already using correct classes - **MINIMAL CHANGES** |

**Changes Required for List Pages:**
- Add skeleton loader component for loading state
- Add empty state component for no data
- Ensure search debounce is 300ms (already implemented)
- Add hover states with `bg-gray-50` (already implemented)

---

### 3. Form Pages (4 files)

| File | Current Classes | New Classes Needed |
|------|----------------|-------------------|
| [`src/app/features/products/product-form/product-form.component.html`](src/app/features/products/product-form/product-form.component.html) | `card`, `form-label`, `form-input`, `form-textarea`, `form-select`, `form-error`, `btn-primary`, `btn-secondary`, `error-alert` | ✅ Already using correct classes - **MINIMAL CHANGES** |
| [`src/app/features/users/pages/user-form/user-form.component.html`](src/app/features/users/pages/user-form/user-form.component.html) | Same as above | ✅ Already using correct classes - **MINIMAL CHANGES** |
| [`src/app/features/branches/pages/branch-form/branch-form.component.html`](src/app/features/branches/pages/branch-form/branch-form.component.html) | Same as above | ✅ Already using correct classes - **MINIMAL CHANGES** |
| [`src/app/features/roles/pages/role-form/role-form.component.html`](src/app/features/roles/pages/role-form/role-form.component.html) | Same as above | ✅ Already using correct classes - **MINIMAL CHANGES** |

**Changes Required for Form Pages:**
- Add autosave indicator component (optional)
- Add inline validation on blur (already partially implemented)
- Add helper text below inputs (already implemented)
- Add unsaved changes guard (NEW)
- Add "Last updated" display for update pages (NEW)

---

### 4. Detail Pages (1 file)

| File | Current Classes | New Classes Needed |
|------|----------------|-------------------|
| [`src/app/features/products/product-detail/product-detail.component.html`](src/app/features/products/product-detail/product-detail.component.html) | `card`, `status-badge`, `btn-primary`, `btn-secondary`, `error-alert` | ✅ Already using correct classes - **MINIMAL CHANGES** |

**Changes Required for Detail Pages:**
- Add action buttons (Approve/Reject/Revision) (NEW)
- Add activity timeline component (NEW)
- Add action modal for comments (NEW)

---

### 5. Loan Management Pages (5 files)

| File | Current Classes | New Classes Needed |
|------|----------------|-------------------|
| [`src/app/features/loans/loan-list/loan-list.component.html`](src/app/features/loans/loan-list/loan-list.component.html) | `btn-primary`, `btn-secondary`, `card`, `form-input`, `badge`, `badge-info`, `btn-icon` | ⚠️ **MODERATE CHANGES** - Update badge classes |
| [`src/app/features/loans/loan-review/loan-review.component.html`](src/app/features/loans/loan-review/loan-review.component.html) | Same as above | ⚠️ **MODERATE CHANGES** - Update badge classes |
| [`src/app/features/loans/loan-approval/loan-approval.component.html`](src/app/features/loans/loan-approval/loan-approval.component.html) | Same as above | ⚠️ **MODERATE CHANGES** - Update badge classes |
| [`src/app/features/loans/loan-application/loan-application.component.html`](src/app/features/loans/loan-application/loan-application.component.html) | `card`, `form-input`, `form-label` | ✅ Already using correct classes - **MINIMAL CHANGES** |
| [`src/app/features/loans/marketing-loan-application/marketing-loan-application.component.html`](src/app/features/loans/marketing-loan-application/marketing-loan-application.component.html) | `text-brand-accent` | ⚠️ **MINOR CHANGES** - Update brand color reference |

**Changes Required for Loan Pages:**
- Update badge classes to use new semantic colors
- Add skeleton loader for loading states
- Add empty state components
- Add action modals for approve/reject

---

### 6. Disbursement Pages (1 file)

| File | Current Classes | New Classes Needed |
|------|----------------|-------------------|
| [`src/app/features/disbursements/disbursement-list/disbursement-list.component.html`](src/app/features/disbursements/disbursement-list/disbursement-list.component.html) | `btn-primary`, `btn-secondary`, `card`, `form-input`, `table-card`, `table-container`, `status-badge`, `actions-cell`, `product-badge` | ⚠️ **MODERATE CHANGES** - Update badge classes |

**Changes Required for Disbursement Pages:**
- Update badge classes to use new semantic colors
- Add skeleton loader for loading states
- Add empty state components

---

### 7. Auth Pages (1 file)

| File | Current Classes | New Classes Needed |
|------|----------------|-------------------|
| [`src/app/features/auth/forgot-password/forgot-password.component.html`](src/app/features/auth/forgot-password/forgot-password.component.html) | `form-label`, `form-input`, `form-error`, `btn-primary` | ✅ Already using correct classes - **MINIMAL CHANGES** |

---

### 8. Layout Components (1 file)

| File | Current Classes | New Classes Needed |
|------|----------------|-------------------|
| [`src/app/core/layouts/sidebar/sidebar.component.html`](src/app/core/layouts/sidebar/sidebar.component.html) | `btn-logout` | ⚠️ **MINOR CHANGES** - Update logout button style |

---

## Class Migration Guide

### Button Classes

| Old Class | New Class | Notes |
|------------|------------|-------|
| `btn-primary` | `btn-primary` | ✅ No change - already correct |
| `btn-secondary` | `btn-secondary` | ✅ No change - already correct |
| `btn-logout` | `btn-text` | ⚠️ Update to use text button style |
| `btn-icon` | `btn-action` | ⚠️ Update to use action button style |

### Badge Classes

| Old Class | New Class | Notes |
|------------|------------|-------|
| `badge` | `badge` | ✅ No change - already correct |
| `badge-info` | `badge-info` | ✅ No change - already correct |
| `badge-success` | `badge-success` | ✅ No change - already correct |
| `badge-warning` | `badge-warning` | ✅ No change - already correct |
| `badge-error` | `badge-error` | ✅ No change - already correct |
| `badge-secondary` | `badge` | ⚠️ Update to use default badge |
| `product-badge` | `badge-info` | ⚠️ Update to use info badge |
| `role-badge` | `badge` | ⚠️ Update to use default badge with role-specific colors |

### Status Badge Classes

| Old Class | New Class | Notes |
|------------|------------|-------|
| `status-badge` | `status-badge` | ✅ No change - already correct |
| `status-badge.active` | `status-badge.active` | ✅ No change - already correct |
| `status-badge.inactive` | `status-badge.inactive` | ✅ No change - already correct |
| `status-badge.pending` | `status-badge.pending` | ⚠️ Add pending variant |

### Form Classes

| Old Class | New Class | Notes |
|------------|------------|-------|
| `form-label` | `form-label` | ✅ No change - already correct |
| `form-input` | `form-input` | ✅ No change - already correct |
| `form-select` | `form-select` | ✅ No change - already correct |
| `form-textarea` | `form-textarea` | ✅ No change - already correct |
| `form-error` | `form-error` | ✅ No change - already correct |

### Card Classes

| Old Class | New Class | Notes |
|------------|------------|-------|
| `card` | `card` | ✅ No change - already correct |
| `card-header` | `card-header` | ✅ No change - already correct |
| `card-body` | `card-body` | ✅ No change - already correct |
| `card-footer` | `card-footer` | ✅ No change - already correct |

### Table Classes

| Old Class | New Class | Notes |
|------------|------------|-------|
| `table-card` | `table-card` | ✅ No change - already correct |
| `table-container` | `table-container` | ✅ No change - already correct |
| `data-table` | `data-table` | ✅ No change - already correct |

### Alert Classes

| Old Class | New Class | Notes |
|------------|------------|-------|
| `error-alert` | `alert alert-error` | ⚠️ Update to use new alert structure |

---

## New Components to Create

### 1. Empty State Component
**Location:** `src/app/shared/components/apple-hig/empty-state/`

**Usage in:**
- All list pages (products, users, branches, roles, loans, disbursements)

### 2. Skeleton Loader Component
**Location:** `src/app/shared/components/apple-hig/skeleton-loader/`

**Usage in:**
- All list pages (loading state)
- All detail pages (loading state)

### 3. Action Modal Component
**Location:** `src/app/shared/components/apple-hig/action-modal/`

**Usage in:**
- Detail pages (approve/reject/revision actions)
- Loan review pages
- Loan approval pages

### 4. Activity Timeline Component
**Location:** `src/app/shared/components/apple-hig/activity-timeline/`

**Usage in:**
- Detail pages (products, users, branches, roles)
- Loan detail pages

### 5. Unsaved Changes Guard Directive
**Location:** `src/app/shared/directives/unsaved-changes-guard/`

**Usage in:**
- All form pages (create/update)
- Add to route guards

### 6. Autosave Indicator Component
**Location:** `src/app/shared/components/apple-hig/autosave-indicator/`

**Usage in:**
- Form pages (optional feature)

---

## Implementation Priority

### Phase 1: Foundation (High Priority)
1. Update [`tailwind.config.ts`](tailwind.config.ts) with new configuration
2. Update [`src/styles/components.css`](src/styles/components.css) with new styles
3. Create Empty State component
4. Create Skeleton Loader component

### Phase 2: Core Components (High Priority)
5. Create Action Modal component
6. Create Activity Timeline component
7. Create Unsaved Changes Guard directive

### Phase 3: Page Updates (Medium Priority)
8. Update List Pages (add skeleton/empty states)
9. Update Form Pages (add autosave indicator, guard)
10. Update Detail Pages (add action buttons, timeline)

### Phase 4: Loan Pages (Medium Priority)
11. Update Loan List pages
12. Update Loan Review pages
13. Update Loan Approval pages

### Phase 5: Polish (Low Priority)
14. Update Disbursement pages
15. Update Auth pages
16. Update Layout components

---

## Specific File Changes

### 1. tailwind.config.ts

**Before:**
```typescript
export default {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

**After:**
```typescript
export default {
  content: ["./src/**/*.{html,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple HIG color palette
        gray: { /* ... */ },
        brand: { /* ... */ },
        success: { /* ... */ },
        warning: { /* ... */ },
        error: { /* ... */ },
        info: { /* ... */ },
        surface: { /* ... */ },
        bg: { /* ... */ },
        text: { /* ... */ },
        border: { /* ... */ },
      },
      borderRadius: {
        'apple': '0.75rem',
        'apple-lg': '1rem',
        'apple-xl': '1.25rem',
      },
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'apple': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        'apple-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'apple-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        'apple-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        'apple-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'focus': '0 0 0 3px rgba(59, 130, 246, 0.3)',
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 150ms ease-out',
        'fade-out': 'fadeOut 150ms ease-in',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-down': 'slideDown 200ms ease-out',
        'scale-in': 'scaleIn 150ms ease-out',
        'scale-out': 'scaleOut 150ms ease-in',
      },
      keyframes: {
        shimmer: { /* ... */ },
        fadeIn: { /* ... */ },
        fadeOut: { /* ... */ },
        slideUp: { /* ... */ },
        slideDown: { /* ... */ },
        scaleIn: { /* ... */ },
        scaleOut: { /* ... */ },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### 2. src/styles/components.css

**Additions:**
- New button styles (btn-destructive, btn-text)
- New form styles (form-helper)
- New badge styles (badge-success, badge-warning, badge-error, badge-info)
- New alert styles (alert, alert-success, alert-warning, alert-error, alert-info)
- New modal styles (modal-overlay, modal-content, modal-header, modal-body, modal-footer)
- New accessibility styles (focus-visible, sr-only)
- Dark mode overrides

### 3. List Pages (Example: product-list.component.html)

**Changes:**
```html
<!-- BEFORE: Loading State -->
<tr *ngIf="loading()">
  <td colspan="7" class="loading-cell">
    <div class="loading-spinner">
      <i class="pi pi-spin pi-spinner"></i>
      <span>Loading products...</span>
    </div>
  </td>
</tr>

<!-- AFTER: Loading State -->
<tr *ngIf="loading()">
  <td colspan="7">
    <app-skeleton-loader type="table" [rows]="5"></app-skeleton-loader>
  </td>
</tr>

<!-- BEFORE: Empty State -->
<tr *ngIf="!loading() && filteredProducts().length === 0 && !error()">
  <td colspan="7" class="empty-cell">
    <div class="empty-state">
      <i class="pi pi-inbox"></i>
      <span>No products found</span>
      <p *ngIf="hasActiveFilters()">Try adjusting your filters</p>
      <p *ngIf="!hasActiveFilters()">Create your first product to get started</p>
    </div>
  </td>
</tr>

<!-- AFTER: Empty State -->
<tr *ngIf="!loading() && filteredProducts().length === 0 && !error()">
  <td colspan="7">
    <app-empty-state
      [title]="hasActiveFilters() ? 'No results found' : 'No products yet'"
      [message]="hasActiveFilters() ? 'Try adjusting your filters' : 'Create your first product to get started'"
      [actionText]="!hasActiveFilters() ? 'Add Product' : undefined"
      (actionClick)="navigateToCreate()">
    </app-empty-state>
  </td>
</tr>
```

### 4. Form Pages (Example: product-form.component.html)

**Changes:**
```html
<!-- Add autosave indicator -->
<div class="flex justify-between items-center mb-4">
  <h1 class="text-2xl font-bold">
    {{ isEditMode() ? 'Edit Product' : 'Create Product' }}
  </h1>
  <app-autosave-indicator
    [status]="autosaveStatus()"
    [lastSaved]="lastSaved()">
  </app-autosave-indicator>
</div>

<!-- Add helper text to form fields -->
<div>
  <label class="form-label">Product Name <span class="required">*</span></label>
  <input type="text" formControlName="productName" class="form-input"
    placeholder="Enter product name"
    (blur)="onFieldBlur('productName')">
  <p *ngIf="showFieldError('productName')" class="form-error">
    Product name is required
  </p>
  <p class="form-helper">A descriptive name for the loan product</p>
</div>
```

### 5. Detail Pages (Example: product-detail.component.html)

**Changes:**
```html
<!-- Add action buttons -->
<div class="action-bar">
  <button *ngIf="canApprove()" class="btn-primary" (click)="openActionModal('approve')">
    <i class="pi pi-check mr-2"></i>Approve
  </button>
  <button *ngIf="canRequestRevision()" class="btn-secondary" (click)="openActionModal('revision')">
    <i class="pi pi-refresh mr-2"></i>Request Revision
  </button>
  <button *ngIf="canReject()" class="btn-destructive" (click)="openActionModal('reject')">
    <i class="pi pi-times mr-2"></i>Reject
  </button>
</div>

<!-- Add activity timeline -->
<div class="activity-section">
  <h3 class="section-title">
    <i class="pi pi-history"></i>
    Activity
  </h3>
  <app-activity-timeline [items]="activities()"></app-activity-timeline>
</div>

<!-- Add action modal -->
<app-action-modal
  [isOpen]="isActionModalOpen"
  [config]="actionConfig"
  [showComment]="true"
  (confirm)="onActionConfirm($event)"
  (close)="isActionModalOpen = false">
</app-action-modal>
```

---

## Summary

### Files Requiring Updates: 16 files

| Category | Count | Files |
|----------|--------|-------|
| Core Styling | 2 | tailwind.config.ts, components.css |
| List Pages | 4 | product-list, user-list, branch-list, role-list |
| Form Pages | 4 | product-form, user-form, branch-form, role-form |
| Detail Pages | 1 | product-detail |
| Loan Pages | 5 | loan-list, loan-review, loan-approval, loan-application, marketing-loan-application |
| Disbursement Pages | 1 | disbursement-list |
| Auth Pages | 1 | forgot-password |
| Layout Components | 1 | sidebar |

### New Components to Create: 6

1. Empty State Component
2. Skeleton Loader Component
3. Action Modal Component
4. Activity Timeline Component
5. Unsaved Changes Guard Directive
6. Autosave Indicator Component

### Migration Effort

| Phase | Effort | Files | Components |
|--------|---------|-------|------------|
| Phase 1: Foundation | Low | 2 | 2 |
| Phase 2: Core Components | Medium | 0 | 4 |
| Phase 3: Page Updates | High | 9 | 0 |
| Phase 4: Loan Pages | Medium | 5 | 0 |
| Phase 5: Polish | Low | 3 | 0 |

**Total Effort:** Medium-High

### Good News

✅ **Most existing classes are already correct!** The codebase is already using:
- `btn-primary`, `btn-secondary`
- `card`, `card-header`, `card-body`
- `form-label`, `form-input`, `form-select`, `form-textarea`, `form-error`
- `table-card`, `table-container`, `data-table`
- `status-badge`, `badge`
- `stats-grid`, `stat-card`, `stat-icon`

⚠️ **Main changes needed:**
1. Update Tailwind configuration
2. Add new component styles to CSS
3. Create 6 new reusable components
4. Add skeleton/empty states to list pages
5. Add action buttons and timeline to detail pages
6. Add unsaved changes guard to form pages
7. Update badge classes in loan pages

---

## Next Steps

1. Review and approve this migration plan
2. Switch to Code mode to begin implementation
3. Start with Phase 1: Foundation (Tailwind config + CSS)
4. Create new components in Phase 2
5. Update pages in Phases 3-5
6. Test thoroughly after each phase
