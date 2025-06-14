import apiRoutes from "../apiRoutes";
import instance from "../instance";

export const apiGetRoles = async () => instance.get(apiRoutes.role)