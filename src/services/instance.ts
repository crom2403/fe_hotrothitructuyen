/* eslint-disable prefer-const */
import axios from "axios"
import path from "../utils/path"
import useAuthStore from "@/stores/authStore"
import apiRoutes from "./apiRoutes"

let instance = axios.create()
instance.defaults.baseURL = path.SERVER_URL

// Thời gian chờ tối đa của 1 request : để 10 phút
instance.defaults.timeout = 1000 * 60 * 10

// withCredentials : cho phép tự động đính kèm cookie vào header khi gửi request
instance.defaults.withCredentials = true

instance.interceptors.request.use(
  (config) => {
    // lấy accessToken từ localStorage đính vào header
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) {
      // Cần thêm "Bearer " vì tuân thủ theo tiêu chuẩn OAuth 2.0 trong việc xác định loại token
      // Bearer token là loại token dành cho việc xác thực và ủy quyền
      config.headers["X-Auth"] = accessToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 410 && !originalRequest._retry) {
      // 410 means "Gone"
      originalRequest._retry = true
      const refreshToken = localStorage.getItem("refreshToken")
      try {
        const { data } = await instance.post(apiRoutes.refresh, { refreshToken })
        originalRequest.headers["X-Auth"] = data.accessToken
        return instance(originalRequest)
      } catch (refreshError) {
        // const { logout } = useAuthStore()
        // logout()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default instance
