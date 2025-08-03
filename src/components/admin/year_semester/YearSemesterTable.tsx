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
import Paginate from '../../common/Pagination';
import Loading from '@/components/common/Loading';
import CommonDialog from '../../common/CommonDialog';
import { apiDeleteSemester } from '@/services/admin/yearSemester';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

interface YearSemesterTableProps {
  semesters: Semester[];
  academicYears: Year[];
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  yearFilter: string;
  setYearFilter: (yearFilter: string) => void;
  page: number;
  totalPages: number;
  handleEdit: (semester: Semester) => void;
  handlePageClick: (page: number) => void;
  handleGetSemesters: () => void;
}

const YearSemesterTable = ({
  semesters,
  academicYears,
  isLoading,
  searchTerm,
  yearFilter,
  setYearFilter,
  page,
  totalPages,
  handlePageClick,
  handleGetSemesters
}: YearSemesterTableProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const filteredSemesters = semesters.filter((semester) => {
    const matchesSearch = semester.name.toLowerCase().includes(searchTerm.toLowerCase()) || semester.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = yearFilter === 'all' || semester.academic_year_code.toLowerCase().includes(yearFilter.toLowerCase());
    return matchesSearch && matchesYear;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const openDeleteDialog = (semester: Semester) => {
    setSelectedSemester(semester);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async (semesterId: string) => {
    setIsDeleteLoading(true);
    try {
      const response = await apiDeleteSemester(semesterId);
      if (response.status === 200) {
        toast.success('Xóa học kỳ thành công');
        setIsDeleteDialogOpen(false);
        handleGetSemesters();
      } else {
        toast.error(response.data.message || 'Xóa học kỳ thất bại');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách học kỳ</CardTitle>
        <CardDescription>Tổng cộng {semesters.length} học kỳ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4 justify-end">
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
                      {semester.is_current === true && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    </div>
                  </TableCell>
                  <TableCell>{semester.academic_year_code}</TableCell>
                  <TableCell>
                    <div>
                      {formatDate(semester.start_date)} - {formatDate(semester.end_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {semester.is_current === true && (
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
                        <DropdownMenuItem onClick={() => openDeleteDialog(semester)} className="text-red-600" disabled={semester.is_current === true}>
                          <Trash2 className="mr-2 h-4 w-4 text-red" />
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
        <CommonDialog
          title="xóa học kỳ"
          itemName={selectedSemester?.name || ''}
          id={selectedSemester?.id || ''}
          onDelete={handleDelete}
          isLoading={isDeleteLoading}
        />
      </AlertDialog>
    </Card>
  );
};

export default YearSemesterTable;
