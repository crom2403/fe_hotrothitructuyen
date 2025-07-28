import apiRoutes from "../apiRoutes";
import instance from "../instance";

export const apiGetDashboardStats = async () => instance.get("/dashboard/admin");

export const apiGetUsersOverview = async () => instance.get(apiRoutes.admin.user+`?page=1&size=3000`);

export const apiGetExamsOverview = async () => instance.get(apiRoutes.admin.exam + `/admin/list?page=1&approval_status=approved&size=3000`);