import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, PaginatedResponse, PaginationParams, toPaginatedResponse } from '../models/api.models';
import { Branch, Permission, Role, User, CreateRoleRequest, UpdateRoleRequest } from '../models/rbac.models';
import { environment } from '../../../environments/environment';

export interface UserFilterParams extends PaginationParams {
  role?: string;
  branch?: string;
  status?: string;
}

export interface BranchFilterParams extends PaginationParams {
  search?: string;
}

export interface PermissionFilterParams extends PaginationParams {
  search?: string;
}

export interface RoleFilterParams extends PaginationParams {
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  private buildParams(params: PaginationParams): HttpParams {
    let httpParams = new HttpParams();
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', (params.page - 1).toString());
    }
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('size', params.pageSize.toString());
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    return httpParams;
  }

  // Branches with pagination
  getBranches(params?: BranchFilterParams): Observable<{ items: Branch[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const httpParams = params ? this.buildParams(params) : new HttpParams();
    return this.http.get<ApiResponse<PaginatedResponse<Branch>>>(`${this.baseUrl}/rbac/branches`, { params: httpParams }).pipe(
      map(res => toPaginatedResponse(res.data))
    );
  }

  getAllBranches(): Observable<Branch[]> {
    // Use paginated endpoint with large pageSize instead of non-existent /all endpoint
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/rbac/branches`, {
      params: new HttpParams().set('size', '1000')
    }).pipe(
      map(res => {
        if (Array.isArray(res.data)) return res.data;
        return res.data?.items || res.data?.content || [];
      })
    );
  }

  getBranchById(id: string): Observable<Branch> {
    return this.http.get<ApiResponse<Branch>>(`${this.baseUrl}/rbac/branches/${id}`).pipe(
      map(res => res.data)
    );
  }

  createBranch(branch: Partial<Branch>): Observable<Branch> {
    return this.http.post<ApiResponse<Branch>>(`${this.baseUrl}/rbac/branches`, branch).pipe(map(res => res.data));
  }

  updateBranch(id: string, branch: Partial<Branch>): Observable<Branch> {
    return this.http.put<ApiResponse<Branch>>(`${this.baseUrl}/rbac/branches/${id}`, branch).pipe(map(res => res.data));
  }

  deleteBranch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rbac/branches/${id}`);
  }

  // Get staff by branch
  getBranchStaff(branchId: string): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/rbac/branches/${branchId}/staff`).pipe(
      map(res => res.data)
    );
  }

  // Assign staff to branch
  assignStaffToBranch(branchId: string, userId: string, role: 'BRANCH_MANAGER' | 'MARKETING'): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/rbac/branches/${branchId}/assign-staff`, { userId, role });
  }

  // Remove staff from branch
  removeStaffFromBranch(branchId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rbac/branches/${branchId}/remove-staff/${userId}`);
  }

  // Permissions with pagination
  getPermissions(params?: PermissionFilterParams): Observable<{ items: Permission[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const httpParams = params ? this.buildParams(params) : new HttpParams();
    return this.http.get<ApiResponse<PaginatedResponse<Permission>>>(`${this.baseUrl}/rbac/permissions`, { params: httpParams }).pipe(
      map(res => toPaginatedResponse(res.data))
    );
  }

  getAllPermissions(): Observable<Permission[]> {
    // Use paginated endpoint with large pageSize instead of non-existent /all endpoint
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/rbac/permissions`, {
      params: new HttpParams().set('size', '1000')
    }).pipe(
      map(res => {
        if (Array.isArray(res.data)) return res.data;
        return res.data?.items || res.data?.content || [];
      })
    );
  }

  createPermission(permission: Partial<Permission>): Observable<Permission> {
    return this.http.post<ApiResponse<Permission>>(`${this.baseUrl}/rbac/permissions`, permission).pipe(map(res => res.data));
  }

  updatePermission(id: string, permission: Partial<Permission>): Observable<Permission> {
    return this.http.put<ApiResponse<Permission>>(`${this.baseUrl}/rbac/permissions/${id}`, permission).pipe(map(res => res.data));
  }

  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rbac/permissions/${id}`);
  }

  // Roles with pagination
  getRoles(params?: RoleFilterParams): Observable<{ items: Role[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const httpParams = params ? this.buildParams(params) : new HttpParams();
    return this.http.get<ApiResponse<PaginatedResponse<Role>>>(`${this.baseUrl}/rbac/roles`, { params: httpParams }).pipe(
      map(res => toPaginatedResponse(res.data))
    );
  }

  getAllRoles(): Observable<Role[]> {
    // Use paginated endpoint with large pageSize instead of non-existent /all endpoint
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/rbac/roles`, {
      params: new HttpParams().set('size', '1000')
    }).pipe(
      map(res => {
        if (Array.isArray(res.data)) return res.data;
        return res.data?.items || res.data?.content || [];
      })
    );
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<ApiResponse<Role>>(`${this.baseUrl}/rbac/roles/${id}`).pipe(map(res => res.data));
  }

  createRole(role: CreateRoleRequest): Observable<Role> {
    return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/rbac/roles`, role).pipe(map(res => res.data));
  }

  updateRole(id: string, role: UpdateRoleRequest): Observable<Role> {
    return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/rbac/roles/${id}`, role).pipe(map(res => res.data));
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rbac/roles/${id}`);
  }

  // Users Management with pagination
  getUsers(params?: UserFilterParams): Observable<{ items: User[]; total: number; page: number; pageSize: number; totalPages: number }> {
    let httpParams = this.buildParams(params || {});

    if (params?.role) {
      httpParams = httpParams.set('role', params.role);
    }
    if (params?.branch) {
      httpParams = httpParams.set('branch', params.branch);
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }

    return this.http.get<ApiResponse<PaginatedResponse<User>>>(`${this.baseUrl}/rbac/users`, { params: httpParams }).pipe(
      map(res => toPaginatedResponse(res.data))
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/rbac/users/${id}`).pipe(map(res => res.data));
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/rbac/users`, user).pipe(map(res => res.data));
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/rbac/users/${id}`, user).pipe(map(res => res.data));
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rbac/users/${id}`);
  }
}
