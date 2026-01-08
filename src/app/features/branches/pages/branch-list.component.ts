import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RbacService } from '../../../core/services/rbac.service';
import { Branch } from '../../../core/models/rbac.models';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-branch-list',
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
          <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-0">Branches</h2>
          <p class="text-surface-500 dark:text-surface-400">Manage your physical branch locations.</p>
        </div>
        <button (click)="openNew()" class="btn-primary">
          <i class="pi pi-plus mr-2"></i> Add Branch
        </button>
      </header>

      <div class="card p-0 overflow-hidden">
        <p-table [value]="branches()" [rows]="10" [paginator]="true" [loading]="isLoading()" responsiveLayout="scroll">
          <ng-template pTemplate="header">
            <tr>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Name</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Address</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Phone</th>
              <th class="bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-300 font-semibold px-6 py-4">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-branch>
            <tr class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
              <td class="px-6 py-4 font-medium text-surface-900 dark:text-surface-0">{{branch.name}}</td>
              <td class="px-6 py-4 text-surface-600 dark:text-surface-400">
                {{branch.address}}, {{branch.city}}
              </td>
              <td class="px-6 py-4 text-surface-600 dark:text-surface-400">{{branch.phone}}</td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button (click)="editBranch(branch)" class="p-2 text-surface-400 hover:text-primary-500 transition-colors">
                    <i class="pi pi-pencil"></i>
                  </button>
                  <button (click)="deleteBranch(branch)" class="p-2 text-surface-400 hover:text-red-500 transition-colors">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="4" class="text-center p-8 text-surface-500">No branches found.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [(visible)]="displayDialog" [header]="isEdit ? 'Edit Branch' : 'New Branch'" [modal]="true" class="p-fluid" [style]="{width: '450px'}">
      <form [formGroup]="branchForm" (ngSubmit)="saveBranch()" class="space-y-4 pt-4">
        <div class="space-y-2">
          <label for="name" class="font-medium">Branch Name</label>
          <input pInputText id="name" formControlName="name" placeholder="Main HQ" />
        </div>
        <div class="space-y-2">
          <label for="address" class="font-medium">Address</label>
          <input pInputText id="address" formControlName="address" placeholder="123 Business St" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="city" class="font-medium">City</label>
            <input pInputText id="city" formControlName="city" placeholder="Jakarta" />
          </div>
          <div class="space-y-2">
            <label for="state" class="font-medium">State</label>
            <input pInputText id="state" formControlName="state" placeholder="DKI" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="zipCode" class="font-medium">Zip Code</label>
            <input pInputText id="zipCode" formControlName="zipCode" placeholder="10110" />
          </div>
          <div class="space-y-2">
            <label for="phone" class="font-medium">Phone</label>
            <input pInputText id="phone" formControlName="phone" placeholder="021-..." />
          </div>
        </div>
        <div class="flex justify-end gap-3 pt-6 border-t border-surface-100">
          <p-button label="Cancel" icon="pi pi-times" styleClass="p-button-text" (onClick)="displayDialog = false"></p-button>
          <p-button label="Save" icon="pi pi-check" type="submit" [loading]="isSaving()" [disabled]="branchForm.invalid"></p-button>
        </div>
      </form>
    </p-dialog>

    <p-toast></p-toast>
  `
})
export class BranchListComponent implements OnInit {
  private rbacService = inject(RbacService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  displayDialog = false;
  isEdit = false;
  selectedBranchId: string | null = null;

  branchForm = this.fb.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', Validators.required],
    phone: ['', Validators.required]
  });

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.isLoading.set(true);
    this.rbacService.getBranches().subscribe({
      next: (data) => {
        this.branches.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openNew() {
    this.isEdit = false;
    this.selectedBranchId = null;
    this.branchForm.reset();
    this.displayDialog = true;
  }

  editBranch(branch: Branch) {
    this.isEdit = true;
    this.selectedBranchId = branch.id;
    this.branchForm.patchValue(branch);
    this.displayDialog = true;
  }

  saveBranch() {
    if (this.branchForm.invalid) return;

    this.isSaving.set(true);
    const branchData = this.branchForm.value as Partial<Branch>;

    if (this.isEdit && this.selectedBranchId) {
      this.rbacService.updateBranch(this.selectedBranchId, branchData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadBranches();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Branch updated successfully'});
        },
        error: () => this.isSaving.set(false)
      });
    } else {
      this.rbacService.createBranch(branchData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.displayDialog = false;
          this.loadBranches();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Branch created successfully'});
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  deleteBranch(branch: Branch) {
    if (confirm(`Are you sure you want to delete ${branch.name}?`)) {
      this.rbacService.deleteBranch(branch.id).subscribe({
        next: () => {
          this.loadBranches();
          this.messageService.add({severity:'success', summary: 'Success', detail: 'Branch deleted successfully'});
        }
      });
    }
  }
}
