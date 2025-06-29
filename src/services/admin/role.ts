import type { CreateRoleRequest, Role, RoleResponse, RoleWithPermissions, UpdateRoleRequest } from '@/types/roleType';
import instance from '../instance';

const BASE_URL = '/role';

export const apiGetRoles = async (params?: { page?: number; size?: number; search?: string }) => {
  return instance.get<RoleResponse>(BASE_URL, { params });
};

export const apiGetRoleById = async (id: string) => {
  return instance.get<RoleWithPermissions>(`${BASE_URL}/${id}`);
};

export const apiCreateRole = async (role: CreateRoleRequest) => {
  return instance.post<Role>(BASE_URL, role);
};

export const apiUpdateRole = async (id: string, data: UpdateRoleRequest) => {
  return instance.patch<Role>(`${BASE_URL}/${id}`, data);
};

export const apiDeleteRole = async (id: string) => {
  return instance.delete(`${BASE_URL}/${id}`);
};

export const apiGetDefaultRoles = async () => {
  return instance.get<Role[]>(`${BASE_URL}/defaults`);
};
