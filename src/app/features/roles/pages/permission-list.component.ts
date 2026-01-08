import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RbacService } from '../../../core/services/rbac.service';
import { Permission } from '../../../core/models/rbac.models';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-permission-list',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    DialogModule, 
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="space-y-6">
      <header class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Permissions</h2>
          <p class="text-surface-500 dark:text-surface-400">Define fine-grained access levels.</p>
        </div>
        <button (click)="openNew()" class="btn-primary">
          <i class="pi pi-plus mr-2"></i> Add Permission
        </button>
      </header>

      <div class="card p-0 overflow-hidden">
        <p-table [value]="permissions()" [rows]="10" [paginator]="true" [loading]="isLoading()" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Name</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Description</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-permission>
            <tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <td class="px-6 py-4">
                <span class="px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded text-xs font-mono font-bold uppercase">
                  {{permission.name}}
                </span>
              </td>
              <td class="px-6 py-4 text-surface-600 dark:text-surface-400">{{permission.description}}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button (click)="editPermission(permission)" class="p-2 text-surface-400 hover:text-primary-500 transition-colors">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button (click)="deletePermission(permission)" class="p-2 text-surface-400 hover:text-red-500 transition-colors">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [(visible)]="displayDialog" [header]="isEdit ? 'Edit Permission' : 'New Permission'" [modal]="true" class="p-fluid" [style]="{width: '450px'}">
      <form [formGroup]="permissionForm" (ngSubmit)="savePermission()" class="space-y-4 pt-4">
        <div class="space-y-2">
          <label for="name" class="font-medium">Permission Name</label>
          <input pInputText id="name" formControlName="name" placeholder="READ_USERS" />
          <small class="text-surface-500">Should be uppercase with underscores.</small>
        </div>
        <div class="space-y-2">
          <label for="description" class="font-medium">Description</label>
          <input pInputText id="description" formControlName="description" placeholder="Ability to view user list" />
        </div>
        <div class="flex justify-end gap-3 pt-6 border-t border-surface-100">
          <p-button label="Cancel" icon="pi pi-times" styleClass="p-button-text" (onClick)="displayDialog = false"></p-button>
          <p-button label="Save" icon="pi pi-check" type="submit" [loading]="isSaving()" [disabled]="permissionForm.invalid"></p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class PermissionListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

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
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Permission updated'});
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.rbacService.createPermission(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadPermissions();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Permission created'});
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
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Permission removed'});
        }
      });
    }
  }
}
