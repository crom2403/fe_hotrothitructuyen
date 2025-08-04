import instance from "../instance";
import apiRoutes from "../apiRoutes";

export const apiGetAcademicYears = async () => instance.get(apiRoutes.admin.academic_year)

export const apiCreateAcademicYear = async (data: object) => instance.post(apiRoutes.admin.academic_year, data)

export const apiGetSemesters = async (page: number, code?: string | null, size?: number) => {
  let query = apiRoutes.admin.semester + `?page=${page}`
  if (code !== "all") {
    query += `&code=${code}`
  }
  if (size) {
    query += `&size=${size}`
  }
  return instance.get(query)
}

export const apiCreateSemester = async (data: object) => instance.post('/semesters', data)

export const apiGetSemestersByYear = async (year_id: string) => instance.get(`/semesters/${year_id}`)  

export const apiDeleteSemester = async (id: string) => instance.delete(`/semesters/${id}`)