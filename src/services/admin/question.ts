import apiRoutes from "../apiRoutes";
import instance from "../instance";

export const apiGetQuestionList = async (page: number, review_status?: string, is_public?: boolean) => {
  let query = apiRoutes.admin.question + `/list?page=${page}`;
  if (review_status) {
    query += `&review_status=${review_status}`;
  }
  if (is_public) {
    query += `&is_public=${is_public}`;
  }
  return instance.get(query);
}

export const apiApproveQuestion = async (questionId: string, data: object) => instance.post(apiRoutes.admin.question + `/admin/${questionId}/approve`, data)