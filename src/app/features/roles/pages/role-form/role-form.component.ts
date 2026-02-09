import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../../core/services/rbac.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Role, Permission, UpdateRoleRequest, CreateRoleRequest } from '../../../../core/models/rbac.models';

@Component({
    selector: 'app-role-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './role-form.component.html',
    styleUrls: ['./role-form.component.css']
})
export class RoleFormComponent implements OnInit {
    private rbacService = inject(RbacService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    // State signals
    isEditMode = signal(false);
    isSubmitting = signal(false);
    error = signal<string | null>(null);
    roleId = signal<string | null>(null);

    // Data signals
    allPermissions = signal<Permission[]>([]);
    selectedPermissions = signal<Permission[]>([]);

    // Form
    roleForm = this.fb.group({
        name: ['', Validators.required],
        description: ['']
    });

    ngOnInit() {
        this.loadPermissions();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.roleId.set(id);
            this.loadRole(id);
        }
    }

    loadPermissions() {
        this.rbacService.getAllPermissions().subscribe({
            next: (data) => this.allPermissions.set(data),
            error: () => this.toastService.show('Failed to load permissions', 'error')
        });
    }

    loadRole(id: string) {
        this.isSubmitting.set(true);
        this.rbacService.getRoleById(id).subscribe({
            next: (role) => {
                this.roleForm.patchValue({
                    name: role.name,
                    description: role.description || ''
                });
                this.selectedPermissions.set(role.permissions || []);
                this.isSubmitting.set(false);
            },
            error: () => {
                this.toastService.show('Failed to load role', 'error');
                this.isSubmitting.set(false);
                this.router.navigate(['/dashboard/roles']);
            }
        });
    }

    hasPermission(perm: any): boolean {
        const permId = typeof perm === 'string' ? perm : perm.id || perm.name;
        return this.selectedPermissions().some(p => {
            const pId = typeof p === 'string' ? p : p.id || p.name;
            return pId === permId;
        });
    }

    togglePermission(perm: any) {
        const current = this.selectedPermissions();
        const permId = typeof perm === 'string' ? perm : perm.id || perm.name;

        if (this.hasPermission(perm)) {
            this.selectedPermissions.set(current.filter(p => {
                const pId = typeof p === 'string' ? p : p.id || p.name;
                return pId !== permId;
            }));
        } else {
            this.selectedPermissions.set([...current, perm]);
        }
    }

    onSubmit() {
        if (this.roleForm.invalid) {
            this.roleForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);
        this.error.set(null);

        const formValue = this.roleForm.value;
        const permissionIds = this.selectedPermissions().map(p => p.id);

        if (this.isEditMode() && this.roleId()) {
            const updateData: UpdateRoleRequest = {
                description: formValue.description || undefined,
                permissionIds: permissionIds
            };
            this.rbacService.updateRole(this.roleId()!, updateData).subscribe({
                next: () => {
                    this.toastService.show('Role updated successfully', 'success');
                    this.router.navigate(['/dashboard/roles']);
                },
                error: (err) => {
                    this.isSubmitting.set(false);
                    this.error.set(err.error?.message || 'Failed to update role');
                    this.toastService.show('Failed to update role', 'error');
                }
            });
        } else {
            const createData: CreateRoleRequest = {
                name: formValue.name || '',
                description: formValue.description || undefined,
                permissionIds: permissionIds
            };
            this.rbacService.createRole(createData).subscribe({
                next: () => {
                    this.toastService.show('Role created successfully', 'success');
                    this.router.navigate(['/dashboard/roles']);
                },
                error: (err) => {
                    this.isSubmitting.set(false);
                    this.error.set(err.error?.message || 'Failed to create role');
                    this.toastService.show('Failed to create role', 'error');
                }
            });
        }
    }

    goBack() {
        this.router.navigate(['/dashboard/roles']);
    }
}
