import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useAuthStore from "@/stores/authStore";
import type { StudyGroupDetail } from "@/types/studyGroupType";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface StudyGroupDetailDialogProps {
  studyGroup: StudyGroupDetail | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  onRemoveStudent?: (studentCodes: string[]) => void;
  isLoading: boolean;
}

const StudyGroupDetailDialog = ({ studyGroup, open, setOpen, onRemoveStudent, isLoading }: StudyGroupDetailDialogProps) => {
  const { currentUser } = useAuthStore();

  const formatDate = (iso: string): string => new Date(iso).toLocaleDateString("vi-VN");

  const [selectedStudentCodes, setSelectedStudentCodes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (!studyGroup) {
      setSelectedStudentCodes([]);
      setSelectAll(false);
    } else if (studyGroup.students.length > 0) {
      setSelectAll(selectedStudentCodes.length === studyGroup.students.length);
    }
  }, [studyGroup, selectedStudentCodes.length]);

  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedStudentCodes([]);
    } else {
      setSelectedStudentCodes(studyGroup?.students.map(student => student.student.code) || []);
    }
    setSelectAll(!selectAll);
  };

  const handleToggleStudent = (studentCode: string) => {
    setSelectedStudentCodes(prev =>
      prev.includes(studentCode)
        ? prev.filter(code => code !== studentCode)
        : [...prev, studentCode]
    );
    setSelectAll(
      studyGroup?.students.length === selectedStudentCodes.length + 1 && !selectedStudentCodes.includes(studentCode)
    );
  };

  const handleRemoveSelected = () => {
    if (onRemoveStudent && selectedStudentCodes.length > 0) {
      onRemoveStudent(selectedStudentCodes);
      setSelectedStudentCodes([]);
      setSelectAll(false);
    }
  };

  if (!studyGroup) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết lớp học phần</DialogTitle>
          <DialogDescription>
            Xem thông tin lớp học phần và danh sách sinh viên
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        )}
        {!isLoading && (
          <>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tên lớp học phần</p>
                  <p className="font-medium">{studyGroup.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mã lớp / Mã mời</p>
                  <p className="font-medium">{studyGroup.code} / {studyGroup.invite_code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Môn học</p>
                  <p className="font-medium">{studyGroup.subject.name} ({studyGroup.subject.code})</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Học kỳ - Năm học</p>
                  <p className="font-medium">{studyGroup.semester.name} - {studyGroup.semester.academic_year.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>
                  <p className="font-medium">
                    {formatDate(studyGroup.semester.start_date)} → {formatDate(studyGroup.semester.end_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giảng viên</p>
                  <p className="font-medium">{studyGroup.teacher.full_name}</p>
                  <p className="text-sm text-muted-foreground">{studyGroup.teacher.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số lượng tối đa</p>
                  <p className="font-medium">{studyGroup.max_students} sinh viên</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mô tả</p>
                  <p className="font-medium">{studyGroup.description || "Không có"}</p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Danh sách sinh viên ({studyGroup.students.length})</h3>
                {currentUser?.role_code === "teacher" && (
                  <Button
                    variant="destructive"
                    onClick={handleRemoveSelected}
                    disabled={selectedStudentCodes.length === 0 || isLoading}
                  >
                    Xóa sinh viên
                  </Button>
                )}
              </div>
              <ScrollArea className="h-fit rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleToggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>STT</TableHead>
                      <TableHead>Mã SV</TableHead>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studyGroup.students.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedStudentCodes.includes(item.student.code)}
                            onChange={() => handleToggleStudent(item.student.code)}
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.student.code}</Badge>
                        </TableCell>
                        <TableCell>{item.student.full_name}</TableCell>
                        <TableCell>{item.student.email || "—"}</TableCell>
                        <TableCell>{formatDate(item.joined_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StudyGroupDetailDialog;