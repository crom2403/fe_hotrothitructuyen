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
  login: (accessToken: string, refreshToken: string) => Promise<void> 
  currentUser: CurrentUser | null
  getCurrentUser: (currentUser: CurrentUser) => Promise<void>
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: "",
      refreshToken: "",
      currentUser: null,
      login: async (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken })
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
      },
      getCurrentUser: async (currentUser: CurrentUser) => {
        set({ currentUser })
      }
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useAuthStore