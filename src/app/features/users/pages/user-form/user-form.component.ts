import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../../core/services/rbac.service';
import { ToastService } from '../../../../core/services/toast.service';
import { User, Branch, Role } from '../../../../core/models/rbac.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  private rbacService = inject(RbacService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State signals
  isEditMode = signal(false);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  userId = signal<string | null>(null);

  // Data signals
  branches = signal<Branch[]>([]);
  roles = signal<Role[]>([]);
  selectedRoles = signal<string[]>([]);

  // Form
  userForm = this.fb.group({
    fullName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    status: ['Active'],
    branchId: ['']
  });

  ngOnInit() {
    this.loadFilters();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(id);
      this.loadUser(id);
    }
  }

  loadFilters() {
    forkJoin({
      branches: this.rbacService.getAllBranches(),
      roles: this.rbacService.getAllRoles()
    }).subscribe({
      next: (data) => {
        this.branches.set(data.branches);
        this.roles.set(data.roles);
      },
      error: () => {
        this.toastService.show('Failed to load filter data', 'error');
      }
    });
  }

  loadUser(id: string) {
    this.isSubmitting.set(true);
    this.rbacService.getUserById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          phone: user.phone || '',
          status: user.status || 'Active',
          branchId: user.branch?.id || ''
        });
        this.selectedRoles.set(user.roles?.map(r => typeof r === 'string' ? r : r.id) || []);
        this.isSubmitting.set(false);
      },
      error: () => {
        this.toastService.show('Failed to load user', 'error');
        this.isSubmitting.set(false);
        this.router.navigate(['/users']);
      }
    });
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoles().includes(roleId);
  }

  toggleRole(roleId: string) {
    const current = this.selectedRoles();
    if (current.includes(roleId)) {
      this.selectedRoles.set(current.filter(id => id !== roleId));
    } else {
      this.selectedRoles.set([...current, roleId]);
    }
  }

  getRoleDisplayName(role: Role): string {
    return role.name.replace('ROLE_', '').replace('_', ' ');
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.userForm.getRawValue();
    const userData: Partial<User> = {
      fullName: formValue.fullName!,
      username: formValue.username!,
      email: formValue.email!,
      phone: formValue.phone || undefined,
      status: formValue.status as 'Active' | 'Inactive',
      branch: formValue.branchId ? { id: formValue.branchId } as Branch : undefined,
      roles: this.selectedRoles().map(id => ({ id }) as Role)
    };

    if (this.isEditMode() && this.userId()) {
      this.rbacService.updateUser(this.userId()!, userData).subscribe({
        next: () => {
          this.toastService.show('User updated successfully', 'success');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err.error?.message || 'Failed to update user');
          this.toastService.show('Failed to update user', 'error');
        }
      });
    } else {
      this.rbacService.createUser(userData).subscribe({
        next: () => {
          this.toastService.show('User created successfully', 'success');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err.error?.message || 'Failed to create user');
          this.toastService.show('Failed to create user', 'error');
        }
      });
    }
  }
}
