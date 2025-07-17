import type { IExam } from '@/services/student/interfaces/exam.interface';
import instance from '../instance';

const BASE_URL = '/exams';

export const apiGetListExams = async (params?: { page?: number; size?: number; q?: string; subject_id?: string }) => {
  return await instance.get<any[]>(BASE_URL + '/student/list', { params });
};

export const apiGetDetailExam = async (exam_id: string) => {
  return await instance.get<IExam>(BASE_URL + '/student/detail/' + exam_id);
};

export const apiSubmitExam = async (attempt_id: string, data: any) => {
  return await instance.post(BASE_URL + '/student/submit/' + attempt_id, data);
};

export const apiCreateExamAttempt = async (exam_id: string, study_group_id: string) => {
  return await instance.post(BASE_URL + '/student/create-exam-attempt/' + exam_id + '/study-group/' + study_group_id);
};

export const apiGetExamAttemptId = async (exam_id: string, study_group_id: string) => {
  return await instance.get(BASE_URL + '/student/get-exam-attempt-id/exam/' + exam_id + '/study-group/' + study_group_id);
};

export const apiGetExamResultList = async () => instance.get(BASE_URL + '/student/list-result-exam');
