import DeleteDialog from "@/components/common/DeleteDialog"
import Paginate from "@/components/common/Pagination"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableCell, TableBody, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table"
import type { StudyGroup } from "@/types/studyGroup"
import type { Subject } from "@/types/subjectType"
import type { Year } from "@/types/year_semesterType"
import { Copy, Edit, GraduationCap, MoreHorizontal, Search, Trash2, Users } from "lucide-react"
import { useState } from "react"

interface StudyGroupTableProps {
  studyGroups: StudyGroup[]
  subjects: Subject[]
  academicYears: Year[]
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  subjectFilter: string
  setSubjectFilter: (subjectFilter: string) => void
  yearFilter: string
  setYearFilter: (yearFilter: string) => void
  page: number
  totalPages: number
  handleEdit: (studyGroup: StudyGroup) => void
  handleDelete: (studyGroupId: string) => void
  handlePageClick: (page: number) => void
  handleToggleStatus: (studyGroupId: string, isActive: boolean) => void
  copyInviteCode: (inviteCode: string) => void
}

const StudyGroupTable = ({ studyGroups, subjects, academicYears, searchTerm, setSearchTerm, subjectFilter, setSubjectFilter, yearFilter, setYearFilter, page, totalPages, handleEdit, handleDelete, handlePageClick, handleToggleStatus, copyInviteCode }: StudyGroupTableProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<StudyGroup | null>(null)

  const filteredClasses = studyGroups.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.teacher_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      subjectFilter === "all" ||
      subjects.find((s) => s.id === subjectFilter)?.name === classItem.subject_name;
    const matchesAcademicYear = yearFilter === "all" || classItem.academic_year === yearFilter;
    return matchesSearch && matchesSubject && matchesAcademicYear;
  });


  const openDeleteDialog = (classItem: StudyGroup) => {
    setSelectedClass(classItem)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách lớp học phần</CardTitle>
        <CardDescription>
          Tổng cộng {studyGroups.length} lớp học phần
        </CardDescription>
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
          <Select onValueChange={(value) => setSubjectFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo môn học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn học</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setYearFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm học</SelectItem>
              {academicYears.map((year) => (
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
              <TableHead>Giáo viên</TableHead>
              <TableHead>Năm học/Học kỳ</TableHead>
              <TableHead>Sinh viên</TableHead>
              <TableHead>Mã mời</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClasses.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell className="font-medium">{classItem.code}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{classItem.name}</div>
                    {classItem.description && <div className="text-sm text-gray-500">{classItem.description}</div>}
                  </div>
                </TableCell>
                <TableCell>{classItem.subject_name}</TableCell>
                <TableCell>{classItem.teacher_name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{classItem.academic_year}</div>
                    <div className="text-gray-500">{classItem.semester_name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      0 / {classItem.max_students}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">{classItem.invite_code}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyInviteCode(classItem.invite_code)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={classItem.is_active ? "default" : "secondary"}>
                    {classItem.is_active ? "Hoạt động" : "Không hoạt động"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(classItem)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(classItem.id, classItem.is_active)}>
                        <GraduationCap className="mr-2 h-4 w-4" />
                        {classItem.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(classItem)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredClasses.length === 0 && (
          <div className="text-center py-8 text-gray-500">Không tìm thấy lớp học phần nào</div>
        )}
        <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteDialog itemName="lớp học phần" id={selectedClass?.id || ""} onDelete={handleDelete} />
      </AlertDialog>

    </Card>
  )
}

export default StudyGroupTable