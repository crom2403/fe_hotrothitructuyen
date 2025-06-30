import type { LoginType } from '@/types/authType';
import instance from './instance';
import apiRoutes from './apiRoutes';
import axios from 'axios';
import path from '@/utils/path';

export const apiLogin = async (data: LoginType) => axios.post(path.SERVER_URL + apiRoutes.login, data);

export const apiGetCurrentUser = async () => instance.get(apiRoutes.me);

export const apiForgotPassword = async (data: object) => axios.post(path.SERVER_URL + apiRoutes.forgotPassword, data);

export const apiResetPassword = async (data: object) => axios.post(path.SERVER_URL + apiRoutes.resetPassword, data);

export const apiGoogleVerify = async (data: object) => instance.post(apiRoutes.googleVerify, data);

export const apiGoogleConfirm = async (data: object) => instance.post(apiRoutes.googleConfirm, data);

export const apiUpdateAvatar = async (data: object) => instance.put(apiRoutes.updateAvatar, data);
