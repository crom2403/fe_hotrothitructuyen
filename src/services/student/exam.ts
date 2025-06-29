import instance from '../instance';

const BASE_URL = '/exams/student';

export const apiGetListExams = async (params?: { page?: number; size?: number; q?: string; subject_id?: string }) => {
  return instance.get<any[]>(BASE_URL + '/list', { params });
};
