# Dark Theme and Loading State Fix Plan

## Overview

Task ini mencakup perbaikan:
1. **Dark Theme** - Memperbaiki komponen yang menggunakan hardcoded colors yang tidak kompatibel dengan dark mode
2. **Loading State** - Memastikan loading state ditampilkan dengan benar dan tidak menampilkan "empty state" saat masih loading

---

## 1. Dark Theme Issues

### Problem
Beberapa komponen menggunakan hardcoded Tailwind colors seperti `bg-white`, `bg-gray-50`, `text-gray-900`, dll yang tidak beradaptasi dengan dark mode.

### Solution
Ganti hardcoded colors dengan CSS custom properties yang sudah didefinisikan di [`themes.css`](src/styles/themes.css):

| Hardcoded | Replacement |
|-----------|-------------|
| `bg-white` | `bg-bg-surface` |
| `bg-gray-50` | `bg-bg-muted` |
| `bg-gray-100` | `bg-bg-muted` |
| `text-gray-900` | `text-text-primary` |
| `text-gray-500` | `text-text-secondary` atau `text-text-muted` |
| `text-gray-600` | `text-text-secondary` |

### Files to Fix

#### A. Marketing Loan Application
**File:** [`src/app/features/loans/marketing-loan-application/marketing-loan-application.component.html`](src/app/features/loans/marketing-loan-application/marketing-loan-application.component.html)

**Changes needed:**
- Line 3: `text-gray-900` → `text-text-primary`
- Line 4: `text-gray-500` → `text-text-secondary`
- Line 8: `bg-white` → `bg-bg-surface`
- Line 191, 197: `bg-gray-100` → `bg-bg-muted`, `text-gray-600` → `text-text-secondary`
- Line 216: `bg-yellow-50` → `bg-warning-bg`, `text-yellow-700` → `text-amber-600`
- Line 237: `bg-white` → `bg-bg-surface`
- Line 250, 269, 288, 307: `bg-gray-50` → `bg-bg-muted`
- Line 263, 282, 301, 320: `bg-white` → `bg-bg-surface`

#### B. Loan Application
**File:** [`src/app/features/loans/loan-application/loan-application.component.html`](src/app/features/loans/loan-application/loan-application.component.html)

**Changes needed:**
- Line 139, 159, 167, 189, 196, 217: `bg-white` → `bg-bg-surface`
- Line 160, 189, 218: `hover:bg-gray-50` → `hover:bg-bg-muted`

#### C. Loan List
**File:** [`src/app/features/loans/loan-list/loan-list.component.html`](src/app/features/loans/loan-list/loan-list.component.html)

**Changes needed:**
- Line 16: `bg-gray-50 dark:bg-gray-800` → `bg-bg-muted`
- Line 17: `text-gray-400` → `text-text-muted`
- Line 18: `text-gray-900 dark:text-gray-100` → `text-text-primary`
- Line 19: `text-gray-500 dark:text-gray-400` → `text-text-secondary`
- Line 27: `bg-white dark:bg-gray-800` → `bg-bg-surface`
- Line 29-30: `divide-gray-200 dark:divide-gray-700` → sesuaikan dengan border-default
- Line 32-46: `text-gray-500 dark:text-gray-300` → `text-text-secondary`
- Line 52: `bg-white dark:bg-gray-800` → `bg-bg-surface`
- Line 53: `hover:bg-gray-50 dark:hover:bg-gray-700` → `hover:bg-bg-muted`
- Line 55-64: `text-gray-900 dark:text-white` → `text-text-primary`
- Line 56, 72: `text-gray-500 dark:text-gray-400` → `text-text-secondary`

#### D. Loan Detail
**File:** [`src/app/features/loans/loan-detail/loan-detail.component.html`](src/app/features/loans/loan-detail/loan-detail.component.html)

**Changes needed:**
- Line 3: `text-gray-500` → `text-text-secondary`
- Line 6: `text-gray-900` → `text-text-primary`
- Line 25, 75, 87, 110, 136: `bg-white dark:bg-gray-800` → `bg-bg-surface`
- Line 26, 91, 95, 99, 103, 120, 124, 139: `text-gray-500` → `text-text-secondary`
- Line 44, 52, 60, 68, 88, 112, 157: `text-gray-900 dark:text-white` → `text-text-primary`
- Line 45, 53, 61, 69: `text-gray-500` → `text-text-secondary`
- Line 148: `bg-gray-50` → `bg-bg-muted`
- Line 149: `border-gray-200` → `border-border-default`
- Line 158: `text-gray-500` → `text-text-secondary`

---

## 2. Loading State Issues

### Problem
Di beberapa komponen, saat API sedang loading, user melihat "No items found" atau empty state sebelum data selesai dimuat.

### Solution
Pastikan kondisi empty state selalu memeriksa `!isLoading()` terlebih dahulu.

### Files to Fix

#### A. Permission List
**File:** [`src/app/features/roles/pages/permission-list.component.ts`](src/app/features/roles/pages/permission-list.component.ts)

**Current code (Line 86-95):**
```typescript
<!-- Empty -->
<tr *ngIf="!isLoading() && permissions().length === 0">
```

✅ **Already correct** - No changes needed

#### B. Role List
**File:** [`src/app/features/roles/pages/role-list.component.ts`](src/app/features/roles/pages/role-list.component.ts)

**Current code (Line 88-97):**
```typescript
<!-- Empty -->
<tr *ngIf="!isLoading() && roles().length === 0">
```

✅ **Already correct** - No changes needed

#### C. Product List
**File:** [`src/app/features/products/product-list/product-list.component.html`](src/app/features/products/product-list/product-list.component.html)

**Current code (Line 127):**
```html
<tr *ngIf="!loading() && filteredProducts().length === 0 && !error()">
```

✅ **Already correct** - No changes needed

#### D. User List
**File:** [`src/app/features/users/pages/user-list.component.html`](src/app/features/users/pages/user-list.component.html)

**Current code (Line 145):**
```html
<tr *ngIf="!loading() && users().length === 0 && !error()">
```

✅ **Already correct** - No changes needed

#### E. Branch List
**File:** [`src/app/features/branches/pages/branch-list.component.html`](src/app/features/branches/pages/branch-list.component.html)

**Current code (Line 97):**
```html
<tr *ngIf="!loading() && branches().length === 0">
```

✅ **Already correct** - No changes needed

---

## Summary

### Dark Theme Fixes Required:
1. ✅ Marketing Loan Application - Multiple hardcoded colors
2. ✅ Loan Application - bg-white and hover states
3. ✅ Loan List - Multiple hardcoded colors with dark variants
4. ✅ Loan Detail - Multiple hardcoded colors with dark variants

### Loading State Fixes Required:
- ✅ All admin modules (Product, Permission, Roles, Users, Branches) sudah menggunakan pola yang benar dengan `!isLoading()` check
- ✅ Tidak ada perubahan yang diperlukan untuk loading state

---

## Implementation Priority

1. **High Priority:** Marketing Loan Application (user request)
2. **Medium Priority:** Other loan-related components
3. **Low Priority:** Verify all other components follow the same pattern
