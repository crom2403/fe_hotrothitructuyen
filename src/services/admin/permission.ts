import type { AssignPermissionRequest, CreatePermissionRequest, IPermission, PermissionResponse } from '@/types/permissionType';
import instance from '../instance';

const BASE_URL = '/role/permission';

export const apiGetPermissions = async (params?: { page?: number; size?: number; search?: string; module?: string }) => {
  return instance.get<PermissionResponse>(BASE_URL, { params });
};

export const apiGetPermissionById = async (id: string) => {
  return instance.get<IPermission>(`${BASE_URL}/${id}`);
};

export const apiCreatePermission = async (permission: CreatePermissionRequest) => {
  return instance.post<IPermission>(BASE_URL, permission);
};

export const apiUpdatePermission = async (id: string, data: string[]) => {
  return instance.patch<IPermission>(`${BASE_URL}/${id}`, data);
};

export const apiDeletePermission = async (id: string) => {
  return instance.delete(`${BASE_URL}/${id}`);
};

export const apiGetPermissionByRole = async (roleId: string) => {
  return instance.get<IPermission[]>(`/role/${roleId}/permission`);
};

export const apiAssignPermissionRole = async (roleId: string, data: string[]) => {
  return instance.post<IPermission[]>(`/role/assign-permission-role/${roleId}`, { permissions: data });
};

export const apiAssignPermissionUser = async (userId: string, data: string[]) => {
  return instance.post<IPermission[]>(`/role/assign-permission-user/${userId}`, { permissions: data });
};

export const apiRevokePermission = async (data: AssignPermissionRequest) => {
  return instance.post<IPermission[]>(`/role/revoke-permission`, data);
};
