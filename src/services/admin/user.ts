import instance from '../instance';
import apiRoutes from '../apiRoutes';

export const apiGetUsers = async (page: number, role?: string, q?: string, size?: number) => {
  let query = apiRoutes.admin.user + `?page=${page}`;
  if (role && role !== 'all') {
    query += `&role_code=${role}`;
  }
  if (size) {
    query += `&size=${size}`;
  }
  if (q) {
    query += `&q=${q}`;
  }
  return instance.get(query);
};

export const apiCreateUser = async (data: object) => instance.post(apiRoutes.admin.create_user, data);

export const apiGetUserDetail = async (id: string) => instance.get(apiRoutes.admin.user + `/${id}`);

export const apiExportUser = async () =>
  instance.get(`/admin/users/export`, {
    responseType: 'arraybuffer', // Đổi từ 'blob' sang 'arraybuffer'
  });
