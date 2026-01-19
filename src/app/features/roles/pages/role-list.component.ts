import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RbacService } from '../../../core/services/rbac.service';
import { Role, Permission, UpdateRoleRequest, CreateRoleRequest } from '../../../core/models/rbac.models';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Roles</h2>
          <p class="text-slate-500 dark:text-slate-400">Manage user roles and their associated permissions.</p>
        </div>
        <button (click)="openNew()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <span class="mr-2">+</span> Add Role
        </button>
      </header>

      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4">Role Name</th>
                <th class="px-6 py-4">Permissions</th>
                <th class="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr *ngFor="let role of roles()" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4 font-medium text-slate-900 dark:text-white">{{role.name}}</td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span *ngFor="let perm of role.permissions" class="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-slate-600">
                      {{perm.name}}
                    </span>
                    <span *ngIf="!role.permissions || role.permissions.length === 0" class="text-slate-400 italic text-sm">No permissions</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button (click)="editRole(role)" class="p-1 px-2 text-primary-600 hover:bg-primary-50 rounded transition-colors" title="Edit">
                      Edit
                    </button>
                    <button (click)="deleteRole(role)" class="p-1 px-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="roles().length === 0 && !isLoading()">
                  <td colspan="3" class="px-6 py-8 text-center text-slate-500">No roles found.</td>
              </tr>
               <tr *ngIf="isLoading()">
                  <td colspan="3" class="px-6 py-8 text-center text-slate-500">Loading...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal/Dialog -->
    <div *ngIf="displayDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="displayDialog = false"></div>
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{isEdit ? 'Edit Role' : 'New Role'}}</h3>
            <button (click)="displayDialog = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <form [formGroup]="roleForm" (ngSubmit)="saveRole()" class="p-6 space-y-4">
            <div class="space-y-1">
                <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Role Name</label>
                <input id="name" formControlName="name" placeholder="ROLE_ADMIN" 
                    [readonly]="isEdit"
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-transparent" [class.bg-slate-100]="isEdit" />
            </div>

            <div class="space-y-1">
                <label for="description" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <input id="description" formControlName="description" placeholder="Role description..." 
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-transparent" />
            </div>

            <div class="space-y-2">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Assign Permissions</label>
                <div class="border border-slate-300 dark:border-slate-600 rounded-lg p-2 h-48 overflow-y-auto space-y-1">
                    <label *ngFor="let perm of allPermissions()" class="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer">
                        <input type="checkbox" 
                            [checked]="hasPermission(perm)" 
                            (change)="togglePermission(perm, $event)"
                            class="rounded border-slate-300 text-primary-600 focus:ring-primary-500">
                        <span class="text-sm text-slate-700 dark:text-slate-300">{{perm.name}}</span>
                    </label>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" (click)="displayDialog = false">Cancel</button>
                <button type="submit" 
                    [disabled]="roleForm.invalid || isSaving()"
                    class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                    <span *ngIf="isSaving()">...</span> Save
                </button>
            </div>
        </form>
      </div>
    </div>
  `
})
export class RoleListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private fb = inject(FormBuilder);

  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = false;
  isEdit = false;
  selectedId: string | null = null;

  roleForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    permissions: [[] as Permission[]]
  });

  ngOnInit() {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles() {
    this.isLoading.set(true);
    this.rbacService.getRoles().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadPermissions() {
    this.rbacService.getPermissions().subscribe({
      next: (data) => this.allPermissions.set(data)
    });
  }

  openNew() {
    this.isEdit = false;
    this.selectedId = null;
    this.roleForm.reset({ permissions: [] });
    this.displayDialog = true;
  }

  editRole(role: Role) {
    this.isEdit = true;
    this.selectedId = role.id;
    this.roleForm.patchValue({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    this.displayDialog = true;
  }

  hasPermission(perm: Permission): boolean {
    const currentPerms = this.roleForm.value.permissions as Permission[];
    return currentPerms?.some(p => p.id === perm.id) || false;
  }

  togglePermission(perm: Permission, event: any) {
    const checked = event.target.checked;
    const currentPerms = (this.roleForm.value.permissions as Permission[]) || [];

    let newPerms: Permission[];
    if (checked) {
      newPerms = [...currentPerms, perm];
    } else {
      newPerms = currentPerms.filter(p => p.id !== perm.id);
    }

    this.roleForm.patchValue({ permissions: newPerms });
  }

  saveRole() {
    if (this.roleForm.invalid) return;

    this.isSaving.set(true);
    const formValue = this.roleForm.value;
    const permissions = (formValue.permissions as Permission[]) || [];
    const permissionIds = permissions.map(p => p.id);

    if (this.isEdit && this.selectedId) {
      const updateData: UpdateRoleRequest = {
        description: formValue.description || undefined,
        permissionIds: permissionIds
      };
      this.rbacService.updateRole(this.selectedId, updateData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadRoles();
          // Toast or helper notification
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      const createData: CreateRoleRequest = {
        name: formValue.name || '',
        description: formValue.description || undefined,
        permissionIds: permissionIds
      };
      this.rbacService.createRole(createData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadRoles();
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  deleteRole(role: Role) {
    if (confirm(`Delete role ${role.name}?`)) {
      this.rbacService.deleteRole(role.id).subscribe({
        next: () => {
          this.loadRoles();
        }
      });
    }
  }
}
