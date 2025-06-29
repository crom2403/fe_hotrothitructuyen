import type { IStudentGroup, IStudentGroupDetail } from '@/types/studentGroupType';
import instance from '../instance';

const BASE_URL = '/student/study-groups';

export const apiGetStudentGroups = async (params?: { page?: number; size?: number; search?: string }) => {
  return instance.get<IStudentGroup[]>(BASE_URL + '/get-all', { params });
};

export const apiGetStudentGroupById = async (id: string) => {
  return instance.get<IStudentGroupDetail>(BASE_URL + '/' + id);
};

export const apiJoinGroup = async (code: string) => {
  return instance.post(BASE_URL + '/join', {
    invite_code: code,
  });
};
