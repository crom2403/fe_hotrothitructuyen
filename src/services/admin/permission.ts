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
  return instance.get<string[]>(`/role/permission-role/${roleId}`);
};

export const apiAssignPermissionRole = async (roleId: string, data: string[]) => {
  return instance.post<string[]>(`/role/assign-permission-role/${roleId}`, { permissions: data });
};

export const apiAssignPermissionUser = async (userId: string, data: string[]) => {
  return instance.post<string[]>(`/role/assign-permission-user/${userId}`, { permissions: data });
};

export const apiRevokePermission = async (data: AssignPermissionRequest) => {
  return instance.post<string[]>(`/role/revoke-permission`, data);
};

export const apiGetPermissionOfUser = async (userId: string) => {
  return instance.get<string[]>(`/role/permission-user/${userId}`);
};

export const apiAssignPermissionOfUser = async (userId: string, data: string[]) => {
  return instance.post<string[]>(`/role/assign-permission-user/${userId}`, { permissions: data });
};
