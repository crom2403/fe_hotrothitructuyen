import { Card, CardTitle, CardDescription, CardHeader, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import AssignSubjectDialog from "./AssignSubjectDialog"
import { Edit, Loader2, MoreHorizontal, Search, Trash } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { AssignedSubject, AssignedSubjectResponse, Subject, SubjectResponse } from "@/types/subjectType"
import { apiGetAssignedSubjects, apiGetSubjects } from "@/services/admin/subject"
import type { AxiosError } from "axios"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import Paginate from "@/components/common/Pagination"
import { useDebounce } from "@/utils/functions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { UserInfo } from "@/types/userType"

const AssignSubjectTable = () => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("")
  const [isLoadingSubject, setIsLoadingSubject] = useState(false)
  const [subjects, setSubjects] = useState<SubjectResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubjectResponse | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 800)

  const handleGetSubjects = async () => {
    setIsLoadingSubject(true)
    try {
      const response = await apiGetSubjects(1, "active", "", 100)
      if (response.status === 200) {
        setSubjects(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubject(false)
    }
  }

  const handleGetAssignedSubjects = async () => {
    setIsLoading(true)
    try {
      const response = await apiGetAssignedSubjects(page, debouncedSearchTerm, subjectFilter)
      if (response.status === 200) {
        setAssignedSubjects(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageClick = (page: number) => {
    setPage(page)
  }

  useEffect(() => {
    handleGetSubjects()
  }, [])

  useEffect(() => {
    handleGetAssignedSubjects()
  }, [page, debouncedSearchTerm, subjectFilter])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bảng phân công giảng dạy</CardTitle>
            <CardDescription>Xem các môn học đã được phân công cho giảng viên</CardDescription>
          </div>
          <div>
            <AssignSubjectDialog
              open={open}
              onOpenChange={setOpen}
              getAssignSubject={handleGetAssignedSubjects}
              assignedSubjects={assignedSubjects}
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
              placeholder="Tìm kiếm theo tên, mã giáo viên..."
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
              {subjects?.data.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã giáo viên</TableHead>
                <TableHead>Tên giáo viên</TableHead>
                <TableHead>Môn học được phân công</TableHead>
                <TableHead>Ngày phân công</TableHead>
                <TableHead>Người phân công</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="w-10 h-10 animate-spin" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                assignedSubjects?.data.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>{subject.teacher.code}</TableCell>
                    <TableCell>{subject.teacher.full_name}</TableCell>
                    <TableCell>{subject.subject.name}</TableCell>
                    <TableCell>{format(new Date(subject.assigned_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{subject.assigned_by.full_name}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem className="text-red-500">
                            <Trash className="h-4 w-4 text-red-500" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {assignedSubjects?.data.length === 0 && !isLoading && <div className="text-center py-8 text-gray-500">Không tìm thấy môn học nào</div>}
          <Paginate page={page} totalPages={assignedSubjects?.metadata.last_page || 1} onPageChange={handlePageClick} />
        </div>
      </CardContent>
    </Card>
  )
}

export default AssignSubjectTable