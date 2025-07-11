import DeleteDialog from '@/components/common/DeleteDialog';
import Loading from '@/components/common/Loading';
import Paginate from '@/components/common/Pagination';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TableCell, TableBody, TableHead, TableHeader, TableRow, Table } from '@/components/ui/table';
import type { StudyGroupInfo } from '@/types/studyGroupType';
import type { Subject } from '@/types/subjectType';
import type { Year } from '@/types/year_semesterType';
import { Copy, Edit, GraduationCap, Loader2, MoreHorizontal, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

interface StudyGroupTableProps {
  studyGroups: StudyGroupInfo[];
  subjects: Subject[];
  academicYears: Year[];
  searchTerm: string;
  setSearchTerm: (searchTerm: string) => void;
  subjectFilter: string;
  setSubjectFilter: (subjectFilter: string) => void;
  yearFilter: string;
  setYearFilter: (yearFilter: string) => void;
  page: number;
  totalPages: number;
  handleEdit: (studyGroup: StudyGroupInfo) => void;
  handleDelete: (studyGroupId: string) => void;
  handlePageClick: (page: number) => void;
  handleToggleStatus: (studyGroupId: string, isActive: boolean) => void;
  copyInviteCode: (inviteCode: string) => void;
  isLoading: boolean;
  isLoadingSubjects: boolean;
  isLoadingAcademicYears: boolean;
}

const StudyGroupTable = ({
  studyGroups,
  subjects,
  academicYears,
  searchTerm,
  setSearchTerm,
  setSubjectFilter,
  setYearFilter,
  page,
  totalPages,
  handleEdit,
  handleDelete,
  handlePageClick,
  handleToggleStatus,
  copyInviteCode,
  isLoading,
  isLoadingSubjects,
  isLoadingAcademicYears,
}: StudyGroupTableProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<StudyGroupInfo | null>(null);

  const openDeleteDialog = (classItem: StudyGroupInfo) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Danh sách lớp học phần</CardTitle>
        <CardDescription>Tổng cộng {studyGroups.length} lớp học phần</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input type="text" placeholder="Tìm kiếm theo tên, mã lớp hoặc giáo viên..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select onValueChange={(value) => setSubjectFilter(value)} disabled={isLoadingSubjects}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo môn học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả môn học</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setYearFilter(value)} disabled={isLoadingAcademicYears}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo năm học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả năm học</SelectItem>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto max-w-[1130px]">
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex justify-center items-center h-32">
                      <Loading />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                studyGroups.map((classItem) => (
                  <TableRow key={classItem.study_group_id}>
                    <TableCell className="font-medium">{classItem.study_group_code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{classItem.study_group_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{classItem.subject_name}</TableCell>
                    <TableCell>{classItem.teacher_full_name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{classItem.academic_year_code}</div>
                        <div className="text-gray-500">{classItem.semester_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>
                          {classItem.student_count} / {classItem.study_group_max_students}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{classItem.study_group_invite_code}</code>
                        <Button variant="ghost" size="sm" onClick={() => copyInviteCode(classItem.study_group_invite_code)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={classItem.study_group_is_active ? 'default' : 'secondary'}>{classItem.study_group_is_active ? 'Hoạt động' : 'Không hoạt động'}</Badge>
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
                          <DropdownMenuItem onClick={() => handleToggleStatus(classItem.study_group_id, classItem.study_group_is_active)}>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            {classItem.study_group_is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(classItem)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
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
        </div>
        {studyGroups.length === 0 && !isLoading && <div className="text-center py-8 text-gray-500">Không tìm thấy lớp học phần nào</div>}
        <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DeleteDialog itemName="lớp học phần" id={selectedClass?.study_group_id || ''} onDelete={handleDelete} />
      </AlertDialog>
    </Card>
  );
};

export default StudyGroupTable;
