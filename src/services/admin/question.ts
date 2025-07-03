import apiRoutes from '../apiRoutes';
import instance from '../instance';

export const apiGetQuestionList = async (page: number, review_status?: string) => {
  let query = apiRoutes.admin.question + `/list?page=${page}&is_public=1`;
  if (review_status && review_status !== 'all') {
    query += `&review_status=${review_status}`;
  }
  return instance.get(query);
};

export const apiApproveQuestion = async (questionId: string, data: object) => instance.post(apiRoutes.admin.question + `/admin/${questionId}/approve`, data);

export const apiGenerateQuestion = async (data: { subject_name?: string; question_type?: string; content?: string; difficulty_level?: string }) => instance.post(`questions/teacher/generate`, data);
