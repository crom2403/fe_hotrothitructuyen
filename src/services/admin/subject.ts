import type { SubjectFormData } from "@/types/subjectType";
import instance from "../instance";
import apiRoutes from "../apiRoutes";

export const apiGetSubjects = async (page: number, is_active: string, name: string) => {
  let query = `/subject?page=${page}`
  if (is_active === "active") {
    query += `&is_active=1`
  } else if (is_active === "inactive") {
    query += `&is_active=0`
  }
  if (name) {
    query += `&name=${name}`
  }
  return instance.get(query)
}

export const apiCreateSubject = async (data: SubjectFormData) => instance.post(apiRoutes.admin.subject, data)

export const apiDeleteSubject = async (id: string) => instance.delete(apiRoutes.admin.subject + `/${id}`)

export const apiToggleStatusSubject = async (id: string, is_active: boolean) => instance.put(apiRoutes.admin.subject + `/${id}/active`, { is_active })

// export const apiUpdateSubject = async (id: string, data: SubjectFormData) => instance.put(`/subject/${id}`, data)