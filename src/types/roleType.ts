import type { IPermission } from './permissionType';

export interface Role {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_system?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  permissions?: IPermission[];
}

export interface CreateRoleRequest {
  name: string;
  code: string;
  description?: string;
  is_system?: boolean;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  is_system?: boolean;
  is_active?: boolean;
}

export interface RoleResponse {
  data: Role[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
}

export interface RoleWithPermissions extends Role {
  permissions: IPermission[];
}

export const DEFAULT_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export type DefaultRoleType = (typeof DEFAULT_ROLES)[keyof typeof DEFAULT_ROLES];
