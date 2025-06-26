import StudyGroupTable from "@/components/teacher/StudyGroup/StudyGroupTable"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiGetStudyGroup } from "@/services/teacher/studyGroup"
import type { StudyGroupResponse } from "@/types/studyGroupType"
import type { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const StudyGroup = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroupResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("")
  const [yearFilter, setYearFilter] = useState("")

  const handleGetStudyGroup = async () => {
    setIsLoading(true)
    try {
      const response = await apiGetStudyGroup(page, searchTerm, subjectFilter, yearFilter)
      if (response.status === 200) {
        setStudyGroups(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    handleGetStudyGroup()
  }, [page, searchTerm, subjectFilter, yearFilter])


  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setMessage("Mã mời đã được sao chép vào clipboard")
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý lớp học phần</h1>
        <p className="text-gray-500">Quản lý các lớp học phần bạn đang phụ trách</p>
      </div>
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <div>
        <StudyGroupTable
          studyGroups={studyGroups?.data || []}
          open={open}
          setOpen={setOpen}
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          subjectFilter={subjectFilter}
          setSubjectFilter={setSubjectFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          page={page}
          totalPages={studyGroups?.metadata.last_page || 1}
          handlePageClick={setPage}
          copyInviteCode={copyInviteCode}
          handleGetStudyGroup={handleGetStudyGroup}
        />
      </div>
    </div>
  )
}

export default StudyGroup