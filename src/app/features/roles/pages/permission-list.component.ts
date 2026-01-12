import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white">Permissions</h2>
          <p class="text-slate-500 dark:text-slate-400">Define fine-grained access levels.</p>
        </div>
        <button (click)="openNew()" class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <span class="mr-2">+</span> Add Permission
        </button>
      </header>

      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4">Name</th>
                <th class="px-6 py-4">Description</th>
                <th class="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr *ngFor="let permission of permissions()" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-6 py-4">
                  <span class="px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded text-xs font-mono font-bold uppercase">
                    {{permission.name}}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{{permission.description}}</td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button (click)="editPermission(permission)" class="p-1 px-2 text-primary-600 hover:bg-primary-50 rounded transition-colors" title="Edit">
                      Edit
                    </button>
                    <button (click)="deletePermission(permission)" class="p-1 px-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="permissions().length === 0 && !isLoading()">
                  <td colspan="3" class="px-6 py-8 text-center text-slate-500">No permissions found.</td>
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
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-md z-10 overflow-hidden border border-slate-200 dark:border-slate-700">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{isEdit ? 'Edit Permission' : 'New Permission'}}</h3>
            <button (click)="displayDialog = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <form [formGroup]="permissionForm" (ngSubmit)="savePermission()" class="p-6 space-y-4">
            <div class="space-y-1">
                <label for="name" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Permission Name</label>
                <input id="name" formControlName="name" placeholder="READ_USERS" 
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-transparent" />
                <p class="text-xs text-slate-500">Should be uppercase with underscores.</p>
            </div>

            <div class="space-y-1">
                <label for="description" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <input id="description" formControlName="description" placeholder="Ability to view user list" 
                    class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-transparent" />
            </div>

            <div class="flex justify-end gap-3 pt-4">
                <button type="button" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" (click)="displayDialog = false">Cancel</button>
                <button type="submit" 
                    [disabled]="permissionForm.invalid || isSaving()"
                    class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                    <span *ngIf="isSaving()">...</span> Save
                </button>
            </div>
        </form>
      </div>
    </div>
  `
})
export class PermissionListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private fb = inject(FormBuilder);

  permissions = signal<Permission[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = false;
  isEdit = false;
  selectedId: string | null = null;

  permissionForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[A-Z_]+$/)]],
    description: ['', Validators.required]
  });

  ngOnInit() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.isLoading.set(true);
    this.rbacService.getPermissions().subscribe({
      next: (data) => {
        this.permissions.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openNew() {
    this.isEdit = false;
    this.selectedId = null;
    this.permissionForm.reset();
    this.displayDialog = true;
  }

  editPermission(permission: Permission) {
    this.isEdit = true;
    this.selectedId = permission.id;
    this.permissionForm.patchValue(permission);
    this.displayDialog = true;
  }

  savePermission() {
    if (this.permissionForm.invalid) return;

    this.isSaving.set(true);
    const data = this.permissionForm.value as Partial<Permission>;

    if (this.isEdit && this.selectedId) {
      this.rbacService.updatePermission(this.selectedId, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadPermissions();
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.rbacService.createPermission(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadPermissions();
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  deletePermission(permission: Permission) {
    if (confirm(`Delete permission ${permission.name}?`)) {
      this.rbacService.deletePermission(permission.id).subscribe({
        next: () => {
          this.loadPermissions();
        }
      });
    }
  }
}
