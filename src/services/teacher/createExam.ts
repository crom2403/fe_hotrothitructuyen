import apiRoutes from "../apiRoutes";
import instance from "../instance";


export const apiGetPointScales = async () => instance.get(apiRoutes.teacher.point_scale)