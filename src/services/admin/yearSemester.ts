import instance from "../instance";
import apiRoutes from "../apiRoutes";

export const apiGetAcademicYears = async () => instance.get(apiRoutes.admin.academic_year)

export const apiCreateAcademicYear = async (data: object) => instance.post(apiRoutes.admin.academic_year, data)

export const apiGetSemesters = async (page: number, is_current?: string | null, code?: string | null, size?: number) => {
  let query = apiRoutes.admin.semester + `?page=${page}`
  if (is_current === "active") {
    query += `&is_current=1`
  } else if (is_current === "inactive") {
    query += `&is_current=0`
  }
  if (code !== "all") {
    query += `&code=${code}`
  }
  if (size) {
    query += `&size=${size}`
  }
  return instance.get(query)
}

export const apiGetSemestersByYear = async (year_id: string) => instance.get(`/semesters/${year_id}`)  