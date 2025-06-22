import apiRoutes from "../apiRoutes";
import instance from "../instance";


export const apiGetQuestionTypes = async () => instance.get(apiRoutes.teacher.question + "/type")

export const apiGetDifficultyLevels = async () => instance.get(apiRoutes.difficultyLevel)

export const apiCreateQuestion = async (data: object) => instance.post(apiRoutes.teacher.question + "/create", data)