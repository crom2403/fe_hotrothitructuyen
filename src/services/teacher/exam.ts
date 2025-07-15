import apiRoutes from "../apiRoutes";
import instance from "../instance";

export const apiGetExamStudyGroupList = async (page: number, subject_id: string, exam_status: string, q: string, test_type: string) => {
  let query = apiRoutes.teacher.exam + `/teacher/study-group-exam?page=${page}`;
  if (subject_id && subject_id !== "all") {
    query += `&subject_id=${subject_id}`;
  }
  if (exam_status && exam_status !== "all") {
    query += `&handle_exam_status=${exam_status}`;
  }
  if (q) {
    query += `&q=${q}`;
  }
  if (test_type && test_type !== "all") {
    query += `&test_type=${test_type}`;
  }
  return instance.get(query);
}

export const apiGetExamDetail = async (exam_id: string, study_group_id: string) => instance.get(apiRoutes.teacher.exam + `/teacher/exam-attempt/${exam_id}/study-group/${study_group_id}`);

