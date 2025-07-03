import type { IExam } from '@/services/student/interfaces/exam.interface';
import instance from '../instance';

const BASE_URL = '/exams';

export const apiGetListExams = async (params?: { page?: number; size?: number; q?: string; subject_id?: string }) => {
  return instance.get<any[]>(BASE_URL + '/student/list', { params });
};

export const apiGetDetailExam = async (exam_id: string) => {
  return instance.get<IExam>(BASE_URL + '/' + exam_id);
};
