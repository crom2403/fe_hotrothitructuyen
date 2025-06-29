import apiRoutes from "../apiRoutes";
import instance from "../instance";


export const apiGetPointScales = async () => instance.get(apiRoutes.teacher.point_scale)

export const apiCreateExam = async (data: any) => instance.post(apiRoutes.teacher.exam + "/create", data)
