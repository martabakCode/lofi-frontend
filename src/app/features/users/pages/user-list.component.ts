import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RbacService } from '../../../core/services/rbac.service';
import { User, Role } from '../../../core/models/rbac.models';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-user-list',
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
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Users</h2>
          <p class="text-surface-500 dark:text-surface-400">Manage your team members and their roles.</p>
        </div>
        <button (click)="openNew()" class="btn-primary">
          <i class="pi pi-plus mr-2"></i> Add User
        </button>
      </header>

      <div class="card p-0 overflow-hidden">
        <p-table [value]="users()" [rows]="10" [paginator]="true" [loading]="isLoading()" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Name</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Roles</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-user>
            <tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold mr-3">
                    {{user.fullName?.charAt(0)}}
                  </div>
                  <div>
                    <div class="font-medium text-surface-900 dark:text-surface-0">{{user.fullName}}</div>
                    <div class="text-xs text-surface-500">{{user.email}}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span *ngFor="let role of user.roles" class="px-2 py-0.5 bg-accent-50 text-accent-700 dark:bg-accent-900/20 dark:text-accent-300 rounded text-xs font-semibold">
                    {{role.name}}
                  </span>
                  <span *ngIf="!user.roles?.length" class="text-surface-400 italic text-sm">No roles</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button (click)="editUser(user)" class="p-2 text-surface-400 hover:text-primary-500 transition-colors">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button (click)="deleteUser(user)" class="p-2 text-surface-400 hover:text-red-500 transition-colors">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [(visible)]="displayDialog" [header]="isEdit ? 'Edit User' : 'New User'" [modal]="true" class="p-fluid" [style]="{width: '500px'}">
      <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="space-y-4 pt-4">
        <div class="space-y-2">
          <label for="fullName" class="font-medium">Full Name</label>
          <input pInputText id="fullName" formControlName="fullName" placeholder="John Doe" />
        </div>
        <div class="space-y-2">
          <label for="username" class="font-medium">Username</label>
          <input pInputText id="username" formControlName="username" placeholder="johndoe" />
        </div>
        <div class="space-y-2">
          <label for="email" class="font-medium">Email</label>
          <input pInputText id="email" formControlName="email" placeholder="john@example.com" />
        </div>
        <div *ngIf="!isEdit" class="space-y-2">
          <label for="password" class="font-medium">Password</label>
          <input pInputText id="password" type="password" formControlName="password" placeholder="••••••••" />
        </div>
        <div class="space-y-2">
          <label for="roles" class="font-medium">Assign Roles</label>
          <p-multiSelect 
            [options]="allRoles()" 
            formControlName="roles" 
            optionLabel="name" 
            placeholder="Select Roles"
            display="chip"
            class="w-full">
          </p-multiSelect>
        </div>
        <div class="flex justify-end gap-3 pt-6 border-t border-surface-100">
          <p-button label="Cancel" icon="pi pi-times" styleClass="p-button-text" (onClick)="displayDialog = false"></p-button>
          <p-button label="Save" icon="pi pi-check" type="submit" [loading]="isSaving()" [disabled]="userForm.invalid"></p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class UserListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  users = signal<User[]>([]);
  allRoles = signal<Role[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = false;
  isEdit = false;
  selectedId: string | null = null;

  userForm = this.fb.group({
    username: ['', Validators.required],
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    roles: [[] as Role[]]
  });

  ngOnInit() {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.rbacService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadRoles() {
    this.rbacService.getRoles().subscribe({
      next: (data) => this.allRoles.set(data)
    });
  }

  openNew() {
    this.isEdit = false;
    this.selectedId = null;
    this.userForm.reset({ roles: [] });
    this.userForm.get('password')?.setValidators(Validators.required);
    this.displayDialog = true;
  }

  editUser(user: User) {
    this.isEdit = true;
    this.selectedId = user.id;
    this.userForm.get('password')?.clearValidators();
    this.userForm.patchValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles || []
    });
    this.displayDialog = true;
  }

  saveUser() {
    if (this.userForm.invalid) return;

    this.isSaving.set(true);
    const data = this.userForm.value as any;

    if (this.isEdit && this.selectedId) {
      delete data.password;
      this.rbacService.updateUser(this.selectedId, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadUsers();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'User updated'});
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.rbacService.createUser(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadUsers();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'User created'});
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Delete user ${user.fullName}?`)) {
      this.rbacService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'User removed'});
        }
      });
    }
  }
}
