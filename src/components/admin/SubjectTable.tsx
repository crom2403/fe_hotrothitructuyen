import type { Subject } from "@/types/subjectType"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { BookOpen, Edit, Search, MoreHorizontal, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import Paginate from "../common/Pagination"
import { Badge } from "../ui/badge"

interface SubjectTableProps {
  subjects: Subject[]
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  statusFilter: string
  setStatusFilter: (statusFilter: string) => void
  page: number
  setPage: (page: number) => void
  totalPages: number
  handleEdit: (subject: Subject) => void
  handleDelete: (subjectId: string) => void
  handlePageClick: (page: number) => void
  handleToggleStatus: (subjectId: string) => void
}

const SubjectTable = ({ subjects, searchTerm, setSearchTerm, statusFilter, setStatusFilter, page, setPage, totalPages, handleEdit, handleDelete, handlePageClick, handleToggleStatus }: SubjectTableProps) => {
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = subject.status === true;
    } else if (statusFilter === "inactive") {
      matchesStatus = subject.status === false;
    } // statusFilter === "all" thì không cần lọc trạng thái
    return matchesSearch && matchesStatus;
  })

  const getStatusBadge = (status: boolean) => {
    if (status === true) {
      return <Badge variant="outline" className="bg-green-500 text-white">Hoạt động</Badge>
    } else {
      return <Badge variant="outline" className="bg-gray-300 text-black">Không hoạt động</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách môn học</CardTitle>
        <CardDescription>Tổng cộng {subjects.length} môn học</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm môn học"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[210px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã môn học</TableHead>
              <TableHead>Tên môn học</TableHead>
              <TableHead>Số tín chỉ</TableHead>
              <TableHead>Số tiết học</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.code}</TableCell>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.credits}</TableCell>
                <TableCell>
                  {subject.theoryHours > 0 ? `${subject.theoryHours} lý thuyết` : ""} {subject.practiceHours > 0 ? `${subject.practiceHours} thực hành` : ""}
                </TableCell>
                <TableCell>
                  {getStatusBadge(subject.status)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(subject)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(subject.id)}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        {subject.status ? "Vô hiệu hóa" : "Kích hoạt"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(subject.id)} className="text-red-600">
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
    </Card>
  )
}

export default SubjectTable