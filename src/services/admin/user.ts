import instance from "../instance";
import apiRoutes from "../apiRoutes";

export const apiCreateUser = async (data: object) => instance.post(apiRoutes.admin.create_user, data)