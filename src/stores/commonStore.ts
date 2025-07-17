import { create } from "zustand";

interface CommonStore {
  exam_attempt_id: string;
  setExamAttemptId: (exam_attempt_id: string) => void;
}

const useCommonStore = create<CommonStore>()(
  (set) => ({
    exam_attempt_id: '',
    setExamAttemptId: (exam_attempt_id: string) => set({ exam_attempt_id }),
  })
)

export default useCommonStore;