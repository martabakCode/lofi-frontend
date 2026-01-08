import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RbacService } from '../../../core/services/rbac.service';
import { Role, Permission } from '../../../core/models/rbac.models';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    DialogModule, 
    MultiSelectModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Roles</h2>
          <p class="text-surface-500 dark:text-surface-400">Manage user roles and their associated permissions.</p>
        </div>
        <button (click)="openNew()" class="btn-primary">
          <i class="pi pi-plus mr-2"></i> Add Role
        </button>
      </header>

      <div class="card p-0 overflow-hidden">
        <p-table [value]="roles()" [rows]="10" [paginator]="true" [loading]="isLoading()" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Role Name</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Permissions</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-role>
            <tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <td class="px-6 py-4 font-medium text-surface-900 dark:text-surface-0">{{role.name}}</td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span *ngFor="let perm of role.permissions" class="px-2 py-0.5 bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400 rounded text-xs font-medium">
                    {{perm.name}}
                  </span>
                  <span *ngIf="!role.permissions?.length" class="text-surface-400 italic text-sm">No permissions</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button (click)="editRole(role)" class="p-2 text-surface-400 hover:text-primary-500 transition-colors">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button (click)="deleteRole(role)" class="p-2 text-surface-400 hover:text-red-500 transition-colors">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [(visible)]="displayDialog" [header]="isEdit ? 'Edit Role' : 'New Role'" [modal]="true" class="p-fluid" [style]="{width: '500px'}">
      <form [formGroup]="roleForm" (ngSubmit)="saveRole()" class="space-y-4 pt-4">
        <div class="space-y-2">
          <label for="name" class="font-medium">Role Name</label>
          <input pInputText id="name" formControlName="name" placeholder="ROLE_ADMIN" />
        </div>
        <div class="space-y-2">
          <label for="permissions" class="font-medium">Assign Permissions</label>
          <p-multiSelect 
            [options]="allPermissions()" 
            formControlName="permissions" 
            optionLabel="name" 
            placeholder="Select Permissions"
            display="chip"
            class="w-full">
          </p-multiSelect>
        </div>
        <div class="flex justify-end gap-3 pt-6 border-t border-surface-100">
          <p-button label="Cancel" icon="pi pi-times" styleClass="p-button-text" (onClick)="displayDialog = false"></p-button>
          <p-button label="Save" icon="pi pi-check" type="submit" [loading]="isSaving()" [disabled]="roleForm.invalid"></p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class RoleListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  roles = signal<Role[]>([]);
  allPermissions = signal<Permission[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = false;
  isEdit = false;
  selectedId: string | null = null;

  roleForm = this.fb.group({
    name: ['', Validators.required],
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
      permissions: role.permissions || []
    });
    this.displayDialog = true;
  }

  saveRole() {
    if (this.roleForm.invalid) return;

    this.isSaving.set(true);
    const data = this.roleForm.value as Partial<Role>;

    if (this.isEdit && this.selectedId) {
      this.rbacService.updateRole(this.selectedId, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadRoles();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Role updated'});
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.rbacService.createRole(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadRoles();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Role created'});
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
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Role removed'});
        }
      });
    }
  }
}
