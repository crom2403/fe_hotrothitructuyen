import apiRoutes from "../apiRoutes";
import instance from "../instance";


export const apiGetPointScales = async () => instance.get(apiRoutes.teacher.point_scale)

export const apiCreateExam = async (data: any) => instance.post(apiRoutes.teacher.exam + "/teacher/create", data)

export const apiExamForStudyGroup = async (study_group_id: string) => instance.get(apiRoutes.teacher.exam + "/teacher/list/" + study_group_id)
