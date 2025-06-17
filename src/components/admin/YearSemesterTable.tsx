import type { Semester, Year } from "@/types/year_semesterType"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Edit, MoreHorizontal, Search, Star, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "../ui/select"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useState } from "react"
import { AlertDialog } from "../ui/alert-dialog"
import DeleteDialog from "../common/DeleteDialog"
import Paginate from "../common/Pagination"

interface YearSemesterTableProps {
  semesters: Semester[],
  academicYears: Year[],
  searchTerm: string,
  setSearchTerm: (searchTerm: string) => void,
  yearFilter: string,
  setYearFilter: (yearFilter: string) => void,
  statusFilter: string,
  setStatusFilter: (statusFilter: string) => void,
  page: number,
  totalPages: number,
  handleEdit: (semester: Semester) => void,
  handleDelete: (semesterId: string) => void,
  handlePageClick: (page: number) => void,
  handleSetCurrent: (semesterId: string) => void,
}

const YearSemesterTable = ({ semesters, academicYears, searchTerm, setSearchTerm, yearFilter, setYearFilter, statusFilter, setStatusFilter, page, totalPages, handleEdit, handleDelete, handlePageClick, handleSetCurrent }: YearSemesterTableProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const openDeleteDialog = (semester: Semester) => {
    setSelectedSemester(semester)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách học kỳ</CardTitle>
        <CardDescription>
          Quản lý thời gian học tập trong chương trình đào tạo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm học kỳ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm học</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year.code} value={year.code}>
                  {year.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hiện tại</SelectItem>
              <SelectItem value="inactive">Không hiện tại</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên học kỳ</TableHead>
              <TableHead>Năm học</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {semesters.map((semester) => (
              <TableRow key={semester.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {semester.name}
                    {semester.is_current && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </div>
                </TableCell>
                <TableCell>{semester.year_name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>
                      {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {semester.is_current && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Hiện tại
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(semester)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      {!semester.is_current && (
                        <DropdownMenuItem onClick={() => handleSetCurrent(semester.id)}>
                          <Star className="mr-2 h-4 w-4" />
                          Đặt làm hiện tại
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => openDeleteDialog(semester)}
                        className="text-red-600"
                        disabled={semester.is_current}
                      >
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
        <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteDialog itemName="học kỳ" id={selectedSemester?.id || ""} onDelete={handleDelete} />
      </AlertDialog>

    </Card>
  )
}

export default YearSemesterTable