# Apple HIG Component Specifications

## Table of Contents
1. [New Components](#new-components)
2. [Page Patterns](#page-patterns)

---

## New Components

### 1. Empty State Component

#### Purpose
Display a friendly message when there's no data to show, with an optional call-to-action.

#### Component Interface

```typescript
// empty-state.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent {
  @Input() icon: string = 'pi-inbox';
  @Input() title: string = 'No data yet';
  @Input() message: string = 'Create your first item to get started';
  @Input() actionText?: string;
  @Input() actionIcon?: string = 'pi-plus';
  @Output() actionClick = new EventEmitter<void>();
}
```

#### Template

```html
<!-- empty-state.component.html -->
<div class="empty-state">
  <div class="empty-state-icon">
    <i [class]="icon"></i>
  </div>
  <h3 class="empty-state-title">{{ title }}</h3>
  <p class="empty-state-message">{{ message }}</p>
  <button *ngIf="actionText" class="btn-primary" (click)="actionClick.emit()">
    <i [class]="actionIcon" class="mr-2"></i>
    {{ actionText }}
  </button>
</div>
```

#### Styles

```css
/* empty-state.component.css */
.empty-state {
  @apply flex flex-col items-center justify-center py-20 px-4;
}

.empty-state-icon {
  @apply w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-6;
}

.empty-state-icon i {
  @apply text-4xl text-gray-400;
}

.empty-state-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.empty-state-message {
  @apply text-gray-600 text-center max-w-md mb-6;
}
```

#### Usage Examples

```html
<!-- Basic empty state -->
<app-empty-state></app-empty-state>

<!-- With custom message -->
<app-empty-state
  title="No products found"
  message="Try adjusting your filters or create a new product">
</app-empty-state>

<!-- With action button -->
<app-empty-state
  title="No branches yet"
  message="Create your first branch location"
  actionText="Add Branch"
  (actionClick)="navigateToCreate()">
</app-empty-state>

<!-- Custom icon -->
<app-empty-state
  icon="pi-users"
  title="No users found"
  message="No users match your search criteria">
</app-empty-state>
```

#### Variants

| Variant | Icon | Title | Message | Action |
|---------|------|-------|---------|--------|
| No Data | `pi-inbox` | No data yet | Create your first item to get started | Create Item |
| No Results | `pi-search` | No results found | Try adjusting your filters | Clear Filters |
| No Selection | `pi-hand-pointer` | Nothing selected | Select an item to view details | - |
| Error | `pi-exclamation-triangle` | Something went wrong | Please try again later | Retry |

---

### 2. Skeleton Loader Component

#### Purpose
Display a shimmering placeholder while content is loading, providing better UX than a spinner.

#### Component Interface

```typescript
// skeleton-loader.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.css']
})
export class SkeletonLoaderComponent {
  @Input() type: 'text' | 'avatar' | 'card' | 'table' | 'custom' = 'text';
  @Input() width?: string;
  @Input() height?: string;
  @Input() count: number = 1;
  @Input() rows?: number; // For table type
}
```

#### Template

```html
<!-- skeleton-loader.component.html -->
<ng-container [ngSwitch]="type">
  <!-- Text Skeleton -->
  <div *ngSwitchCase="'text'" class="skeleton-text" [style.width]="width" [style.height]="height"></div>

  <!-- Avatar Skeleton -->
  <div *ngSwitchCase="'avatar'" class="skeleton-avatar" [style.width]="width || '40px'" [style.height]="height || '40px'"></div>

  <!-- Card Skeleton -->
  <div *ngSwitchCase="'card'" class="skeleton-card">
    <div class="skeleton-header"></div>
    <div class="skeleton-body">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line"></div>
    </div>
  </div>

  <!-- Table Skeleton -->
  <div *ngSwitchCase="'table'" class="skeleton-table">
    <div class="skeleton-table-header">
      <div class="skeleton-cell" *ngFor="let _ of [1,2,3,4,5]"></div>
    </div>
    <div class="skeleton-table-body">
      <div class="skeleton-table-row" *ngFor="let _ of [].constructor(rows || 5)">
        <div class="skeleton-cell" *ngFor="let _ of [1,2,3,4,5]"></div>
      </div>
    </div>
  </div>

  <!-- Multiple Text Skeletons -->
  <ng-container *ngSwitchDefault>
    <div class="skeleton-text" *ngFor="let _ of [].constructor(count)"
      [style.width]="width"
      [style.height]="height">
    </div>
  </ng-container>
</ng-container>
```

#### Styles

```css
/* skeleton-loader.component.css */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton-text,
.skeleton-avatar,
.skeleton-cell,
.skeleton-line,
.skeleton-header {
  background: linear-gradient(
    90deg,
    #f3f4f6 0%,
    #e5e7eb 50%,
    #f3f4f6 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.375rem;
}

.skeleton-text {
  height: 1rem;
  width: 100%;
}

.skeleton-avatar {
  border-radius: 50%;
}

.skeleton-card {
  @apply bg-white border border-gray-200 rounded-xl p-6;
}

.skeleton-header {
  @apply h-8 w-1/3 mb-4;
}

.skeleton-body {
  @apply space-y-3;
}

.skeleton-line {
  @apply h-4 w-full;
}

.skeleton-line.short {
  @apply w-2/3;
}

.skeleton-table {
  @apply w-full;
}

.skeleton-table-header {
  @apply flex gap-4 pb-3 border-b border-gray-200;
}

.skeleton-table-body {
  @apply space-y-3 pt-3;
}

.skeleton-table-row {
  @apply flex gap-4;
}

.skeleton-cell {
  @apply h-10 flex-1;
}
```

#### Usage Examples

```html
<!-- Text skeleton -->
<app-skeleton-loader type="text" width="200px" height="20px"></app-skeleton-loader>

<!-- Multiple text lines -->
<app-skeleton-loader type="text" count="3"></app-skeleton-loader>

<!-- Avatar skeleton -->
<app-skeleton-loader type="avatar" width="48px" height="48px"></app-skeleton-loader>

<!-- Card skeleton -->
<app-skeleton-loader type="card"></app-skeleton-loader>

<!-- Table skeleton -->
<app-skeleton-loader type="table" [rows]="5"></app-skeleton-loader>

<!-- Custom dimensions -->
<app-skeleton-loader type="text" width="150px" height="24px"></app-skeleton-loader>
```

#### Integration with List Pages

```html
<!-- In product-list.component.html -->
<tbody>
  <!-- Loading State -->
  <tr *ngIf="loading()">
    <td colspan="7">
      <app-skeleton-loader type="table" [rows]="5"></app-skeleton-loader>
    </td>
  </tr>

  <!-- Data Rows -->
  <tr *ngFor="let product of filteredProducts()">
    <!-- ... -->
  </tr>
</tbody>
```

---

### 3. Action Modal Component

#### Purpose
Display a modal for actions (Approve, Reject, Request Revision) with an optional comment field for audit trail.

#### Component Interface

```typescript
// action-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface ActionConfig {
  type: 'approve' | 'reject' | 'revision' | 'custom';
  title: string;
  message?: string;
  confirmLabel: string;
  confirmClass?: string;
  icon?: string;
}

@Component({
  selector: 'app-action-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './action-modal.component.html',
  styleUrls: ['./action-modal.component.css']
})
export class ActionModalComponent {
  @Input() isOpen = false;
  @Input() config: ActionConfig;
  @Input() showComment = true;
  @Input() commentPlaceholder = 'Add a comment (optional)';
  @Input() commentRequired = false;

  @Output() confirm = new EventEmitter<{ comment: string }>();
  @Output() close = new EventEmitter<void>();

  comment = '';
  isSubmitting = false;

  get isValid(): boolean {
    if (this.commentRequired && !this.comment.trim()) {
      return false;
    }
    return true;
  }

  onConfirm() {
    if (!this.isValid) return;
    this.isSubmitting = true;
    this.confirm.emit({ comment: this.comment.trim() });
  }

  onClose() {
    this.comment = '';
    this.isSubmitting = false;
    this.close.emit();
  }
}
```

#### Template

```html
<!-- action-modal.component.html -->
<div *ngIf="isOpen" class="modal-overlay" (click)="onClose()">
  <div class="modal-content" (click)="$event.stopPropagation()">
    <!-- Header -->
    <div class="modal-header">
      <div class="modal-icon" [ngClass]="config.type">
        <i [class]="config.icon || getIconForType(config.type)"></i>
      </div>
      <h2 class="modal-title">{{ config.title }}</h2>
      <p *ngIf="config.message" class="modal-message">{{ config.message }}</p>
    </div>

    <!-- Comment Section -->
    <div *ngIf="showComment" class="modal-body">
      <label class="form-label">
        Comment
        <span *ngIf="commentRequired" class="text-red-500">*</span>
      </label>
      <textarea
        [(ngModel)]="comment"
        [placeholder]="commentPlaceholder"
        rows="3"
        class="form-textarea"
        [class.border-red-500]="commentRequired && !comment.trim() && isSubmitting">
      </textarea>
      <p *ngIf="commentRequired && !comment.trim() && isSubmitting" class="form-error">
        Comment is required
      </p>
    </div>

    <!-- Actions -->
    <div class="modal-footer">
      <button class="btn-text" (click)="onClose()" [disabled]="isSubmitting">
        Cancel
      </button>
      <button
        class="btn-primary"
        [ngClass]="config.confirmClass"
        (click)="onConfirm()"
        [disabled]="isSubmitting || !isValid">
        <i *ngIf="isSubmitting" class="pi pi-spin pi-spinner mr-2"></i>
        {{ config.confirmLabel }}
      </button>
    </div>
  </div>
</div>
```

#### Styles

```css
/* action-modal.component.css */
.modal-overlay {
  @apply fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4;
}

.modal-content {
  @apply bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md;
}

.modal-header {
  @apply p-6 pb-4;
}

.modal-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center mb-4;
}

.modal-icon.approve {
  @apply bg-green-100;
}

.modal-icon.approve i {
  @apply text-green-600 text-xl;
}

.modal-icon.reject {
  @apply bg-red-100;
}

.modal-icon.reject i {
  @apply text-red-600 text-xl;
}

.modal-icon.revision {
  @apply bg-yellow-100;
}

.modal-icon.revision i {
  @apply text-yellow-600 text-xl;
}

.modal-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.modal-message {
  @apply text-gray-600 text-sm;
}

.modal-body {
  @apply px-6 pb-4;
}

.modal-footer {
  @apply px-6 py-4 border-t border-gray-200 flex justify-end gap-3;
}
```

#### Usage Examples

```typescript
// In component.ts
actionConfig: ActionConfig = {
  type: 'approve',
  title: 'Approve Product',
  message: 'Are you sure you want to approve this product?',
  confirmLabel: 'Approve',
  icon: 'pi-check'
};

isActionModalOpen = false;

openActionModal(type: 'approve' | 'reject' | 'revision') {
  const configs = {
    approve: {
      type: 'approve' as const,
      title: 'Approve Product',
      message: 'This product will be available for use.',
      confirmLabel: 'Approve',
      icon: 'pi-check'
    },
    reject: {
      type: 'reject' as const,
      title: 'Reject Product',
      message: 'This action cannot be undone.',
      confirmLabel: 'Reject',
      confirmClass: 'bg-red-500 hover:bg-red-600',
      icon: 'pi-times'
    },
    revision: {
      type: 'revision' as const,
      title: 'Request Revision',
      message: 'The product will be sent back for changes.',
      confirmLabel: 'Request Revision',
      icon: 'pi-refresh'
    }
  };
  this.actionConfig = configs[type];
  this.isActionModalOpen = true;
}

onActionConfirm(data: { comment: string }) {
  this.productService.updateStatus(this.productId, this.actionConfig.type, data.comment)
    .subscribe(() => {
      this.toastService.show('Action completed successfully', 'success');
      this.isActionModalOpen = false;
      this.loadActivity();
    });
}
```

```html
<!-- In component.html -->
<app-action-modal
  [isOpen]="isActionModalOpen"
  [config]="actionConfig"
  [showComment]="true"
  [commentRequired]="false"
  (confirm)="onActionConfirm($event)"
  (close)="isActionModalOpen = false">
</app-action-modal>
```

---

### 4. Activity Timeline Component

#### Purpose
Display a vertical timeline of activities, comments, and actions with timestamps.

#### Component Interface

```typescript
// activity-timeline.component.ts
import { Component, Input } from '@angular/core';

export interface TimelineItem {
  id: string;
  type: 'created' | 'updated' | 'approved' | 'rejected' | 'revision' | 'comment' | 'custom';
  title: string;
  description?: string;
  comment?: string;
  actor?: string;
  actorAvatar?: string;
  timestamp: Date | string;
  icon?: string;
  iconClass?: string;
}

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './activity-timeline.component.html',
  styleUrls: ['./activity-timeline.component.css']
})
export class ActivityTimelineComponent {
  @Input() items: TimelineItem[] = [];
  @Input() showActor = true;
  @Input() showTimestamp = true;
  @Input() compact = false;

  getIconForType(type: string): string {
    const icons = {
      created: 'pi-plus',
      updated: 'pi-pencil',
      approved: 'pi-check',
      rejected: 'pi-times',
      revision: 'pi-refresh',
      comment: 'pi-comment',
      custom: 'pi-info-circle'
    };
    return icons[type] || icons.custom;
  }

  getIconClassForType(type: string): string {
    const classes = {
      created: 'bg-blue-100 text-blue-600',
      updated: 'bg-gray-100 text-gray-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
      revision: 'bg-yellow-100 text-yellow-600',
      comment: 'bg-purple-100 text-purple-600',
      custom: 'bg-gray-100 text-gray-600'
    };
    return classes[type] || classes.custom;
  }

  getRelativeTime(timestamp: Date | string): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }
}
```

#### Template

```html
<!-- activity-timeline.component.html -->
<div class="activity-timeline" [class.compact]="compact">
  <div *ngFor="let item of items; trackBy: trackById" class="timeline-item">
    <!-- Icon -->
    <div class="timeline-icon" [ngClass]="item.iconClass || getIconClassForType(item.type)">
      <i [class]="item.icon || getIconForType(item.type)"></i>
    </div>

    <!-- Content -->
    <div class="timeline-content">
      <!-- Header -->
      <div class="timeline-header">
        <h4 class="timeline-title">{{ item.title }}</h4>
        <span *ngIf="showTimestamp" class="timeline-time">
          {{ getRelativeTime(item.timestamp) }}
        </span>
      </div>

      <!-- Actor -->
      <div *ngIf="showActor && item.actor" class="timeline-actor">
        <span class="actor-name">{{ item.actor }}</span>
      </div>

      <!-- Description -->
      <p *ngIf="item.description" class="timeline-description">
        {{ item.description }}
      </p>

      <!-- Comment -->
      <div *ngIf="item.comment" class="timeline-comment">
        <p class="comment-text">"{{ item.comment }}"</p>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div *ngIf="items.length === 0" class="timeline-empty">
    <i class="pi pi-history text-2xl text-gray-300"></i>
    <p class="text-gray-500 text-sm">No activity yet</p>
  </div>
</div>
```

#### Styles

```css
/* activity-timeline.component.css */
.activity-timeline {
  @apply space-y-4;
}

.activity-timeline.compact {
  @apply space-y-3;
}

.timeline-item {
  @apply flex gap-3;
}

.timeline-icon {
  @apply w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0;
}

.timeline-icon i {
  @apply text-sm;
}

.timeline-content {
  @apply flex-1 min-w-0;
}

.timeline-header {
  @apply flex items-start justify-between gap-2;
}

.timeline-title {
  @apply text-sm font-medium text-gray-900 m-0;
}

.timeline-time {
  @apply text-xs text-gray-400 whitespace-nowrap;
}

.timeline-actor {
  @apply mt-0.5;
}

.actor-name {
  @apply text-sm text-gray-600;
}

.timeline-description {
  @apply text-sm text-gray-600 mt-1 m-0;
}

.timeline-comment {
  @apply mt-2 p-3 bg-gray-50 rounded-lg;
}

.comment-text {
  @apply text-sm text-gray-700 italic m-0;
}

.timeline-empty {
  @apply flex flex-col items-center justify-center py-8 text-center;
}
```

#### Usage Examples

```typescript
// In component.ts
activities = signal<TimelineItem[]>([
  {
    id: '1',
    type: 'approved',
    title: 'Approved by Admin',
    actor: 'John Doe',
    comment: 'Looks good, ready to go.',
    timestamp: new Date(Date.now() - 7200000) // 2 hours ago
  },
  {
    id: '2',
    type: 'updated',
    title: 'Updated interest rate',
    actor: 'Jane Smith',
    description: 'Changed from 12% to 11.5%',
    timestamp: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: '3',
    type: 'created',
    title: 'Product created',
    actor: 'Mike Johnson',
    timestamp: new Date(Date.now() - 172800000) // 2 days ago
  }
]);
```

```html
<!-- In component.html -->
<h3 class="text-lg font-semibold text-gray-900 mb-4">Activity</h3>
<app-activity-timeline [items]="activities()"></app-activity-timeline>

<!-- Compact version -->
<app-activity-timeline [items]="activities()" [compact]="true"></app-activity-timeline>

<!-- Without actor -->
<app-activity-timeline [items]="activities()" [showActor]="false"></app-activity-timeline>
```

---

### 5. Unsaved Changes Guard Directive

#### Purpose
Prevent users from navigating away when they have unsaved changes in a form.

#### Directive Interface

```typescript
// unsaved-changes-guard.directive.ts
import { Directive, inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
  hasUnsavedChanges: () => boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate
) => {
  if (component.hasUnsavedChanges()) {
    return confirm(
      'You have unsaved changes. Are you sure you want to leave? ' +
      'Your changes will be lost.'
    );
  }
  return true;
};

@Directive({
  selector: '[appUnsavedChangesGuard]'
})
export class UnsavedChangesGuardDirective {
  // This directive can be used to mark components that use the guard
  constructor() {
    console.log('Unsaved changes guard active');
  }
}
```

#### Usage in Component

```typescript
// In form component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CanComponentDeactivate } from '../../../shared/directives/unsaved-changes-guard.directive';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  standalone: true
})
export class ProductFormComponent implements CanComponentDeactivate {
  private fb = inject(FormBuilder);
  form: FormGroup;
  originalValues: any;

  ngOnInit() {
    this.form = this.fb.group({
      name: [''],
      code: [''],
      interestRate: [0]
    });

    // Store original values
    this.originalValues = this.form.value;
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.form.value) !== JSON.stringify(this.originalValues);
  }

  onSubmit() {
    if (this.form.valid) {
      // Save logic
      this.originalValues = { ...this.form.value };
    }
  }
}
```

#### Usage in Routes

```typescript
// In routes file
import { unsavedChangesGuard } from '../../../shared/directives/unsaved-changes-guard.directive';

export const PRODUCT_ROUTES: Routes = [
  { path: '', component: ProductListComponent },
  {
    path: 'new',
    component: ProductFormComponent,
    canDeactivate: [unsavedChangesGuard]
  },
  {
    path: ':id/edit',
    component: ProductFormComponent,
    canDeactivate: [unsavedChangesGuard]
  }
];
```

---

### 6. Autosave Indicator Component

#### Purpose
Display a visual indicator when form data is automatically saved.

#### Component Interface

```typescript
// autosave-indicator.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-autosave-indicator',
  standalone: true,
  templateUrl: './autosave-indicator.component.html',
  styleUrls: ['./autosave-indicator.component.css']
})
export class AutosaveIndicatorComponent {
  @Input() status: 'saving' | 'saved' | 'error' | 'unsaved' = 'unsaved';
  @Input() lastSaved?: Date;

  get statusText(): string {
    const texts = {
      saving: 'Saving...',
      saved: 'Saved just now',
      error: 'Failed to save',
      unsaved: 'Unsaved changes'
    };
    return texts[this.status];
  }

  get statusIcon(): string {
    const icons = {
      saving: 'pi-spin pi-spinner',
      saved: 'pi-check',
      error: 'pi-exclamation-triangle',
      unsaved: 'pi-pencil'
    };
    return icons[this.status];
  }

  get statusClass(): string {
    const classes = {
      saving: 'text-blue-600',
      saved: 'text-green-600',
      error: 'text-red-600',
      unsaved: 'text-gray-600'
    };
    return classes[this.status];
  }
}
```

#### Template

```html
<!-- autosave-indicator.component.html -->
<div class="autosave-indicator">
  <i [class]="statusIcon" [ngClass]="statusClass"></i>
  <span class="autosave-text" [ngClass]="statusClass">{{ statusText }}</span>
  <span *ngIf="lastSaved && status === 'saved'" class="autosave-time">
    {{ getRelativeTime(lastSaved) }}
  </span>
</div>
```

#### Styles

```css
/* autosave-indicator.component.css */
.autosave-indicator {
  @apply flex items-center gap-2 text-sm;
}

.autosave-text {
  @apply font-medium;
}

.autosave-time {
  @apply text-gray-400;
}
```

#### Usage Examples

```typescript
// In form component.ts
autosaveStatus = signal<'saving' | 'saved' | 'error' | 'unsaved'>('unsaved');
lastSaved = signal<Date | undefined>(undefined);

// Trigger autosave
onFormChange() {
  this.autosaveStatus.set('saving');
  this.autosaveService.saveDraft(this.form.value).subscribe({
    next: () => {
      this.autosaveStatus.set('saved');
      this.lastSaved.set(new Date());
      setTimeout(() => {
        if (this.autosaveStatus() === 'saved') {
          this.autosaveStatus.set('unsaved');
        }
      }, 3000);
    },
    error: () => {
      this.autosaveStatus.set('error');
    }
  });
}
```

```html
<!-- In form component.html -->
<div class="flex justify-between items-center mb-4">
  <h1 class="text-2xl font-bold">Edit Product</h1>
  <app-autosave-indicator
    [status]="autosaveStatus()"
    [lastSaved]="lastSaved()">
  </app-autosave-indicator>
</div>
```

---

## Page Patterns

### 1. List Page Pattern

#### Complete Template Structure

```html
<div class="list-page">
  <!-- Header Section -->
  <div class="list-header">
    <div class="header-left">
      <div class="page-icon">
        <i class="pi pi-box text-2xl"></i>
      </div>
      <div>
        <h1 class="page-title">Product Management</h1>
        <p class="page-subtitle">Configure and manage loan products</p>
      </div>
    </div>
    <div class="header-actions">
      <button class="btn-secondary" (click)="exportData()">
        <i class="pi pi-download"></i>
      </button>
      <a routerLink="/dashboard/products/new" class="btn-primary">
        <i class="pi pi-plus mr-2"></i> New Product
      </a>
      <button class="btn-secondary" (click)="refreshData()">
        <i class="pi pi-refresh" [class.pi-spin]="loading()"></i>
      </button>
    </div>
  </div>

  <!-- Stats Cards (Optional) -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon active">
        <i class="pi pi-check-circle"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ activeCount() }}</span>
        <span class="stat-label">Active</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon inactive">
        <i class="pi pi-times-circle"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ inactiveCount() }}</span>
        <span class="stat-label">Inactive</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon total">
        <i class="pi pi-database"></i>
      </div>
      <div class="stat-content">
        <span class="stat-value">{{ totalCount() }}</span>
        <span class="stat-label">Total</span>
      </div>
    </div>
  </div>

  <!-- Search and Filters -->
  <div class="filter-bar">
    <div class="search-input">
      <i class="pi pi-search"></i>
      <input
        type="text"
        placeholder="Search products..."
        (input)="onSearch($event)"
        [value]="searchQuery()">
    </div>
    <div class="filter-controls">
      <select
        [ngModel]="selectedFilter()"
        (ngModelChange)="onFilterChange($event)"
        class="form-select">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button
        *ngIf="hasActiveFilters()"
        (click)="clearFilters()"
        class="btn-text">
        <i class="pi pi-times mr-1"></i> Clear
      </button>
    </div>
  </div>

  <!-- Error State -->
  <div *ngIf="error()" class="error-alert">
    <i class="pi pi-exclamation-triangle"></i>
    <span>{{ error() }}</span>
    <button class="btn-link" (click)="loadData()">Try Again</button>
  </div>

  <!-- Table Card -->
  <div class="table-card">
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>
              <app-sortable-header
                field="name"
                [sortField]="sortField()"
                [sortDirection]="sortDirection()"
                (sort)="onSort($event)">
                Product
              </app-sortable-header>
            </th>
            <th>Amount Range</th>
            <th>Tenure</th>
            <th>Interest Rate</th>
            <th>Status</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr *ngIf="loading()">
            <td colspan="6">
              <app-skeleton-loader type="table" [rows]="5"></app-skeleton-loader>
            </td>
          </tr>

          <!-- Empty State -->
          <tr *ngIf="!loading() && items().length === 0 && !error()">
            <td colspan="6">
              <app-empty-state
                [title]="hasActiveFilters() ? 'No results found' : 'No products yet'"
                [message]="hasActiveFilters() ? 'Try adjusting your filters' : 'Create your first product to get started'"
                [actionText]="!hasActiveFilters() ? 'Add Product' : undefined"
                (actionClick)="navigateToCreate()">
              </app-empty-state>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr *ngFor="let item of items()" class="data-row">
            <td>
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-code">{{ item.code }}</span>
              </div>
            </td>
            <td>{{ item.amountRange }}</td>
            <td>{{ item.tenure }}</td>
            <td>{{ item.interestRate }}%</td>
            <td>
              <span class="status-badge" [class.active]="item.isActive">
                {{ item.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="actions-cell">
              <a [routerLink]="['/dashboard/products', item.id]" class="btn-action view">
                <i class="pi pi-eye"></i>
              </a>
              <a [routerLink]="['/dashboard/products', item.id, 'edit']" class="btn-action edit">
                <i class="pi pi-pencil"></i>
              </a>
              <button class="btn-action delete" (click)="confirmDelete(item)">
                <i class="pi pi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <app-pagination
      [currentPageValue]="currentPage()"
      [pageSizeValue]="pageSize()"
      [totalItemsValue]="totalItems()"
      (pageChange)="onPageChange($event)"
      (pageSizeChange)="onPageSizeChange($event)">
    </app-pagination>
  </div>
</div>
```

#### Component Logic

```typescript
export class ProductListComponent {
  // State
  items = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Search & Filter
  searchQuery = signal('');
  selectedFilter = signal('');
  private searchSubject = new Subject<string>();

  // Sorting
  sortField = signal('name');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);

  constructor() {
    // Setup search debounce (300ms)
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadData();
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);
    this.service.getItems({
      page: this.currentPage(),
      pageSize: this.pageSize(),
      search: this.searchQuery(),
      filter: this.selectedFilter(),
      sortField: this.sortField(),
      sortDirection: this.sortDirection()
    }).subscribe({
      next: (response) => {
        this.items.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products');
        this.loading.set(false);
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onFilterChange(filter: string) {
    this.selectedFilter.set(filter);
    this.currentPage.set(1);
    this.loadData();
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedFilter.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  onSort(config: SortConfig) {
    this.sortField.set(config.field);
    this.sortDirection.set(config.direction);
    this.loadData();
  }

  hasActiveFilters() {
    return this.searchQuery() || this.selectedFilter();
  }

  // Computed stats
  activeCount = computed(() => this.items().filter(i => i.isActive).length);
  inactiveCount = computed(() => this.items().filter(i => !i.isActive).length);
  totalCount = computed(() => this.items().length);
}
```

---

### 2. Create Page Pattern

#### Complete Template Structure

```html
<div class="create-page">
  <!-- Header -->
  <div class="page-header">
    <button (click)="goBack()" class="back-button">
      <i class="pi pi-arrow-left"></i>
    </button>
    <div>
      <h1 class="page-title">Create Product</h1>
      <p class="page-subtitle">Add a new loan product to the system</p>
    </div>
  </div>

  <!-- Autosave Indicator (Optional) -->
  <div class="autosave-container">
    <app-autosave-indicator
      [status]="autosaveStatus()"
      [lastSaved]="lastSaved()">
    </app-autosave-indicator>
  </div>

  <!-- Form Card -->
  <div class="card form-card">
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="form-body">
        <!-- Section: Basic Information -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="pi pi-info-circle"></i>
            Basic Information
          </h3>

          <div class="form-field">
            <label class="form-label">
              Product Name <span class="required">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="form-input"
              placeholder="Enter product name"
              (blur)="onFieldBlur('name')">
            <p *ngIf="showFieldError('name')" class="form-error">
              Product name is required
            </p>
            <p class="form-helper">A descriptive name for the loan product</p>
          </div>

          <div class="form-field">
            <label class="form-label">
              Product Code <span class="required">*</span>
            </label>
            <input
              type="text"
              formControlName="code"
              class="form-input"
              placeholder="e.g., LOAN_001"
              (blur)="onFieldBlur('code')">
            <p *ngIf="showFieldError('code')" class="form-error">
              Product code is required
            </p>
            <p class="form-helper">Unique identifier for the product</p>
          </div>

          <div class="form-field">
            <label class="form-label">Description</label>
            <textarea
              formControlName="description"
              class="form-textarea"
              rows="3"
              placeholder="Enter product description">
            </textarea>
            <p class="form-helper">Optional description of the product</p>
          </div>
        </div>

        <hr class="form-divider">

        <!-- Section: Loan Configuration -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="pi pi-cog"></i>
            Loan Configuration
          </h3>

          <div class="form-row">
            <div class="form-field">
              <label class="form-label">
                Min Amount <span class="required">*</span>
              </label>
              <input
                type="number"
                formControlName="minAmount"
                class="form-input"
                placeholder="0"
                (blur)="onFieldBlur('minAmount')">
              <p *ngIf="showFieldError('minAmount')" class="form-error">
                Minimum amount is required
              </p>
            </div>

            <div class="form-field">
              <label class="form-label">
                Max Amount <span class="required">*</span>
              </label>
              <input
                type="number"
                formControlName="maxAmount"
                class="form-input"
                placeholder="0"
                (blur)="onFieldBlur('maxAmount')">
              <p *ngIf="showFieldError('maxAmount')" class="form-error">
                Maximum amount is required
              </p>
            </div>
          </div>

          <div class="form-row">
            <div class="form-field">
              <label class="form-label">
                Min Tenure (months) <span class="required">*</span>
              </label>
              <input
                type="number"
                formControlName="minTenor"
                class="form-input"
                placeholder="0"
                (blur)="onFieldBlur('minTenor')">
              <p *ngIf="showFieldError('minTenor')" class="form-error">
                Minimum tenure is required
              </p>
            </div>

            <div class="form-field">
              <label class="form-label">
                Max Tenure (months) <span class="required">*</span>
              </label>
              <input
                type="number"
                formControlName="maxTenor"
                class="form-input"
                placeholder="0"
                (blur)="onFieldBlur('maxTenor')">
              <p *ngIf="showFieldError('maxTenor')" class="form-error">
                Maximum tenure is required
              </p>
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">
              Interest Rate (%) <span class="required">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              formControlName="interestRate"
              class="form-input"
              placeholder="0.0"
              (blur)="onFieldBlur('interestRate')">
            <p *ngIf="showFieldError('interestRate')" class="form-error">
              Interest rate is required
            </p>
            <p class="form-helper">Annual interest rate percentage</p>
          </div>

          <div class="form-field">
            <label class="form-label">Admin Fee</label>
            <input
              type="number"
              formControlName="adminFee"
              class="form-input"
              placeholder="0">
            <p class="form-helper">Optional administrative fee</p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error()" class="error-alert">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ error() }}</span>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" (click)="goBack()" class="btn-text">
          Cancel
        </button>
        <button
          type="submit"
          [disabled]="isSubmitting() || form.invalid"
          class="btn-primary">
          <i *ngIf="isSubmitting()" class="pi pi-spin pi-spinner mr-2"></i>
          Create Product
        </button>
      </div>
    </form>
  </div>
</div>
```

#### Component Logic

```typescript
export class ProductFormComponent implements CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private service = inject(ProductService);
  private toast = inject(ToastService);

  form: FormGroup;
  isEditMode = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  originalValues: any;

  // Autosave
  autosaveStatus = signal<'saving' | 'saved' | 'error' | 'unsaved'>('unsaved');
  lastSaved = signal<Date | undefined>(undefined);
  private autosaveTimer?: any;

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
    this.setupAutosave();
  }

  initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      code: ['', [Validators.required]],
      description: [''],
      minAmount: [0, [Validators.required, Validators.min(0)]],
      maxAmount: [0, [Validators.required, Validators.min(0)]],
      minTenor: [0, [Validators.required, Validators.min(1)]],
      maxTenor: [0, [Validators.required, Validators.min(1)]],
      interestRate: [0, [Validators.required, Validators.min(0)]],
      adminFee: [0]
    });

    this.originalValues = { ...this.form.value };
  }

  checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loadProduct(id);
    }
  }

  loadProduct(id: string) {
    this.service.getProduct(id).subscribe({
      next: (product) => {
        this.form.patchValue(product);
        this.originalValues = { ...product };
      },
      error: () => {
        this.error.set('Failed to load product');
      }
    });
  }

  setupAutosave() {
    this.form.valueChanges.pipe(
      debounceTime(2000),
      takeUntilDestroyed()
    ).subscribe(() => {
      if (this.form.valid && this.hasUnsavedChanges()) {
        this.autosaveDraft();
      }
    });
  }

  autosaveDraft() {
    this.autosaveStatus.set('saving');
    this.service.saveDraft(this.form.value).subscribe({
      next: () => {
        this.autosaveStatus.set('saved');
        this.lastSaved.set(new Date());
        setTimeout(() => {
          if (this.autosaveStatus() === 'saved') {
            this.autosaveStatus.set('unsaved');
          }
        }, 3000);
      },
      error: () => {
        this.autosaveStatus.set('error');
      }
    });
  }

  onFieldBlur(fieldName: string) {
    const control = this.form.get(fieldName);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity();
    }
  }

  showFieldError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const action$ = this.isEditMode()
      ? this.service.updateProduct(this.route.snapshot.paramMap.get('id')!, this.form.value)
      : this.service.createProduct(this.form.value);

    action$.subscribe({
      next: () => {
        this.toast.show(
          this.isEditMode() ? 'Product updated successfully' : 'Product created successfully',
          'success'
        );
        this.originalValues = { ...this.form.value };
        this.router.navigate(['/dashboard/products']);
      },
      error: (err) => {
        this.error.set('Failed to save product');
        this.isSubmitting.set(false);
      }
    });
  }

  hasUnsavedChanges(): boolean {
    return JSON.stringify(this.form.value) !== JSON.stringify(this.originalValues);
  }

  goBack() {
    this.router.navigate(['/dashboard/products']);
  }
}
```

---

### 3. Update Page Pattern

The Update page follows the same structure as the Create page with these additions:

#### Additional Header Elements

```html
<!-- In page header, add last updated info -->
<div class="page-header">
  <button (click)="goBack()" class="back-button">
    <i class="pi pi-arrow-left"></i>
  </button>
  <div class="flex-1">
    <h1 class="page-title">Edit Product</h1>
    <p class="page-subtitle">Update product details and settings</p>
  </div>
  <div *ngIf="lastUpdated()" class="last-updated">
    <i class="pi pi-clock"></i>
    <span>Last updated {{ getRelativeTime(lastUpdated()) }}</span>
  </div>
</div>
```

#### Additional Action Buttons

```html
<!-- In form actions -->
<div class="form-actions">
  <button type="button" (click)="resetForm()" class="btn-text">
    <i class="pi pi-refresh mr-2"></i>Reset
  </button>
  <button type="button" (click)="goBack()" class="btn-text">
    Cancel
  </button>
  <button
    type="submit"
    [disabled]="isSubmitting() || form.invalid"
    class="btn-primary">
    <i *ngIf="isSubmitting()" class="pi pi-spin pi-spinner mr-2"></i>
    Save Changes
  </button>
</div>
```

#### Additional Component Logic

```typescript
// Add to component
lastUpdated = signal<Date | undefined>(undefined);

loadProduct(id: string) {
  this.service.getProduct(id).subscribe({
    next: (product) => {
      this.form.patchValue(product);
      this.originalValues = { ...product };
      this.lastUpdated.set(product.updatedAt);
    },
    error: () => {
      this.error.set('Failed to load product');
    }
  });
}

resetForm() {
  if (confirm('Are you sure you want to reset all changes?')) {
    this.form.patchValue(this.originalValues);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
```

---

### 4. Detail Page Pattern

#### Complete Template Structure

```html
<div class="detail-page">
  <!-- Header -->
  <div class="page-header">
    <button (click)="goBack()" class="back-button">
      <i class="pi pi-arrow-left"></i>
    </button>
    <div class="flex-1">
      <h1 class="page-title">{{ item()?.name }}</h1>
      <p class="page-subtitle">{{ item()?.code }}</p>
    </div>
    <span class="status-badge" [class.active]="item()?.isActive">
      {{ item()?.isActive ? 'Active' : 'Inactive' }}
    </span>
  </div>

  <!-- Loading State -->
  <div *ngIf="loading()" class="card">
    <div class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-brand-main"></i>
      <p class="ml-3 text-gray-600">Loading...</p>
    </div>
  </div>

  <!-- Error State -->
  <div *ngIf="error()" class="error-alert">
    <i class="pi pi-exclamation-triangle"></i>
    <span>{{ error() }}</span>
    <button class="btn-link" (click)="loadItem()">Try Again</button>
  </div>

  <!-- Content -->
  <div *ngIf="item() && !loading()" class="detail-content">
    <!-- Action Buttons -->
    <div class="action-bar">
      <button
        *ngIf="canApprove()"
        class="btn-primary"
        (click)="openActionModal('approve')">
        <i class="pi pi-check mr-2"></i>Approve
      </button>
      <button
        *ngIf="canRequestRevision()"
        class="btn-secondary"
        (click)="openActionModal('revision')">
        <i class="pi pi-refresh mr-2"></i>Request Revision
      </button>
      <button
        *ngIf="canReject()"
        class="btn-destructive"
        (click)="openActionModal('reject')">
        <i class="pi pi-times mr-2"></i>Reject
      </button>
      <button class="btn-secondary" (click)="editItem()">
        <i class="pi pi-pencil mr-2"></i>Edit
      </button>
    </div>

    <!-- Info Sections -->
    <div class="info-grid">
      <!-- Basic Info -->
      <div class="info-card">
        <h3 class="info-card-title">
          <i class="pi pi-info-circle"></i>
          Basic Information
        </h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">Product Name</span>
            <span class="info-value">{{ item()?.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Product Code</span>
            <span class="info-value">{{ item()?.code }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Status</span>
            <span class="info-value">
              <span class="status-badge" [class.active]="item()?.isActive">
                {{ item()?.isActive ? 'Active' : 'Inactive' }}
              </span>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">Description</span>
            <span class="info-value">{{ item()?.description || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- Loan Configuration -->
      <div class="info-card">
        <h3 class="info-card-title">
          <i class="pi pi-cog"></i>
          Loan Configuration
        </h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">Min Amount</span>
            <span class="info-value">{{ item()?.minAmount | currency:'IDR':'symbol-narrow':'1.0-0' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Max Amount</span>
            <span class="info-value">{{ item()?.maxAmount | currency:'IDR':'symbol-narrow':'1.0-0' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Min Tenure</span>
            <span class="info-value">{{ item()?.minTenor }} months</span>
          </div>
          <div class="info-item">
            <span class="info-label">Max Tenure</span>
            <span class="info-value">{{ item()?.maxTenor }} months</span>
          </div>
          <div class="info-item">
            <span class="info-label">Interest Rate</span>
            <span class="info-value">{{ item()?.interestRate }}% p.a.</span>
          </div>
          <div class="info-item">
            <span class="info-label">Admin Fee</span>
            <span class="info-value">{{ item()?.adminFee | currency:'IDR':'symbol-narrow':'1.0-0' }}</span>
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div class="info-card">
        <h3 class="info-card-title">
          <i class="pi pi-clock"></i>
          Metadata
        </h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">Created</span>
            <span class="info-value">{{ item()?.createdAt | date:'medium' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Last Updated</span>
            <span class="info-value">{{ item()?.updatedAt | date:'medium' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Created By</span>
            <span class="info-value">{{ item()?.createdBy || '-' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Timeline -->
    <div class="activity-section">
      <h3 class="section-title">
        <i class="pi pi-history"></i>
        Activity
      </h3>
      <app-activity-timeline [items]="activities()"></app-activity-timeline>
    </div>
  </div>
</div>

<!-- Action Modal -->
<app-action-modal
  [isOpen]="isActionModalOpen"
  [config]="actionConfig"
  [showComment]="true"
  (confirm)="onActionConfirm($event)"
  (close)="isActionModalOpen = false">
</app-action-modal>
```

#### Component Logic

```typescript
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProductService);
  private toast = inject(ToastService);

  item = signal<Product | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  activities = signal<TimelineItem[]>([]);

  // Action Modal
  isActionModalOpen = false;
  actionConfig: ActionConfig;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadItem(id);
      this.loadActivities(id);
    }
  }

  loadItem(id: string) {
    this.loading.set(true);
    this.service.getProduct(id).subscribe({
      next: (product) => {
        this.item.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load product');
        this.loading.set(false);
      }
    });
  }

  loadActivities(id: string) {
    this.service.getActivities(id).subscribe({
      next: (activities) => {
        this.activities.set(activities);
      }
    });
  }

  canApprove(): boolean {
    return this.item()?.status === 'pending';
  }

  canRequestRevision(): boolean {
    return this.item()?.status === 'pending' || this.item()?.status === 'approved';
  }

  canReject(): boolean {
    return this.item()?.status === 'pending';
  }

  openActionModal(type: 'approve' | 'reject' | 'revision') {
    const configs = {
      approve: {
        type: 'approve' as const,
        title: 'Approve Product',
        message: 'This product will be available for use.',
        confirmLabel: 'Approve',
        icon: 'pi-check'
      },
      reject: {
        type: 'reject' as const,
        title: 'Reject Product',
        message: 'This action cannot be undone.',
        confirmLabel: 'Reject',
        confirmClass: 'bg-red-500 hover:bg-red-600',
        icon: 'pi-times'
      },
      revision: {
        type: 'revision' as const,
        title: 'Request Revision',
        message: 'The product will be sent back for changes.',
        confirmLabel: 'Request Revision',
        icon: 'pi-refresh'
      }
    };
    this.actionConfig = configs[type];
    this.isActionModalOpen = true;
  }

  onActionConfirm(data: { comment: string }) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.service.updateStatus(id, this.actionConfig.type, data.comment).subscribe({
      next: () => {
        this.toast.show('Action completed successfully', 'success');
        this.isActionModalOpen = false;
        this.loadItem(id);
        this.loadActivities(id);
      },
      error: () => {
        this.toast.show('Failed to complete action', 'error');
      }
    });
  }

  editItem() {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/dashboard/products', id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/dashboard/products']);
  }
}
```

---

## Summary

This document provides detailed specifications for:

### New Components (6)
1. **Empty State** - Friendly no-data message with optional CTA
2. **Skeleton Loader** - Shimmer effect for loading states
3. **Action Modal** - Modal for actions with optional comments
4. **Activity Timeline** - Vertical timeline for activities
5. **Unsaved Changes Guard** - Prevent navigation with unsaved changes
6. **Autosave Indicator** - Visual feedback for autosave status

### Page Patterns (4)
1. **List Page** - Search, filter, sort, pagination, empty states
2. **Create Page** - Single column form with inline validation
3. **Update Page** - Create page + last updated + reset + guard
4. **Detail Page** - Read-only info + action buttons + timeline

All components follow Apple HIG principles with:
- Clean layouts and generous whitespace
- Subtle shadows and borders
- Smooth transitions
- Clear visual feedback
- Accessibility considerations
