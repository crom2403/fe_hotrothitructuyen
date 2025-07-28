import apiRoutes from "../apiRoutes";
import instance from "../instance";


export const apiGetPointScales = async () => instance.get(apiRoutes.teacher.point_scale)

export const apiCreateExam = async (data: any) => instance.post(apiRoutes.teacher.exam + "/teacher/create", data)

export const apiExamForStudyGroup = async (study_group_id: string) => instance.get(apiRoutes.teacher.exam + "/teacher/list/" + study_group_id)

export const apiGetRandomQuestions = async (subject_id: string, easy: number, medium: number, difficult: number) => {
  let query = apiRoutes.teacher.exam + "/teacher/get-random-question-of-exam/" + subject_id;
  if (easy) {
    query += "?easy=" + easy;
  }
  if (medium) {
    query += "&medium=" + medium;
  }
  if (difficult) {
    query += "&difficult=" + difficult;
  }
  return instance.get(query)
}