import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { StudyGroupDetail, StudyGroupInfo } from "@/types/studyGroupType"
import AddStudentDialog from "./AddStudentDialog"
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table"
import { Copy, Eye, Loader2, MoreHorizontal, Search, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select"
import type { SubjectResponse } from "@/types/subjectType"
import type { Year } from "@/types/year_semesterType"
import Paginate from "@/components/common/Pagination"
import { useEffect, useState } from "react"
import { apiGetSubjects } from "@/services/admin/subject"
import { AxiosError } from "axios"
import { toast } from "sonner"
import { apiGetAcademicYears } from "@/services/admin/yearSemester"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiGetStudyGroupDetail, apiRemoveStudentFromStudyGroup } from "@/services/teacher/studyGroup"
import StudyGroupDetailDialog from "./StudyGroupDetailDialog"

interface StudyGroupTableProps {
  studyGroups: StudyGroupInfo[]
  open: boolean
  setOpen: (open: boolean) => void
  isLoading: boolean
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  subjectFilter: string
  setSubjectFilter: (subjectFilter: string) => void
  yearFilter: string
  setYearFilter: (yearFilter: string) => void
  page: number
  totalPages: number
  handlePageClick: (page: number) => void
  copyInviteCode: (inviteCode: string) => void
  handleGetStudyGroup: () => void
}
const StudyGroupTable = ({ studyGroups, open, setOpen, isLoading, searchTerm, setSearchTerm, subjectFilter, setSubjectFilter, yearFilter, setYearFilter, page, totalPages, handlePageClick, copyInviteCode, handleGetStudyGroup }: StudyGroupTableProps) => {
  const [academicYear, setAcademicYear] = useState<Year[]>([])
  const [subject, setSubject] = useState<SubjectResponse | null>(null)
  const [isLoadingSubject, setIsLoadingSubject] = useState(false)
  const [isLoadingAcademicYear, setIsLoadingAcademicYear] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [studyGroupDetail, setStudyGroupDetail] = useState<StudyGroupDetail | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  
  const handleGetSubject = async () => {
    setIsLoadingSubject(true)
    try {
      const response = await apiGetSubjects(1, "active", "", 100)
      if (response.status === 200) {
        setSubject(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsLoadingSubject(false)
    }
  }

  const handleGetAcademicYear = async () => {
    setIsLoadingAcademicYear(true)
    try {
      const response = await apiGetAcademicYears()
      if (response.status === 200) {
        setAcademicYear(response.data.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsLoadingAcademicYear(false)
    }
  }

  useEffect(() => {
    handleGetSubject()
    handleGetAcademicYear()
  }, [])

  const handleViewDetail = async (studyGroupId: string) => {
    setIsLoadingDetail(true)
    setOpenDetail(true)
    try {
      const response = await apiGetStudyGroupDetail(studyGroupId)
      if (response.status === 200) {
        setStudyGroupDetail(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleRemoveStudent = async (studentCodes: string[]) => {
    console.log(studentCodes)
    try{
      const response = await apiRemoveStudentFromStudyGroup(studyGroupDetail?.id || "", studentCodes)
      if(response.status === 200){
        toast.success("Xóa sinh viên thành công")
        handleGetStudyGroup()
        setOpenDetail(false)
      }
    }catch(error){
      const axiosError = error as AxiosError<{ message: string, error: string }>
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra'
      toast.error(errorMessage)
    }finally{
      setIsLoadingDetail(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle >Danh sách lớp học phần</CardTitle>
            <CardDescription>Tổng cộng {studyGroups.length} lớp học phần</CardDescription>
          </div>
          <div>
            <AddStudentDialog
              open={open}
              onOpenChange={setOpen}
              handleGetStudyGroup={handleGetStudyGroup}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>

        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên, mã lớp hoặc giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select onValueChange={(value) => setSubjectFilter(value)} disabled={isLoadingSubject}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo môn học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn học</SelectItem>
              {subject?.data.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setYearFilter(value)} disabled={isLoadingAcademicYear}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm học</SelectItem>
              {academicYear.map((year) => (
                <SelectItem key={year.id} value={year.id}>{year.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã lớp</TableHead>
              <TableHead>Tên lớp</TableHead>
              <TableHead>Môn học</TableHead>
              <TableHead>Năm học/Học kỳ</TableHead>
              <TableHead>Sinh viên</TableHead>
              <TableHead>Mã mời</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                studyGroups.map((studyGroup) => (
                  <TableRow key={studyGroup.study_group_id}>
                    <TableCell>{studyGroup.study_group_code}</TableCell>
                    <TableCell>{studyGroup.study_group_name}</TableCell>
                    <TableCell>{studyGroup.subject_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{studyGroup.academic_year_code}</div>
                        <div className="text-gray-500">{studyGroup.semester_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>
                          {studyGroup.student_count} / {studyGroup.study_group_max_students}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{studyGroup.study_group_invite_code}</code>
                        <Button variant="ghost" size="sm" onClick={() => copyInviteCode(studyGroup.study_group_invite_code)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewDetail(studyGroup.study_group_id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )
            }
          </TableBody>
        </Table>
        {studyGroups.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">Không tìm thấy lớp học phần nào</div>
        )}
        <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />

        <StudyGroupDetailDialog
          studyGroup={studyGroupDetail}
          open={openDetail}
          setOpen={setOpenDetail}
          onRemoveStudent={handleRemoveStudent}
          isLoading={isLoadingDetail}
        />
      </CardContent>
    </Card>
  )
}

export default StudyGroupTable