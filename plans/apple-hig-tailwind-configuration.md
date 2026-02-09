# Apple HIG Tailwind Configuration & Styling Guide

## Table of Contents
1. [Tailwind Configuration](#tailwind-configuration)
2. [Color Palette](#color-palette)
3. [Typography Scale](#typography-scale)
4. [Spacing Scale](#spacing-scale)
5. [Component Styles](#component-styles)
6. [Utility Classes](#utility-classes)
7. [Dark Mode Support](#dark-mode-support)
8. [Accessibility Styles](#accessibility-styles)

---

## Tailwind Configuration

### Complete `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Color Palette
      colors: {
        // Gray Scale (Apple-inspired)
        gray: {
          50: '#f9fafb',   // bg-gray-50 - hover states
          100: '#f3f4f6',  // bg-gray-100 - muted backgrounds
          200: '#e5e7eb',  // border-gray-200 - borders
          300: '#d1d5db',  // border-gray-300 - subtle borders
          400: '#9ca3af',  // text-gray-400 - muted text
          500: '#6b7280',  // text-gray-500 - secondary text
          600: '#4b5563',  // text-gray-600 - body text
          700: '#374151',  // text-gray-700 - headings
          800: '#1f2937',  // text-gray-800 - dark text
          900: '#111827',  // text-gray-900 - primary text
        },

        // Brand Colors
        brand: {
          main: '#3b82f6',      // Primary brand color (blue-500)
          hover: '#2563eb',     // Hover state (blue-600)
          soft: '#dbeafe',      // Soft background (blue-100)
          light: '#eff6ff',     // Light background (blue-50)
        },

        // Semantic Colors
        success: {
          bg: '#dcfce7',        // Success background (green-100)
          text: '#16a34a',      // Success text (green-600)
          border: '#86efac',    // Success border (green-300)
        },
        warning: {
          bg: '#fef3c7',        // Warning background (yellow-100)
          text: '#d97706',      // Warning text (yellow-600)
          border: '#fcd34d',    // Warning border (yellow-300)
        },
        error: {
          bg: '#fee2e2',        // Error background (red-100)
          text: '#dc2626',      // Error text (red-600)
          border: '#fca5a5',    // Error border (red-300)
        },
        info: {
          bg: '#dbeafe',        // Info background (blue-100)
          text: '#2563eb',      // Info text (blue-600)
          border: '#93c5fd',    // Info border (blue-300)
        },

        // Surface Colors (for cards, modals, etc.)
        surface: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },

        // Background Colors
        bg: {
          primary: '#ffffff',    // Main background
          secondary: '#f9fafb', // Secondary background
          muted: '#f3f4f6',     // Muted background
          surface: '#ffffff',    // Surface (cards, modals)
        },

        // Text Colors
        text: {
          primary: '#111827',    // Primary text (gray-900)
          secondary: '#4b5563', // Secondary text (gray-600)
          muted: '#9ca3af',     // Muted text (gray-400)
          inverse: '#ffffff',    // Inverse text (white)
        },

        // Border Colors
        border: {
          default: '#e5e7eb',   // Default border (gray-200)
          muted: '#f3f4f6',     // Muted border (gray-100)
          focus: '#3b82f6',     // Focus border (brand-main)
        },
      },

      // Typography
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },

      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },

      letterSpacing: {
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
      },

      // Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Border Radius
      borderRadius: {
        'apple': '0.75rem',    // 12px - Apple-style rounded corners
        'apple-lg': '1rem',    // 16px - Larger rounded corners
        'apple-xl': '1.25rem', // 20px - Extra large rounded corners
      },

      // Shadows (Apple-inspired)
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'apple': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'apple-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'apple-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'apple-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'apple-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

        // Modal shadow
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',

        // Focus ring
        'focus': '0 0 0 3px rgba(59, 130, 246, 0.3)',
      },

      // Transitions
      transitionDuration: {
        '150': '150ms',
        '300': '300ms',
      },

      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // Animations
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
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },

      // Z-index scale
      zIndex: {
        'dropdown': 1000,
        'sticky': 1020,
        'fixed': 1030,
        'modal-backdrop': 1040,
        'modal': 1050,
        'popover': 1060,
        'tooltip': 1070,
      },
    },
  },
  plugins: [],
} satisfies Config;
```

---

## Color Palette

### Gray Scale (Apple-inspired)

| Class | Hex | Usage |
|-------|-----|-------|
| `bg-gray-50` | `#f9fafb` | Hover states, subtle backgrounds |
| `bg-gray-100` | `#f3f4f6` | Muted backgrounds, section dividers |
| `border-gray-200` | `#e5e7eb` | Default borders |
| `border-gray-300` | `#d1d5db` | Subtle borders |
| `text-gray-400` | `#9ca3af` | Muted text, placeholders |
| `text-gray-500` | `#6b7280` | Secondary text |
| `text-gray-600` | `#4b5563` | Body text |
| `text-gray-700` | `#374151` | Subheadings |
| `text-gray-900` | `#111827` | Primary text, headings |

### Brand Colors

| Class | Hex | Usage |
|-------|-----|-------|
| `bg-brand-main` | `#3b82f6` | Primary buttons, links, active states |
| `bg-brand-hover` | `#2563eb` | Hover states for brand elements |
| `bg-brand-soft` | `#dbeafe` | Soft brand backgrounds, badges |
| `text-brand-main` | `#3b82f6` | Brand-colored text |
| `border-brand-main` | `#3b82f6` | Brand-colored borders |

### Semantic Colors

#### Success (Green)

| Class | Hex | Usage |
|-------|-----|-------|
| `bg-success-bg` | `#dcfce7` | Success backgrounds |
| `text-success-text` | `#16a34a` | Success text |
| `border-success-border` | `#86efac` | Success borders |

#### Warning (Yellow)

| Class | Hex | Usage |
|-------|-----|-------|
| `bg-warning-bg` | `#fef3c7` | Warning backgrounds |
| `text-warning-text` | `#d97706` | Warning text |
| `border-warning-border` | `#fcd34d` | Warning borders |

#### Error (Red)

| Class | Hex | Usage |
|-------|-----|-------|
| `bg-error-bg` | `#fee2e2` | Error backgrounds |
| `text-error-text` | `#dc2626` | Error text |
| `border-error-border` | `#fca5a5` | Error borders |

---

## Typography Scale

### Font Sizes

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Captions, labels |
| `text-sm` | 14px | 20px | Helper text, secondary info |
| `text-base` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Subheadings |
| `text-xl` | 20px | 28px | Section headings |
| `text-2xl` | 24px | 32px | Page titles |
| `text-3xl` | 30px | 36px | Large headings |
| `text-4xl` | 36px | 40px | Hero headings |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized text |
| `font-semibold` | 600 | Headings, labels |
| `font-bold` | 700 | Strong emphasis |

### Letter Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `tracking-tight` | -0.025em | Large headings |
| `tracking-normal` | 0 | Default |
| `tracking-wide` | 0.025em | Uppercase text |

---

## Spacing Scale

### Standard Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `p-1` | 4px | Tight padding |
| `p-2` | 8px | Small padding |
| `p-3` | 12px | Default padding |
| `p-4` | 16px | Medium padding |
| `p-6` | 24px | Large padding |
| `p-8` | 32px | Extra large padding |

### Gap Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight gaps |
| `gap-2` | 8px | Small gaps |
| `gap-3` | 12px | Default gaps |
| `gap-4` | 16px | Medium gaps |
| `gap-6` | 24px | Large gaps |
| `gap-8` | 32px | Extra large gaps |

---

## Component Styles

### Buttons

#### Primary Button

```css
.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2.5 rounded-lg
         font-semibold text-white bg-brand-main hover:bg-brand-hover
         transition-all duration-200 shadow-apple-sm
         disabled:bg-gray-300 disabled:cursor-not-allowed
         min-h-[44px];
}

.btn-primary:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}
```

#### Secondary Button

```css
.btn-secondary {
  @apply inline-flex items-center justify-center px-4 py-2.5 rounded-lg
         font-semibold text-text-primary border border-border-default
         hover:bg-bg-muted transition-all duration-200
         disabled:opacity-50 disabled:cursor-not-allowed
         min-h-[44px];
}

.btn-secondary:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}
```

#### Text Button

```css
.btn-text {
  @apply inline-flex items-center justify-center px-4 py-2.5 rounded-lg
         font-semibold text-text-secondary hover:text-text-primary
         hover:bg-bg-muted transition-all duration-200
         min-h-[44px];
}

.btn-text:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}
```

#### Destructive Button

```css
.btn-destructive {
  @apply inline-flex items-center justify-center px-4 py-2.5 rounded-lg
         font-semibold text-white bg-error-text hover:bg-red-700
         transition-all duration-200 shadow-apple-sm
         min-h-[44px];
}

.btn-destructive:focus-visible {
  @apply ring-2 ring-error-text ring-offset-2 outline-none;
}
```

### Form Elements

#### Input Fields

```css
.form-input,
.form-select {
  @apply w-full px-4 py-2.5 rounded-lg bg-bg-surface
         border border-border-default text-text-primary
         transition-all duration-200
         focus:ring-2 focus:ring-brand-main focus:border-brand-main
         outline-none disabled:bg-bg-muted disabled:cursor-not-allowed
         placeholder:text-text-muted min-h-[44px];
}

.form-input:focus-visible,
.form-select:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}

.form-input.error,
.form-select.error {
  @apply border-error-text focus:ring-error-text focus:border-error-text;
}
```

#### Textarea

```css
.form-textarea {
  @apply w-full px-4 py-2.5 rounded-lg bg-bg-surface
         border border-border-default text-text-primary
         transition-all duration-200 resize-y
         focus:ring-2 focus:ring-brand-main focus:border-brand-main
         outline-none disabled:bg-bg-muted disabled:cursor-not-allowed
         placeholder:text-text-muted;
}

.form-textarea:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}
```

#### Form Labels

```css
.form-label {
  @apply block text-sm font-medium text-text-secondary mb-1.5;
}

.form-label .required {
  @apply text-error-text;
}
```

#### Helper Text

```css
.form-helper {
  @apply text-xs text-text-muted mt-1;
}
```

#### Error Messages

```css
.form-error {
  @apply text-sm text-error-text mt-1;
}
```

### Cards

```css
.card {
  @apply bg-bg-surface border border-border-default rounded-apple
         shadow-apple-sm overflow-hidden;
}

.card-header {
  @apply px-6 py-4 border-b border-border-default bg-bg-muted/50;
}

.card-body {
  @apply p-6;
}

.card-footer {
  @apply px-6 py-4 border-t border-border-default bg-bg-muted/50;
}
```

### Tables

```css
.table-container {
  @apply w-full overflow-x-auto border border-border-default rounded-apple bg-bg-surface;
}

.data-table {
  @apply w-full border-collapse text-left text-sm;
}

.data-table thead th {
  @apply px-4 py-3 bg-bg-muted font-semibold text-text-secondary
         border-b border-border-default;
}

.data-table tbody td {
  @apply px-4 py-4 border-b border-border-muted text-text-primary;
}

.data-table tbody tr {
  @apply transition-colors;
}

.data-table tbody tr:hover {
  @apply bg-gray-50;
}

.data-table tbody tr:last-child td {
  @apply border-b-0;
}
```

### Badges

```css
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full
         text-xs font-medium;
}

.badge-success {
  @apply bg-success-bg text-success-text;
}

.badge-warning {
  @apply bg-warning-bg text-warning-text;
}

.badge-error {
  @apply bg-error-bg text-error-text;
}

.badge-info {
  @apply bg-info-bg text-info-text;
}

.status-badge {
  @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-full
         text-sm font-medium;
}

.status-badge.active {
  @apply bg-success-bg text-success-text;
}

.status-badge.inactive {
  @apply bg-gray-100 text-gray-700;
}

.status-badge.pending {
  @apply bg-warning-bg text-warning-text;
}
```

### Modals

```css
.modal-overlay {
  @apply fixed inset-0 bg-black/40 backdrop-blur-sm z-modal
         flex items-center justify-center p-4
         animate-fade-in;
}

.modal-content {
  @apply bg-bg-surface border border-border-default rounded-apple-xl
         shadow-modal w-full max-w-lg transform
         animate-scale-in;
}

.modal-header {
  @apply px-6 py-4 border-b border-border-default;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply px-6 py-4 border-t border-border-default
         flex justify-end gap-3;
}
```

### Alerts

```css
.alert {
  @apply flex items-start gap-3 p-4 rounded-lg border;
}

.alert-success {
  @apply bg-success-bg border-success-border text-success-text;
}

.alert-warning {
  @apply bg-warning-bg border-warning-border text-warning-text;
}

.alert-error {
  @apply bg-error-bg border-error-border text-error-text;
}

.alert-info {
  @apply bg-info-bg border-info-border text-info-text;
}

.alert-icon {
  @apply flex-shrink-0 mt-0.5;
}

.alert-message {
  @apply flex-1 text-sm;
}

.alert-action {
  @apply flex-shrink-0;
}
```

---

## Utility Classes

### Layout

```css
/* Page Layout */
.page {
  @apply min-h-screen bg-bg-secondary;
}

.page-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}

.page-header {
  @apply flex items-center gap-4 mb-6;
}

.page-title {
  @apply text-2xl font-bold text-text-primary m-0;
}

.page-subtitle {
  @apply text-text-secondary m-0;
}

/* List Page */
.list-page {
  @apply space-y-6;
}

.list-header {
  @apply flex flex-col md:flex-row md:items-center justify-between gap-4;
}

.header-left {
  @apply flex items-center gap-4;
}

.header-actions {
  @apply flex items-center gap-3;
}

.page-icon {
  @apply w-14 h-14 bg-brand-soft text-brand-main rounded-2xl
         flex items-center justify-center shadow-apple-sm;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4;
}

.stat-card {
  @apply bg-bg-surface border border-border-default rounded-apple
         shadow-apple-sm p-6 flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 rounded-xl flex items-center justify-center text-xl;
}

.stat-content {
  @apply flex flex-col;
}

.stat-value {
  @apply text-2xl font-bold text-text-primary;
}

.stat-label {
  @apply text-sm text-text-muted;
}

/* Filter Bar */
.filter-bar {
  @apply card p-4;
}

.search-input {
  @apply relative flex-1;
}

.search-input i {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-text-muted;
}

.search-input input {
  @apply pl-10;
}

.filter-controls {
  @apply flex flex-col sm:flex-row gap-3;
}

/* Form Page */
.create-page,
.update-page,
.detail-page {
  @apply space-y-6 max-w-4xl mx-auto;
}

.back-button {
  @apply w-10 h-10 rounded-lg bg-bg-muted text-text-secondary
         hover:text-text-primary flex items-center justify-center
         transition-colors min-h-[44px];
}

/* Form Card */
.form-card {
  @apply card;
}

.form-body {
  @apply p-6 space-y-6;
}

.form-section {
  @apply space-y-4;
}

.section-title {
  @apply text-lg font-semibold text-text-primary flex items-center gap-2;
}

.section-title i {
  @apply text-brand-main;
}

.form-divider {
  @apply border-border-default;
}

.form-row {
  @apply grid grid-cols-1 sm:grid-cols-2 gap-4;
}

.form-field {
  @apply space-y-1.5;
}

.form-actions {
  @apply flex justify-end gap-3 pt-4 border-t border-border-default;
}

/* Detail Page */
.detail-content {
  @apply space-y-6;
}

.action-bar {
  @apply flex flex-wrap gap-3 mb-6;
}

.info-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.info-card {
  @apply card;
}

.info-card-title {
  @apply text-lg font-semibold text-text-primary flex items-center gap-2 mb-4;
}

.info-card-title i {
  @apply text-brand-main;
}

.info-list {
  @apply space-y-4;
}

.info-item {
  @apply flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1;
}

.info-label {
  @apply text-sm text-text-muted;
}

.info-value {
  @apply text-sm font-medium text-text-primary;
}

.activity-section {
  @apply card;
}

/* Action Buttons in Tables */
.actions-cell {
  @apply text-center;
}

.btn-action {
  @apply w-8 h-8 rounded-lg flex items-center justify-center
         transition-all duration-200 min-h-[32px];
}

.btn-action.view {
  @apply bg-bg-muted text-text-muted hover:text-blue-500;
}

.btn-action.edit {
  @apply bg-bg-muted text-text-muted hover:text-brand-main;
}

.btn-action.delete {
  @apply bg-bg-muted text-text-muted hover:text-error-text;
}

.btn-action.toggle {
  @apply bg-bg-muted text-text-muted hover:text-success-text;
}
```

---

## Dark Mode Support

### Dark Mode Color Overrides

```css
/* Dark mode colors */
.dark {
  color-scheme: dark;
}

.dark .bg-bg-primary {
  @apply bg-gray-900;
}

.dark .bg-bg-secondary {
  @apply bg-gray-800;
}

.dark .bg-bg-muted {
  @apply bg-gray-700;
}

.dark .bg-bg-surface {
  @apply bg-gray-800;
}

.dark .text-text-primary {
  @apply text-gray-100;
}

.dark .text-text-secondary {
  @apply text-gray-300;
}

.dark .text-text-muted {
  @apply text-gray-500;
}

.dark .border-border-default {
  @apply border-gray-700;
}

.dark .border-border-muted {
  @apply border-gray-600;
}

.dark .card {
  @apply bg-gray-800 border-gray-700;
}

.dark .data-table thead th {
  @apply bg-gray-700 text-gray-300 border-gray-600;
}

.dark .data-table tbody td {
  @apply border-gray-700 text-gray-200;
}

.dark .data-table tbody tr:hover {
  @apply bg-gray-700/50;
}

.dark .form-input,
.dark .form-select,
.dark .form-textarea {
  @apply bg-gray-700 border-gray-600 text-gray-100;
}

.dark .form-input:focus,
.dark .form-select:focus,
.dark .form-textarea:focus {
  @apply bg-gray-600;
}

.dark .btn-primary {
  @apply bg-brand-main hover:bg-brand-hover;
}

.dark .btn-secondary {
  @apply bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600;
}

.dark .btn-text {
  @apply text-gray-400 hover:text-gray-200 hover:bg-gray-700;
}

.dark .status-badge.active {
  @apply bg-green-900/50 text-green-400;
}

.dark .status-badge.inactive {
  @apply bg-gray-700 text-gray-400;
}

.dark .status-badge.pending {
  @apply bg-yellow-900/50 text-yellow-400;
}

.dark .modal-overlay {
  @apply bg-black/60;
}

.dark .modal-content {
  @apply bg-gray-800 border-gray-700;
}

.dark .alert-success {
  @apply bg-green-900/30 border-green-700 text-green-400;
}

.dark .alert-warning {
  @apply bg-yellow-900/30 border-yellow-700 text-yellow-400;
}

.dark .alert-error {
  @apply bg-red-900/30 border-red-700 text-red-400;
}

.dark .alert-info {
  @apply bg-blue-900/30 border-blue-700 text-blue-400;
}
```

---

## Accessibility Styles

### Focus Management

```css
/* Visible focus ring for all interactive elements */
*:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}

.dark *:focus-visible {
  @apply ring-offset-gray-900;
}

/* Remove default outline and use custom focus ring */
*:focus {
  @apply outline-none;
}

/* Skip link for keyboard navigation */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4
         focus:left-4 focus:z-[9999] focus:px-4 focus:py-2
         focus:bg-brand-main focus:text-white focus:rounded-lg;
}
```

### Screen Reader Only

```css
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden
         whitespace-nowrap border-0;
}

.not-sr-only {
  @apply static w-auto h-auto p-0 m-0 overflow-visible
         whitespace-normal;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .btn-primary {
    @apply border-2 border-white;
  }

  .btn-secondary {
    @apply border-2 border-text-primary;
  }

  .card {
    @apply border-2 border-border-default;
  }
}
```

### Touch Targets

```css
/* Ensure minimum touch target size (44x44px) */
button,
a,
input,
select,
textarea {
  @apply min-h-[44px];
}

/* For smaller elements like icon buttons, add padding */
.btn-action {
  @apply p-2;
}
```

---

## Complete CSS File Structure

### `src/styles/components.css`

```css
/* Apple HIG Design System Components */

/* ========================================
   SCROLLBAR
   ======================================== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--border-default);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.dark ::-webkit-scrollbar-thumb {
  background: var(--surface-400);
}

/* ========================================
   TYPOGRAPHY
   ======================================== */
h1 {
  @apply text-3xl font-bold tracking-tight text-text-primary;
}

h2 {
  @apply text-2xl font-bold tracking-tight text-text-primary;
}

h3 {
  @apply text-xl font-semibold tracking-tight text-text-primary;
}

h4 {
  @apply text-lg font-semibold text-text-primary;
}

p {
  @apply text-text-secondary leading-relaxed;
}

/* ========================================
   BUTTONS
   ======================================== */
.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2.5 rounded-lg
         font-semibold text-white bg-brand-main hover:bg-brand-hover
         transition-all duration-200 shadow-apple-sm
         disabled:bg-gray-300 disabled:cursor-not-allowed
         min-h-[44px];
}

.btn-primary:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}

.btn-secondary {
  @apply inline-flex items-center justify-center px-4 py-2.5 rounded-lg
         font-semibold text-text-primary border border-border-default
         hover:bg-bg-muted transition-all duration-200
         disabled:opacity-50 disabled:cursor-not-allowed
         min-h-[44px];
}

.btn-secondary:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}

.btn-text {
  @apply inline-flex items-center justify-center px-4 py-2.5 rounded-lg
         font-semibold text-text-secondary hover:text-text-primary
         hover:bg-bg-muted transition-all duration-200
         min-h-[44px];
}

.btn-text:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}

.btn-destructive {
  @apply inline-flex items-center justify-center px-4 py-2.5 rounded-lg
         font-semibold text-white bg-error-text hover:bg-red-700
         transition-all duration-200 shadow-apple-sm
         min-h-[44px];
}

.btn-destructive:focus-visible {
  @apply ring-2 ring-error-text ring-offset-2 outline-none;
}

.btn-link {
  @apply text-brand-main hover:text-brand-hover underline
         transition-colors;
}

/* ========================================
   FORM ELEMENTS
   ======================================== */
.form-input,
.form-select,
.form-textarea {
  @apply w-full px-4 py-2.5 rounded-lg bg-bg-surface
         border border-border-default text-text-primary
         transition-all duration-200
         focus:ring-2 focus:ring-brand-main focus:border-brand-main
         outline-none disabled:bg-bg-muted disabled:cursor-not-allowed
         placeholder:text-text-muted min-h-[44px];
}

.form-input:focus-visible,
.form-select:focus-visible,
.form-textarea:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  @apply border-error-text focus:ring-error-text focus:border-error-text;
}

.form-label {
  @apply block text-sm font-medium text-text-secondary mb-1.5;
}

.form-label .required {
  @apply text-error-text;
}

.form-helper {
  @apply text-xs text-text-muted mt-1;
}

.form-error {
  @apply text-sm text-error-text mt-1;
}

/* ========================================
   CARDS
   ======================================== */
.card {
  @apply bg-bg-surface border border-border-default rounded-apple
         shadow-apple-sm overflow-hidden;
}

.card-header {
  @apply px-6 py-4 border-b border-border-default bg-bg-muted/50;
}

.card-body {
  @apply p-6;
}

.card-footer {
  @apply px-6 py-4 border-t border-border-default bg-bg-muted/50;
}

/* ========================================
   TABLES
   ======================================== */
.table-container {
  @apply w-full overflow-x-auto border border-border-default rounded-apple bg-bg-surface;
}

.data-table {
  @apply w-full border-collapse text-left text-sm;
}

.data-table thead th {
  @apply px-4 py-3 bg-bg-muted font-semibold text-text-secondary
         border-b border-border-default;
}

.data-table tbody td {
  @apply px-4 py-4 border-b border-border-muted text-text-primary;
}

.data-table tbody tr {
  @apply transition-colors;
}

.data-table tbody tr:hover {
  @apply bg-gray-50;
}

.dark .data-table tbody tr:hover {
  @apply bg-gray-700/50;
}

.data-table tbody tr:last-child td {
  @apply border-b-0;
}

/* ========================================
   BADGES
   ======================================== */
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full
         text-xs font-medium;
}

.badge-success {
  @apply bg-success-bg text-success-text;
}

.badge-warning {
  @apply bg-warning-bg text-warning-text;
}

.badge-error {
  @apply bg-error-bg text-error-text;
}

.badge-info {
  @apply bg-info-bg text-info-text;
}

.status-badge {
  @apply inline-flex items-center gap-1.5 px-3 py-1 rounded-full
         text-sm font-medium;
}

.status-badge.active {
  @apply bg-success-bg text-success-text;
}

.status-badge.inactive {
  @apply bg-gray-100 text-gray-700;
}

.status-badge.pending {
  @apply bg-warning-bg text-warning-text;
}

/* ========================================
   MODALS
   ======================================== */
.modal-overlay {
  @apply fixed inset-0 bg-black/40 backdrop-blur-sm z-modal
         flex items-center justify-center p-4
         animate-fade-in;
}

.modal-content {
  @apply bg-bg-surface border border-border-default rounded-apple-xl
         shadow-modal w-full max-w-lg transform
         animate-scale-in;
}

.modal-header {
  @apply px-6 py-4 border-b border-border-default;
}

.modal-body {
  @apply px-6 py-4;
}

.modal-footer {
  @apply px-6 py-4 border-t border-border-default
         flex justify-end gap-3;
}

/* ========================================
   ALERTS
   ======================================== */
.alert {
  @apply flex items-start gap-3 p-4 rounded-lg border;
}

.alert-success {
  @apply bg-success-bg border-success-border text-success-text;
}

.alert-warning {
  @apply bg-warning-bg border-warning-border text-warning-text;
}

.alert-error {
  @apply bg-error-bg border-error-border text-error-text;
}

.alert-info {
  @apply bg-info-bg border-info-border text-info-text;
}

.alert-icon {
  @apply flex-shrink-0 mt-0.5;
}

.alert-message {
  @apply flex-1 text-sm;
}

.alert-action {
  @apply flex-shrink-0;
}

/* ========================================
   ACCESSIBILITY
   ======================================== */
*:focus-visible {
  @apply ring-2 ring-brand-main ring-offset-2 outline-none;
}

.dark *:focus-visible {
  @apply ring-offset-gray-900;
}

*:focus {
  @apply outline-none;
}

.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden
         whitespace-nowrap border-0;
}

.not-sr-only {
  @apply static w-auto h-auto p-0 m-0 overflow-visible
         whitespace-normal;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ========================================
   DARK MODE
   ======================================== */
.dark {
  color-scheme: dark;
}

.dark .bg-bg-surface {
  @apply bg-gray-800;
}

.dark .bg-bg-muted {
  @apply bg-gray-700;
}

.dark .text-text-primary {
  @apply text-gray-100;
}

.dark .text-text-secondary {
  @apply text-gray-300;
}

.dark .text-text-muted {
  @apply text-gray-500;
}

.dark .border-border-default {
  @apply border-gray-700;
}

.dark .card {
  @apply bg-gray-800 border-gray-700;
}

.dark .data-table thead th {
  @apply bg-gray-700 text-gray-300 border-gray-600;
}

.dark .data-table tbody td {
  @apply border-gray-700 text-gray-200;
}

.dark .form-input,
.dark .form-select,
.dark .form-textarea {
  @apply bg-gray-700 border-gray-600 text-gray-100;
}

.dark .btn-secondary {
  @apply bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600;
}

.dark .btn-text {
  @apply text-gray-400 hover:text-gray-200 hover:bg-gray-700;
}

.dark .status-badge.active {
  @apply bg-green-900/50 text-green-400;
}

.dark .status-badge.inactive {
  @apply bg-gray-700 text-gray-400;
}

.dark .modal-overlay {
  @apply bg-black/60;
}

.dark .modal-content {
  @apply bg-gray-800 border-gray-700;
}
```

---

## Summary

This Tailwind configuration provides:

1. **Complete color palette** - Gray scale, brand colors, semantic colors
2. **Typography scale** - Font sizes, weights, letter spacing
3. **Spacing scale** - Consistent spacing throughout
4. **Component styles** - Buttons, forms, cards, tables, modals, badges, alerts
5. **Utility classes** - Layout, page patterns, form patterns
6. **Dark mode support** - Complete dark mode color overrides
7. **Accessibility styles** - Focus rings, screen reader support, reduced motion, high contrast

All styles follow Apple HIG principles with:
- Clean, minimal design
- Generous whitespace
- Subtle shadows and borders
- Smooth transitions
- Clear visual feedback
- Accessibility-first approach
