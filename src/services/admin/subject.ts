import type { SubjectFormData } from "@/types/subjectType";
import instance from "../instance";
import apiRoutes from "../apiRoutes";

export const apiGetSubjects = async (page: number, is_active?: string, name?: string, size?: number) => {
  let query = apiRoutes.admin.subject + `?page=${page}`
  if (is_active === "active") {
    query += `&is_active=1`
  } else if (is_active === "inactive") {
    query += `&is_active=0`
  }
  if (name) {
    query += `&name=${name}`
  }
  if (size) {
    query += `&size=${size}`
  }
  return instance.get(query)
}

export const apiCreateSubject = async (data: SubjectFormData) => instance.post(apiRoutes.admin.subject, data)

export const apiDeleteSubject = async (id: string) => instance.delete(apiRoutes.admin.subject + `/${id}`)

export const apiToggleStatusSubject = async (id: string, is_active: boolean) => instance.put(apiRoutes.admin.subject + `/${id}/active`, { is_active })

// export const apiUpdateSubject = async (id: string, data: SubjectFormData) => instance.put(`/subject/${id}`, data)

export const apiAssignSubject = async (data: { teacherId: string, listSubjectId: string[] }) => instance.put(apiRoutes.admin.subject + `/admin/assign`, data)

export const apiGetAssignedSubjects = async (page: number, q?: string, subject_id?: string, size?: number) => {
  let query = apiRoutes.admin.subject + `/admin/list?page=${page}`
  if (q) {
    query += `&q=${q}`
  }
  if (subject_id && subject_id !== "all") {
    query += `&subject_id=${subject_id}`
  }
  if (size) {
    query += `&size=${size}`
  }
  return instance.get(query)
}

export const apiDeleteAssignedSubject = async (id: string) => instance.delete(apiRoutes.admin.subject + `/admin/assign/delete/${id}`)

export const apiGetAssignedSubjectByTeacher = async (teacherId: string) => instance.get(apiRoutes.admin.subject + `/admin/list/${teacherId}`)