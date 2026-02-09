# Apple HIG Design System Implementation Plan

## Overview

This plan outlines the implementation of Apple Human Interface Guidelines (HIG) adapted for web, applied to the existing Angular + Tailwind CSS management system. The design focuses on clarity, deference, depth, consistency, and feedback.

---

## Design Principles

### Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Clarity** | Clean layout, generous whitespace, clear typography hierarchy |
| **Deference** | UI elements don't compete with content |
| **Depth** | Visual layers using cards, subtle shadows, smooth transitions |
| **Consistency** | Same patterns across List/Detail/Form pages |
| **Feedback** | Visual response for every user action |

### Tailwind Guidelines

```css
/* Text Colors */
text-gray-900  /* Primary text */
text-gray-600  /* Secondary text */
text-gray-400  /* Muted text */

/* Backgrounds */
bg-white       /* Card backgrounds */
bg-gray-50     /* Hover states */

/* Borders */
border-gray-200 /* Thin, subtle borders */

/* Shadows */
shadow-sm      /* Only on cards */

/* Radius */
rounded-xl     /* Consistent border radius */
```

---

## Component Architecture

### New Shared Components to Create

```
src/app/shared/components/
├── apple-hig/
│   ├── empty-state/
│   │   ├── empty-state.component.ts
│   │   ├── empty-state.component.html
│   │   └── empty-state.component.css
│   ├── skeleton-loader/
│   │   ├── skeleton-loader.component.ts
│   │   ├── skeleton-loader.component.html
│   │   └── skeleton-loader.component.css
│   ├── action-modal/
│   │   ├── action-modal.component.ts
│   │   ├── action-modal.component.html
│   │   └── action-modal.component.css
│   ├── activity-timeline/
│   │   ├── activity-timeline.component.ts
│   │   ├── activity-timeline.component.html
│   │   └── activity-timeline.component.css
│   ├── unsaved-changes-guard/
│   │   ├── unsaved-changes-guard.directive.ts
│   │   └── unsaved-changes-guard.directive.spec.ts
│   └── autosave-indicator/
│       ├── autosave-indicator.component.ts
│       ├── autosave-indicator.component.html
│       └── autosave-indicator.component.css
```

---

## Page Patterns

### 1. LIST PAGE Pattern

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ [ Page Title ]                    [ + Create ]          │
│ [ Subtitle ]                                            │
├─────────────────────────────────────────────────────────┤
│ [ Search ] [ Sort ] [ Filter ]                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Table / Card List                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [ Pagination ]                                         │
└─────────────────────────────────────────────────────────┘
```

#### UX Rules

- **Search**: Instant filter with 300ms debounce
- **Sorting**: Minimal dropdown, not complex icons
- **Pagination**: Simple text format "Previous 1 2 3 Next"
- **Hover**: Subtle `bg-gray-50` on rows
- **Borders**: Use dividers + spacing, no hard borders

#### Enhancements

✅ **Empty State**
```html
<div class="empty-state">
  <i class="pi pi-inbox text-4xl text-gray-300"></i>
  <h3 class="text-lg font-medium text-gray-900">No data yet</h3>
  <p class="text-gray-600">Create your first item to get started</p>
</div>
```

✅ **Skeleton Loader**
```html
<div class="skeleton-row">
  <div class="skeleton-cell w-32 h-4"></div>
  <div class="skeleton-cell w-24 h-4"></div>
  <div class="skeleton-cell w-20 h-4"></div>
</div>
```

#### Implementation Checklist

- [ ] Update existing list components to use skeleton loader
- [ ] Implement empty state component
- [ ] Ensure search debounce is 300ms
- [ ] Simplify sorting UI to dropdown
- [ ] Add hover states with `bg-gray-50`
- [ ] Remove hard borders, use dividers

---

### 2. CREATE PAGE Pattern

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ [ ← Back ]              Create Item                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [ Card Form ]                                         │
│    Label                                               │
│    Input                                               │
│    Helper text                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                    [ Cancel ] [ Save ]                 │
└─────────────────────────────────────────────────────────┘
```

#### UX Rules

- **Layout**: Single column form (Apple HIG)
- **Labels**: Above input fields
- **Helper text**: Small, subtle
- **Errors**: Soft red, not harsh
- **Buttons**: Primary button right-aligned

#### Button Styles

```css
/* Primary: Save */
.btn-primary {
  @apply bg-brand-main text-white px-6 py-2.5 rounded-lg;
}

/* Secondary: Cancel (text button) */
.btn-text {
  @apply text-gray-600 hover:text-gray-900 px-4 py-2.5;
}
```

#### Enhancements

✨ **Autosave Draft**
```html
<div class="autosave-indicator">
  <i class="pi pi-check text-green-500"></i>
  <span class="text-sm text-gray-600">Saved just now</span>
</div>
```

✨ **Inline Validation**
```typescript
// Validate on blur, not just submit
onFieldBlur(fieldName: string) {
  this.form.get(fieldName)?.markAsTouched();
  this.form.get(fieldName)?.updateValueAndValidity();
}
```

#### Implementation Checklist

- [ ] Ensure single column layout
- [ ] Place labels above inputs
- [ ] Add helper text below inputs
- [ ] Implement inline validation
- [ ] Add autosave indicator component
- [ ] Right-align primary button

---

### 3. UPDATE PAGE Pattern

Same as Create Page, with additions:

#### Additional Elements

```html
<!-- Last updated info -->
<div class="text-sm text-gray-500 mb-4">
  <i class="pi pi-clock mr-1"></i>
  Last updated 2 days ago
</div>

<!-- Buttons -->
<button class="btn-text">Reset</button>
<button class="btn-primary">Save Changes</button>
```

#### Enhancements

⚠️ **Unsaved Changes Guard**
```typescript
@Directive({
  selector: '[appUnsavedChangesGuard]'
})
export class UnsavedChangesGuard implements CanDeactivate {
  canDeactivate(component: any): boolean {
    if (component.hasUnsavedChanges()) {
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }
}
```

#### Implementation Checklist

- [ ] Add "Last updated" timestamp display
- [ ] Implement Reset button
- [ ] Create unsaved changes guard directive
- [ ] Add guard to update routes
- [ ] Test navigation with unsaved changes

---

### 4. DETAIL PAGE Pattern

#### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ [ ← Back ]              Item Name                       │
│                                                         │
│  [ Status Badge ]   [ Approve ] [ Reject ]              │
├─────────────────────────────────────────────────────────┤
│  Info Section                                          │
├─────────────────────────────────────────────────────────┤
│  Comment / Activity Section                            │
└─────────────────────────────────────────────────────────┘
```

#### UX Rules

- **Read-only**: Detail is not a form
- **Grouped data**: Information grouped per section
- **Label-value**: Vertical layout
- **Status**: Use subtle badge (`rounded-full`)

#### Status Badge Styles

```css
.status-badge {
  @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium;
}

.status-badge.active {
  @apply bg-green-100 text-green-700;
}

.status-badge.inactive {
  @apply bg-gray-100 text-gray-700;
}

.status-badge.pending {
  @apply bg-yellow-100 text-yellow-700;
}
```

#### Implementation Checklist

- [ ] Ensure read-only display
- [ ] Group related information
- [ ] Use vertical label-value layout
- [ ] Add status badges with `rounded-full`
- [ ] Include action buttons (Approve/Reject)
- [ ] Add activity timeline section

---

### 5. DELETE Pattern (Alert)

#### Modal Style (Apple HIG)

```html
<div class="modal-overlay">
  <div class="modal-content max-w-sm">
    <h2 class="text-lg font-semibold text-gray-900">Delete item?</h2>
    <p class="text-gray-600 mt-2">This action cannot be undone.</p>
    <div class="flex justify-end gap-3 mt-6">
      <button class="btn-text">Cancel</button>
      <button class="btn-destructive">Delete</button>
    </div>
  </div>
</div>
```

#### Modal Styles

```css
.modal-overlay {
  @apply fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-white border border-gray-200 rounded-2xl shadow-2xl p-6;
}

.btn-destructive {
  @apply bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600;
}
```

#### Enhancements

🧠 **Soft Undo with Toast**
```typescript
onDeleteConfirmed() {
  this.service.deleteItem(id).subscribe({
    next: () => {
      this.toastService.show({
        message: 'Item deleted',
        action: 'Undo',
        duration: 5000,
        onAction: () => this.undoDelete(id)
      });
    }
  });
}
```

#### Implementation Checklist

- [ ] Create Apple-style delete modal
- [ ] Add backdrop blur effect
- [ ] Use clear, concise copy
- [ ] Implement soft undo with toast
- [ ] Add 5-second undo window

---

### 6. ACTION BUTTONS Pattern

#### Action Locations

📍 **Detail Page** (Primary location)
📍 **List Page** → Quick actions only (optional)

#### Action Layout (Detail Page)

```html
<div class="flex gap-3">
  <button class="btn-primary" (click)="openActionModal('approve')">
    Approve
  </button>
  <button class="btn-secondary" (click)="openActionModal('revision')">
    Request Revision
  </button>
  <button class="btn-destructive" (click)="openActionModal('reject')">
    Reject
  </button>
</div>
```

#### Enhancement: Comment on Action ⭐

```html
<!-- Action Modal with Comment -->
<div class="modal-overlay">
  <div class="modal-content">
    <h2 class="text-lg font-semibold">{{ actionTitle }}</h2>
    <textarea
      class="form-textarea mt-4"
      placeholder="Add a comment (optional)"
      rows="3"
    ></textarea>
    <div class="flex justify-end gap-3 mt-6">
      <button class="btn-text">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

#### Implementation Checklist

- [ ] Create action modal component
- [ ] Add optional comment textarea
- [ ] Store comments as audit trail
- [ ] Display comments in activity timeline
- [ ] Add action buttons to detail pages

---

### 7. ACTIVITY / COMMENT TIMELINE

#### Timeline Component

```html
<div class="activity-timeline">
  <div class="timeline-item">
    <div class="timeline-icon">
      <i class="pi pi-check text-green-500"></i>
    </div>
    <div class="timeline-content">
      <p class="font-medium text-gray-900">Approved by Admin</p>
      <p class="text-gray-600 text-sm">"Looks good"</p>
      <p class="text-gray-400 text-xs mt-1">2 hours ago</p>
    </div>
  </div>

  <div class="timeline-item">
    <div class="timeline-icon">
      <i class="pi pi-plus text-blue-500"></i>
    </div>
    <div class="timeline-content">
      <p class="font-medium text-gray-900">Created</p>
      <p class="text-gray-600 text-sm">by User</p>
      <p class="text-gray-400 text-xs mt-1">1 day ago</p>
    </div>
  </div>
</div>
```

#### Timeline Styles

```css
.activity-timeline {
  @apply space-y-4;
}

.timeline-item {
  @apply flex gap-3;
}

.timeline-icon {
  @apply w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0;
}

.timeline-content {
  @apply flex-1;
}
```

#### Implementation Checklist

- [ ] Create activity timeline component
- [ ] Support multiple event types
- [ ] Display comments with actions
- [ ] Show relative timestamps
- [ ] Add to detail pages

---

## Accessibility (Apple-level Polish)

### Focus Management

```css
/* Visible focus ring */
*:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 outline-none;
}

/* Button min height */
button, a {
  @apply min-h-[44px];
}
```

### Contrast Requirements

- WCAG AA compliance
- Text contrast ratio ≥ 4.5:1
- Large text contrast ratio ≥ 3:1

### Keyboard Navigation

```typescript
// Ensure all interactive elements are keyboard accessible
@HostListener('keydown.enter')
onEnter() {
  this.onSubmit();
}

@HostListener('keydown.escape')
onEscape() {
  this.closeModal();
}
```

### Implementation Checklist

- [ ] Add visible focus rings (`ring-blue-500`)
- [ ] Ensure WCAG AA contrast
- [ ] Test keyboard navigation
- [ ] Add ARIA labels where needed
- [ ] Ensure button min-height 44px

---

## Tailwind Configuration Updates

### Update `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Apple-inspired color palette
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Brand colors
        brand: {
          main: '#3b82f6',
          hover: '#2563eb',
          soft: '#dbeafe',
        },
        // Status colors
        success: {
          bg: '#dcfce7',
          text: '#16a34a',
        },
        warning: {
          bg: '#fef3c7',
          text: '#d97706',
        },
        error: {
          bg: '#fee2e2',
          text: '#dc2626',
        },
      },
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'apple-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        'apple-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'apple': '0.75rem', // 12px
      },
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## Component Implementation Order

### Phase 1: Foundation Components
1. Empty State Component
2. Skeleton Loader Component
3. Autosave Indicator Component
4. Unsaved Changes Guard Directive

### Phase 2: Interactive Components
5. Action Modal Component (with comment)
6. Activity Timeline Component
7. Enhanced Delete Confirmation Modal

### Phase 3: Page Pattern Updates
8. Update List Pages (Products, Users, Branches, Roles)
9. Update Create Pages
10. Update Detail Pages
11. Add Activity Timeline to Detail Pages

### Phase 4: Accessibility & Polish
12. Add focus rings and keyboard navigation
13. Ensure WCAG AA contrast
14. Test with screen readers
15. Final polish and documentation

---

## File Structure

### New Component Files

```
src/app/shared/components/apple-hig/
├── empty-state/
│   ├── empty-state.component.ts
│   ├── empty-state.component.html
│   ├── empty-state.component.css
│   └── empty-state.component.spec.ts
├── skeleton-loader/
│   ├── skeleton-loader.component.ts
│   ├── skeleton-loader.component.html
│   ├── skeleton-loader.component.css
│   └── skeleton-loader.component.spec.ts
├── action-modal/
│   ├── action-modal.component.ts
│   ├── action-modal.component.html
│   ├── action-modal.component.css
│   └── action-modal.component.spec.ts
├── activity-timeline/
│   ├── activity-timeline.component.ts
│   ├── activity-timeline.component.html
│   ├── activity-timeline.component.css
│   └── activity-timeline.component.spec.ts
├── unsaved-changes-guard/
│   ├── unsaved-changes-guard.directive.ts
│   └── unsaved-changes-guard.directive.spec.ts
└── autosave-indicator/
    ├── autosave-indicator.component.ts
    ├── autosave-indicator.component.html
    ├── autosave-indicator.component.css
    └── autosave-indicator.component.spec.ts
```

### Updated Existing Files

```
src/app/features/
├── products/
│   ├── product-list/
│   │   ├── product-list.component.ts (update)
│   │   └── product-list.component.html (update)
│   ├── product-detail/
│   │   ├── product-detail.component.ts (update)
│   │   └── product-detail.component.html (update)
│   └── product-form/
│       ├── product-form.component.ts (update)
│       └── product-form.component.html (update)
├── users/
│   ├── pages/
│   │   ├── user-list.component.ts (update)
│   │   ├── user-list.component.html (update)
│   │   ├── user-form.component.ts (update)
│   │   └── user-form.component.html (update)
│   └── user-detail/
│       ├── user-detail.component.ts (create)
│       └── user-detail.component.html (create)
├── branches/
│   ├── pages/
│   │   ├── branch-list.component.ts (update)
│   │   ├── branch-list.component.html (update)
│   │   ├── branch-form.component.ts (update)
│   │   └── branch-form.component.html (update)
│   └── branch-detail/
│       ├── branch-detail.component.ts (create)
│       └── branch-detail.component.html (create)
└── roles/
    ├── pages/
    │   ├── role-list.component.ts (update)
    │   ├── role-list.component.html (update)
    │   ├── role-form.component.ts (update)
    │   └── role-form.component.html (update)
    └── role-detail/
        ├── role-detail.component.ts (create)
        └── role-detail.component.html (create)
```

---

## Design Documentation

### Create `docs/design-system.md`

```markdown
# Design System Documentation

## Overview
Apple HIG-inspired design system for the management application.

## Principles
- Clarity
- Deference
- Depth
- Consistency
- Feedback

## Components
- [Empty State](#empty-state)
- [Skeleton Loader](#skeleton-loader)
- [Action Modal](#action-modal)
- [Activity Timeline](#activity-timeline)

## Page Patterns
- [List Page](#list-page)
- [Create Page](#create-page)
- [Update Page](#update-page)
- [Detail Page](#detail-page)

## Accessibility
- Focus rings
- Keyboard navigation
- WCAG AA contrast
- ARIA labels
```

---

## Testing Strategy

### Component Tests
- Unit tests for all new components
- Test accessibility attributes
- Test keyboard navigation
- Test responsive behavior

### E2E Tests
- Test complete user flows
- Test form validation
- Test action modals
- Test unsaved changes guard

### Accessibility Tests
- Use axe-core for automated testing
- Manual testing with screen readers
- Keyboard-only navigation testing

---

## Migration Strategy

### Incremental Updates
1. Start with one module (e.g., Products)
2. Apply all patterns to Products module
3. Test thoroughly
4. Repeat for other modules

### Backward Compatibility
- Keep existing functionality intact
- Gradually replace old patterns
- Maintain API compatibility

---

## Success Criteria

- ✅ All pages follow Apple HIG patterns
- ✅ Consistent design across all modules
- ✅ Accessibility WCAG AA compliant
- ✅ Smooth animations and transitions
- ✅ Clear feedback for all actions
- ✅ All components tested
- ✅ Documentation complete

---

## Next Steps

1. Review and approve this plan
2. Switch to Code mode to begin implementation
3. Start with Phase 1: Foundation Components
4. Follow implementation order
5. Test each phase before proceeding
