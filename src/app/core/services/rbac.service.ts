import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from '../models/api.models';
import { Branch, Permission, Role, User } from '../models/rbac.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  // Branches
  getBranches(): Observable<Branch[]> {
    return this.http.get<ApiResponse<Branch[]>>(`${this.baseUrl}/branches`).pipe(map(res => res.data));
  }

  createBranch(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<ApiResponse<Branch>>(`${this.baseUrl}/branches`, branch).pipe(map(res => res.data));
  }

  updateBranch(id: string, branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<ApiResponse<Branch>>(`${this.baseUrl}/branches/${id}`, branch).pipe(map(res => res.data));
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/branches/${id}`);
  }

  // Permissions
  getPermissions(): Observable<Permission[]> {
    return this.http.get<ApiResponse<Permission[]>>(`${this.baseUrl}/permissions`).pipe(map(res => res.data));
  }

  createPermission(permission: Partial<Permission>): Observable<Permission> {
    return this.http.post<ApiResponse<Permission>>(`${this.baseUrl}/permissions`, permission).pipe(map(res => res.data));
  }

  updatePermission(id: string, permission: Partial<Permission>): Observable<Permission> {
    return this.http.put<ApiResponse<Permission>>(`${this.baseUrl}/permissions/${id}`, permission).pipe(map(res => res.data));
  }

  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/permissions/${id}`);
  }

  // Roles
  getRoles(): Observable<Role[]> {
    return this.http.get<ApiResponse<Role[]>>(`${this.baseUrl}/roles`).pipe(map(res => res.data));
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/roles/${id}`).pipe(map(res => res.data));
  }

  createRole(role: Partial<Role>): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/roles`, role).pipe(map(res => res.data));
  }

  updateRole(id: string, role: Partial<Role>): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/roles/${id}`, role).pipe(map(res => res.data));
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/roles/${id}`);
  }

  // Users Management
  getUsers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users`).pipe(map(res => res.data));
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/${id}`).pipe(map(res => res.data));
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/users`, user).pipe(map(res => res.data));
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/${id}`, user).pipe(map(res => res.data));
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }
}
