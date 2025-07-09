import instance from "../instance"
import apiRoutes from "../apiRoutes"

export const apiCreateStudyGroup = async (data: object) => instance.post(apiRoutes.admin.study_group + "/create", data)

export const apiGetAllStudyGroup = async (page: number, q?: string, subject_id?: string, academic_year_id?: string, size?: number) => {
  let query = apiRoutes.admin.study_group + `/get-all?page=${page}`
  if (q) query += `&q=${q}`
  if (subject_id && subject_id !== "all") query += `&subject_id=${subject_id}`
  if (academic_year_id && academic_year_id !== "all") query += `&academic_year_id=${academic_year_id}`
  if (size) query += `&size=${size}`
  return instance.get(query)
}

export const apiDeleteStudyGroup = async (id: string) => instance.delete(apiRoutes.admin.study_group + `/${id}`)