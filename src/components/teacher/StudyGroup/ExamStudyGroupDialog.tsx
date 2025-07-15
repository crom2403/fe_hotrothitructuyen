import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { ExamForStudyGroupItem } from '@/types/examType';
import Pagination from '@/components/common/Pagination';
import Loading from '@/components/common/Loading';
import { Button } from '@/components/ui/button';
import useAppStore from '@/stores/appStore';
import { useNavigate } from 'react-router-dom';
import path from '@/utils/path';

interface ExamListDialogProps {
  exams: ExamForStudyGroupItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  isLoading: boolean;
  page: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

const ExamListDialog = ({ exams, open, setOpen, isLoading, page, totalPages, handlePageChange }: ExamListDialogProps) => {
  const { setExamId, setStudyGroupId } = useAppStore();
  const navigate = useNavigate();

  const handleEnterExamRoom = (examId: string, studyGroupId: string) => {
    setExamId(examId);
    setStudyGroupId(studyGroupId);
    navigate(path.TEACHER.EXAM_ROOM_TEACHER);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-5xl p-6">
        <DialogHeader>
          <DialogTitle>Danh sách đề thi</DialogTitle>
          <DialogDescription>Dưới đây là các đề thi đã được tạo theo nhóm học và môn học.</DialogDescription>
        </DialogHeader>

        <div className="overflow-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loading />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đề</TableHead>
                    <TableHead>Môn học</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Số câu</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams?.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell>{exam.subject_name}</TableCell>
                      <TableCell>
                        {format(new Date(exam.start_time), 'HH:mm dd/MM')} - {format(new Date(exam.end_time), 'HH:mm dd/MM')}
                        <br />
                        <span className="text-xs text-muted-foreground">{exam.duration_minutes} phút</span>
                      </TableCell>
                      <TableCell>{exam.question_count}</TableCell>
                      <TableCell>
                        {/* <Badge variant={exam.opening_status === 'open' ? 'default' : exam.opening_status === 'finished' ? 'destructive' : 'secondary'}>
                          {exam.opening_status === 'open' ? 'Đang mở' : exam.opening_status === 'finished' ? 'Đã kết thúc' : 'Sắp diễn ra'}
                        </Badge> */}
                        {exam.approval_status === 'pending' && <Badge className="bg-amber-100 text-amber-500">Chờ duyệt</Badge>}
                        {exam.approval_status === 'rejected' && <Badge className="bg-red-100 bor text-red-500">Từ chối</Badge>}
                        {exam.approval_status === 'approved' && exam.opening_status === 'open' && exam.test_type === 'exercise' && <Badge className="bg-green-100 bor text-green-500">Đang mở</Badge>}
                        {exam.approval_status === 'approved' && exam.opening_status === 'closed' && <Badge className="bg-purple-100 bor text-purple-500">Đã kết thúc</Badge>}
                        {exam.approval_status === 'approved' && exam.opening_status === 'pending' && <Badge className="bg-yellow-100 bor text-yellow-500">Chờ mở</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{exam.test_type === 'midterm' ? 'Giữa kỳ' : exam.test_type === 'exercise' ? 'Bài tập' : 'Khác'}</Badge>
                      </TableCell>
                      <TableCell>
                        {exam.approval_status === 'approved' && (
                          <>
                            {exam.opening_status === 'open' && exam.test_type !== 'exercise' && (
                              <Button
                                type="button"
                                variant="outline"
                                className="bg-green-500 text-white hover:bg-green-600 hover:text-white"
                                onClick={() => handleEnterExamRoom(exam.id, exam.study_group_id)}
                              >
                                Vào phòng thi
                              </Button>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {exams?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center italic text-gray-400">
                        Không có đề thi nào.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamListDialog;
