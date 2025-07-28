import type { Semester, Year } from '@/types/year_semesterType';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Loader2, MoreHorizontal, Star, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from '../../ui/select';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { useState } from 'react';
import { AlertDialog } from '../../ui/alert-dialog';
import DeleteDialog from '../../common/CommonDialog';
import Paginate from '../../common/Pagination';
import Loading from '@/components/common/Loading';

interface YearSemesterTableProps {
  semesters: Semester[];
  academicYears: Year[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  yearFilter: string;
  setYearFilter: (yearFilter: string) => void;
  statusFilter: string;
  setStatusFilter: (statusFilter: string) => void;
  page: number;
  totalPages: number;
  handleEdit: (semester: Semester) => void;
  handleDelete: (semesterId: string) => Promise<void>;
  handlePageClick: (page: number) => void;
  handleSetCurrent: (semesterId: string) => void;
}

const YearSemesterTable = ({
  semesters,
  academicYears,
  isLoading,
  searchTerm,
  yearFilter,
  setYearFilter,
  statusFilter,
  setStatusFilter,
  page,
  totalPages,
  handleDelete,
  handlePageClick,
  handleSetCurrent,
}: YearSemesterTableProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  const filteredSemesters = semesters.filter((semester) => {
    const matchesSearch = semester.name.toLowerCase().includes(searchTerm.toLowerCase()) || semester.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === 'all' || semester.academic_year_code.toLowerCase().includes(yearFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? semester.is_current : !semester.is_current);
    return matchesSearch && matchesYear && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const openDeleteDialog = (semester: Semester) => {
    setSelectedSemester(semester);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách học kỳ</CardTitle>
        <CardDescription>Tổng cộng {semesters.length} học kỳ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4 justify-end">
          {/* <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã học kỳ"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div> */}
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm học</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.code}>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center items-center h-32">
                    <Loading />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSemesters.length > 0 ? (
              filteredSemesters.map((semester) => (
                <TableRow key={semester.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {semester.name}
                      {semester.is_current === 1 && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </div>
                  </TableCell>
                  <TableCell>{semester.academic_year_code}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {semester.is_current === 1 && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Hiện tại
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem onClick={() => handleEdit(semester)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem> */}
                        {!semester.is_current && (
                          <DropdownMenuItem onClick={() => handleSetCurrent(semester.id)}>
                            <Star className="mr-2 h-4 w-4" />
                            Đặt làm hiện tại
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openDeleteDialog(semester)} className="text-red-600" disabled={semester.is_current === 1}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500 text-md">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteDialog title="xóa" itemName="học kỳ" id={selectedSemester?.id || ''} onDelete={handleDelete} />
      </AlertDialog>
    </Card>
  );
};

export default YearSemesterTable;
