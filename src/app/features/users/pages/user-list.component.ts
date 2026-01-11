import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { User } from '../../../core/models/rbac.models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule, TagModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users = signal<User[]>([]);
  loading = signal<boolean>(false);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    // Mocking for now
    setTimeout(() => {
      const mockUsers: User[] = [
        { id: 'U1', username: 'admin', fullName: 'Administrator', email: 'admin@lofi.com', roles: [{ id: 'R1', name: 'ADMIN', permissions: [] }], status: 'Active' },
        { id: 'U2', username: 'marketing1', fullName: 'Sarah Mark', email: 'sarah@lofi.com', roles: [{ id: 'R2', name: 'MARKETING', permissions: [] }], status: 'Active' },
      ];
      this.users.set(mockUsers);
      this.loading.set(false);
    }, 1000);
  }
}
