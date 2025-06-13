import type { LoginType } from "@/types/authType";
import instance from "./instance";
import apiRoutes from "./apiRoutes";
import axios from "axios";
import path from "@/utils/path";


export const apiLogin = async (data: LoginType) => axios.post(path.SERVER_URL + apiRoutes.login, data)

export const apiGetCurrentUser = async () => instance.get(apiRoutes.me)