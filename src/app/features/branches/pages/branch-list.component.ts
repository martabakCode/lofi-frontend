import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Branch } from '../../../core/models/rbac.models';
import { RbacService } from '../../../core/services/rbac.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css']
})
export class BranchListComponent implements OnInit {
  private rbacService = inject(RbacService);

  branches = signal<Branch[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadBranches();
  }

  loadBranches() {
    this.loading.set(true);
    this.error.set(null);
    this.rbacService.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load branches:', err);
        this.error.set('Failed to load branches. Please try again.');
        this.loading.set(false);
      }
    });
  }

  openCreateModal() {
    const name = prompt('Enter Branch Name:');
    if (!name) return;
    const address = prompt('Enter Address:');
    const city = prompt('Enter City:');
    const phone = prompt('Enter Phone:');

    this.rbacService.createBranch({
      name,
      address: address || '',
      city: city || '',
      phone: phone || '',
      state: 'ID',
      zipCode: '00000'
    }).subscribe({
      next: () => this.loadBranches(),
      error: () => alert('Failed to create branch')
    });
  }

  openEditModal(branch: Branch) {
    const name = prompt('Update Branch Name:', branch.name);
    if (!name) return;

    this.rbacService.updateBranch(branch.id, { ...branch, name }).subscribe({
      next: () => this.loadBranches(),
      error: () => alert('Failed to update branch')
    });
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.rbacService.deleteBranch(id).subscribe({
        next: () => this.loadBranches(),
        error: () => alert('Failed to delete branch')
      });
    }
  }
}
