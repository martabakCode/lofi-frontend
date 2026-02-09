# Management System Fix Plan

## Issues Identified

Based on the codebase analysis, here are the issues and their fixes:

---

## 1. Product Management Issues

### Issues:
- **Products not showing**: The `ProductFacade.loadProducts()` is called but pagination/total items logic is incomplete
- **New Product 404**: Route exists but form component may have issues
- **Edit Product 404**: Route exists at `/products/:id/edit`
- **Detail Product is modal**: Currently using modal, needs to be converted to page

### Files Involved:
- `src/app/features/products/products.routes.ts` - Routes configuration
- `src/app/features/products/product-list/product-list.component.ts` - List logic
- `src/app/features/products/product-list/product-list.component.html` - List template
- `src/app/features/products/product-form/product-form.component.ts` - Form component
- `src/app/features/products/facades/product.facade.ts` - State management

### Fixes Required:
1. Fix product loading to properly set total items for pagination
2. Ensure product form component handles both create and edit modes correctly
3. **Convert Product Detail from Modal to Page**:
   - Create new `product-detail.component.ts` as a standalone page
   - Add route `/products/:id` for detail view
   - Update list component to navigate to detail page instead of opening modal
   - Remove detail modal from product-list.component.html

---

## 2. User Management Issues

### Issues:
- **Add User 404**: Route exists at `/users/new` but may have loading issues

### Files Involved:
- `src/app/features/users/users.routes.ts` - Routes configuration
- `src/app/features/users/pages/user-list.component.ts` - List component
- `src/app/features/users/pages/user-form/user-form.component.ts` - Form component

### Fixes Required:
1. Verify user form component loads correctly
2. Check that `routerLink="/users/new"` works properly
3. Ensure form component handles create mode without requiring user ID

---

## 3. Branch Management Issues

### Issues:
- **Branch Management not showing**: Data may not be loading properly
- **Add Branch is modal**: Currently uses modal, needs to be converted to page

### Files Involved:
- `src/app/features/branches/branches.routes.ts` - Routes configuration
- `src/app/features/branches/pages/branch-list.component.ts` - List component
- `src/app/features/branches/pages/branch-list.component.html` - List template

### Fixes Required:
1. Verify branch loading logic in `loadBranches()` method
2. **Convert Add/Edit Branch from Modal to Page**:
   - Create new `branch-form.component.ts` as standalone page
   - Add routes `/branches/new` and `/branches/:id/edit`
   - Update branch-list to navigate to form page instead of opening modal
   - Remove modal HTML from branch-list.component.html

---

## 4. Roles Management Issues

### Issues:
- **Roles not showing**: Data may not be loading properly
- **Manage Role error**: Possible service or permission issue
- **New Role is modal**: Currently uses modal, needs to be converted to page

### Files Involved:
- `src/app/features/roles/roles.routes.ts` - Routes configuration
- `src/app/features/roles/pages/role-list.component.ts` - List component
- `src/app/core/services/rbac.service.ts` - Service for roles

### Fixes Required:
1. Verify `loadRoles()` method and `rbacService.getRoles()` call
2. Check error handling in role list component
3. **Convert Add/Edit Role from Modal to Page**:
   - Create new `role-form.component.ts` as standalone page
   - Add routes `/roles/new` and `/roles/:id/edit`
   - Update role-list to navigate to form page instead of opening modal
   - Remove modal HTML from role-list.component.ts (inline template)

---

## Implementation Order

### Phase 1: Fix Data Loading Issues
1. Fix Product loading and pagination
2. Fix Branch loading
3. Fix Roles loading
4. Verify User loading

### Phase 2: Fix 404 Errors
1. Verify Product Form routes and component
2. Verify User Form routes and component
3. Test all navigation links

### Phase 3: Convert Modals to Pages
1. Create Product Detail Page
2. Create Branch Form Page (Add/Edit)
3. Create Role Form Page (Add/Edit)
4. Update list components to use navigation instead of modals

---

## New Components to Create

### 1. Product Detail Page
```
src/app/features/products/product-detail/
├── product-detail.component.ts
├── product-detail.component.html
└── product-detail.component.css
```

### 2. Branch Form Page
```
src/app/features/branches/pages/branch-form/
├── branch-form.component.ts
├── branch-form.component.html
└── branch-form.component.css
```

### 3. Role Form Page
```
src/app/features/roles/pages/role-form/
├── role-form.component.ts
├── role-form.component.html
└── role-form.component.css
```

---

## Route Updates Required

### Products Routes (`src/app/features/products/products.routes.ts`)
```typescript
export const PRODUCT_ROUTES: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'new', component: ProductFormComponent },
  { path: ':id', component: ProductDetailComponent },  // NEW: Detail page
  { path: ':id/edit', component: ProductFormComponent }
];
```

### Branches Routes (`src/app/features/branches/branches.routes.ts`)
```typescript
export const BRANCH_ROUTES: Routes = [
  { path: '', component: BranchListComponent },
  { path: 'new', component: BranchFormComponent },      // NEW: Add branch page
  { path: ':id/edit', component: BranchFormComponent }  // NEW: Edit branch page
];
```

### Roles Routes (`src/app/features/roles/roles.routes.ts`)
```typescript
export const ROLE_ROUTES: Routes = [
  { path: '', component: RoleListComponent },
  { path: 'new', component: RoleFormComponent },        // NEW: Add role page
  { path: ':id/edit', component: RoleFormComponent }    // NEW: Edit role page
];
```

---

## Detailed Action Items

### Product Management
- [ ] Fix `loadProducts()` to properly handle pagination
- [ ] Create `ProductDetailComponent` with route `/products/:id`
- [ ] Update product-list to navigate to detail page on view click
- [ ] Remove detail modal from product-list template
- [ ] Test New Product and Edit Product flows

### User Management
- [ ] Verify User form component works for create mode
- [ ] Test Add User navigation from list page
- [ ] Ensure proper error handling

### Branch Management
- [ ] Fix branch data loading if broken
- [ ] Create `BranchFormComponent` for add/edit
- [ ] Update routes to include `/branches/new` and `/branches/:id/edit`
- [ ] Update branch-list to use navigation instead of modals
- [ ] Remove modal code from branch-list

### Roles Management
- [ ] Fix roles data loading if broken
- [ ] Create `RoleFormComponent` for add/edit
- [ ] Update routes to include `/roles/new` and `/roles/:id/edit`
- [ ] Update role-list to use navigation instead of modals
- [ ] Remove modal code from role-list
