import instance from "../instance"
import apiRoutes from "../apiRoutes"

export const apiGetStudyGroup = async (page: number, q?: string, subject_id?: string, academic_year_id?: string, size?: number) => {
  let query = apiRoutes.teacher.study_group + `/get-all?page=${page}`
  if (q) query += `&q=${q}`
  if (subject_id && subject_id !== "all") query += `&subject_id=${subject_id}`
  if (academic_year_id && academic_year_id !== "all") query += `&academic_year_id=${academic_year_id}`
  if (size) query += `&size=${size}`
  return instance.get(query)
}

export const apiAddStudentToStudyGroup = async (
  study_group_id: string, data: object) => instance.post(apiRoutes.teacher.study_group + `/${study_group_id}/add-student`, data)

export const apiGetStudyGroupDetail = async (study_group_id: string) => instance.get(apiRoutes.teacher.study_group + `/${study_group_id}`)

export const apiRemoveStudentFromStudyGroup = async (study_group_id: string, student_codes: string[]) => instance.delete(apiRoutes.teacher.study_group + `/${study_group_id}/remove-student`, { data: { student_codes } })