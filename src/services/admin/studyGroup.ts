import instance from "../instance"
import apiRoutes from "../apiRoutes"

export const apiCreateStudyGroup = async (data: object) => instance.post(apiRoutes.admin.study_group + "/create", data)
