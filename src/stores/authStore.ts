import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface Role {
  id: number
  name: string
  description: string
}

export interface CurrentUser {
  id: string,
  code: string,
  email: string | null,
  full_name:string,
  avatar: string,
  phone: string | null,
  gender: string,
  date_of_birth: string | null,
  role_id: string,
  role_code: string,
  role_name: string
}

interface AuthStore {
  accessToken: string,
  refreshToken: string,
  currentUser: CurrentUser | null,
  rememberMe: boolean,
  loginCredentials: {
    code: string,
    password: string
  } | null,
  setRememberMe: (rememberMe: boolean) => void,
  login: (accessToken: string, refreshToken: string, rememberMe: boolean, credentials: { code: string, password: string }) => void
  getCurrentUser: (currentUser: CurrentUser) => void
  clearCredentials: () => void
  logout: () => void
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: "",
      refreshToken: "",
      currentUser: null,
      rememberMe: false,
      loginCredentials: null,
      login: (accessToken: string, refreshToken: string, rememberMe: boolean, credentials: { code: string, password: string }) => {
        set({ accessToken, refreshToken, rememberMe })
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        if (rememberMe) {
          set({ loginCredentials: credentials }); 
          localStorage.setItem("loginCredentials", JSON.stringify(credentials))
        } else {
          set({ loginCredentials: null }); 
          localStorage.removeItem("loginCredentials")
        }
      },
      getCurrentUser: (currentUser: CurrentUser) => {
        set({ currentUser })
      },
      setRememberMe: (rememberMe: boolean) => {
        set({ rememberMe })
        if(!rememberMe) {
          set({ loginCredentials: null })
          localStorage.removeItem("loginCredentials")
        }
      },
      clearCredentials: () => {
        set({ loginCredentials: null })
      },
      logout: () => {
        set({ currentUser: null, accessToken: "", refreshToken: "" })
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("auth-storage")
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useAuthStore