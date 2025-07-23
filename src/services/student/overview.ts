import instance from "../instance";

export const apiGetDashboardStats = async () => instance.get("/dashboard/student");