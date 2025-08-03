import type { Subject } from '@/types/subjectType';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Edit, Search, MoreHorizontal, Trash2, Eye, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Paginate from '@/components/common/Pagination';
import { Badge } from '@/components/ui/badge';
import SubjectDetail from '@/components/admin/subject/SubjectDetail';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import DeleteDialog from '@/components/common/CommonDialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import Loading from '@/components/common/Loading';

interface SubjectTableProps {
  subjects: Subject[];
  subjectCount: number;
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  statusFilter: string;
  setStatusFilter: (statusFilter: string) => void;
  isLoading: boolean;
  page: number;
  totalPages: number;
  handleEdit: (subject: Subject) => void;
  handleDelete: (subjectId: string) => Promise<void>;
  handlePageClick: (page: number) => void;
  handleToggleStatus: (subjectId: string, is_active: boolean) => void;
}

const SubjectTable = ({
  subjects,
  subjectCount,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isLoading,
  page,
  totalPages,
  handleEdit,
  handleDelete,
  handlePageClick,
  handleToggleStatus,
}: SubjectTableProps) => {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const getStatusBadge = (status: boolean) => {
    if (status === true) {
      return (
        <Badge variant="outline" className="bg-green-500 text-white">
          Hoạt động
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-300 text-black">
          Không hoạt động
        </Badge>
      );
    }
  };

  const openDetailDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDetailDialogOpen(true);
  };

  const openDeleteDialog = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách môn học</CardTitle>
        <CardDescription>Tổng cộng {subjectCount} môn học</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input type="text" placeholder="Tìm kiếm môn học" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-[210px] w-[120px]">
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="flex justify-center items-center h-32">
                  <Loading />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>
                    {subject.theory_hours > 0 ? `${subject.theory_hours} lý thuyết` : ''} {subject.practice_hours > 0 ? `${subject.practice_hours} thực hành` : ''}
                  </TableCell>
                  <TableCell>{getStatusBadge(subject.is_active)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailDialog(subject)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(subject)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(subject.id, subject.is_active)}>
                          <BookOpen className="mr-2 h-4 w-4" />
                          {subject.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteDialog(subject)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
        {subjects.length === 0 && !isLoading && <div className="text-center py-8 text-gray-500">Không tìm thấy môn học nào</div>}
        <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />

        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <SubjectDetail subject={selectedSubject} />
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DeleteDialog title="xóa" itemName="môn học" id={selectedSubject?.id || ''} onDelete={() => handleDelete(selectedSubject?.id || '')} />
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default SubjectTable;
