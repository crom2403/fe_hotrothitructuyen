import apiRoutes from "../apiRoutes";
import instance from "../instance";

export const apiGetExamList = async (page: number, q: string, status: string, subject: string) => {
  let query = apiRoutes.admin.exam + `/admin/list?page=${page}&test_type=final`;
  if (q) {
    query += `&q=${q}`;
  }
  if (status) {
    query += `&approval_status=${status}`;
  }
  if (subject && subject !== 'all') {
    query += `&subject=${subject}`;
  }
  return instance.get(query);
}

export const apiGetExamDashBoard = async () => instance.get(apiRoutes.admin.exam + '/admin/list/dashboard')

export const apiApproveExam = async (id: string, data: any) => instance.put(apiRoutes.admin.exam + `/admin/approve/${id}`, data)

export const apiGetExamDetail = async (exam_id: string) => instance.get(`/exams/teacher/detail/${exam_id}`);