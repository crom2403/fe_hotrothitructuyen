
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"


// Định nghĩa kiểu cho Store
interface AppStore {
  openSidebar: boolean,
  setOpenSidebar: (open: boolean) => void
}

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      openSidebar: true,
      setOpenSidebar:  (state: boolean) => {
        set({
          openSidebar: state
        })
      },
    }),
    {
      name: "app-storage", // Tên key trong localStorage
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ), // Lưu vào localStorage
    }
  )
)

export default useAppStore
