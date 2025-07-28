import apiRoutes from '../apiRoutes';
import instance from '../instance';

export const apiGetExamStudyGroupList = async (page: number, subject_id?: string, exam_status?: string, q?: string, test_type?: string) => {
  let query = apiRoutes.teacher.exam + `/teacher/study-group-exam?page=${page}`;
  if (subject_id && subject_id !== 'all') {
    query += `&subject_id=${subject_id}`;
  }
  if (exam_status && exam_status !== 'all') {
    query += `&handle_exam_status=${exam_status}`;
  }
  if (q) {
    query += `&q=${q}`;
  }
  if (test_type && test_type !== 'all') {
    query += `&test_type=${test_type}`;
  }
  return instance.get(query);
};

export const apiGetExamDetail = async (exam_id: string, study_group_id: string) => instance.get(apiRoutes.teacher.exam + `/teacher/exam-attempt/${exam_id}/study-group/${study_group_id}`);

export const apiExportExamAttemptToWord = async (exam_attempt_id: string) =>
  instance.get(`/exams/teacher/export-exam-to-word/${exam_attempt_id}`, {
    responseType: 'arraybuffer',
  });

export const apiExportAllExamAttemptToExcel = async (exam_id: string, study_group_id: string) =>
  instance.get(`/exams/teacher/export-exam-attempt-to-excel/study-group/${study_group_id}/exam/${exam_id}`, {
    responseType: 'arraybuffer',
  });

export const apiGetDetailExamAttempt = async (exam_attempt_id: string) => instance.get(`/exams/teacher/get-attempt/${exam_attempt_id}`);

export const apiGetExamList = async (page: number, study_group_id?: string, q?: string, status?: string) => {
  let query = apiRoutes.teacher.exam + `/teacher/get-exam-create-by-teacher?page=${page}`;
  if (study_group_id && study_group_id !== 'all') {
    query += `&study_group_id=${study_group_id}`;
  }
  if (q) {
    query += `&q=${q}`;
  }
  if (status && status !== 'all') {
    query += `&status=${status}`;
  }
  return instance.get(query);
}

export const apiUpdateExam = async (exam_id: string, data: any) => instance.put(apiRoutes.teacher.exam + `/teacher/${exam_id}/update`, data);