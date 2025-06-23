import instance from "../instance";
import apiRoutes from "../apiRoutes";

export const apiGetUsers = async (page: number, role?: string, size?: number) => {
  let query = apiRoutes.admin.user + `?page=${page}`
  if (role && role !== "all") {
    query += `&role_code=${role}`
  }
  if (size) {
    query += `&size=${size}`
  }
  return instance.get(query)
}

export const apiCreateUser = async (data: object) => instance.post(apiRoutes.admin.create_user, data)