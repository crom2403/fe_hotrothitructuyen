import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiAssignSubject, apiGetSubjects } from "@/services/admin/subject";
import { apiGetUsers } from "@/services/admin/user";
import type { Subject, SubjectResponse } from "@/types/subjectType";
import type { UserInfo, UserResponse } from "@/types/userType";
import type { AxiosError } from "axios";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AssignedSubjectResponse } from "@/types/subjectType";

interface AssignSubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getAssignSubject: () => void;
  assignedSubjects?: AssignedSubjectResponse | null;
}

const AssignSubjectDialog = ({ open, onOpenChange, getAssignSubject, assignedSubjects }: AssignSubjectDialogProps) => {
  const [teachers, setTeachers] = useState<UserResponse | null>(null);
  const [subjects, setSubjects] = useState<SubjectResponse | null>(null);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchSubject, setSearchSubject] = useState("");
  const [openTeacher, setOpenTeacher] = useState(false);
  const [openSubject, setOpenSubject] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<UserInfo | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectTeacher = (teacher: UserInfo) => {
    setSelectedTeacher(teacher);
    setOpenTeacher(false);
    if (assignedSubjects) {
      const assignedSubjectsForTeacher = assignedSubjects.data.filter(
        (as) => as.teacher.id === teacher.id
      ).map((as) => ({
        id: as.subject.id,
        code: as.subject.code,
        name: as.subject.name,
        credits: 0,
        theory_hours: 0,
        practice_hours: 0,
        is_active: true,
      }));
      setSelectedSubjects(assignedSubjectsForTeacher);
    }
  };

  const handleGetTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await apiGetUsers(1, "teacher", searchTeacher, 100);
      setTeachers(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const handleGetSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const response = await apiGetSubjects(1, "active", searchSubject, 100);
      setSubjects(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  useEffect(() => {
    handleGetTeachers();
    handleGetSubjects();
  }, [searchTeacher, searchSubject]);

  const handleToggleSubject = (subject: Subject) => {
    setSelectedSubjects((prev) => {
      const isSelected = prev.some((s) => s.code === subject.code);
      if (isSelected) {
        return prev.filter((s) => s.code !== subject.code);
      } else {
        return [...prev, subject];
      }
    });
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher || selectedSubjects.length === 0) {
      toast.error("Vui lòng chọn giảng viên và ít nhất một môn học!");
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        teacherId: selectedTeacher.id,
        listSubjectId: selectedSubjects.map((subject) => subject.id),
      };
      const response = await apiAssignSubject(data);
      if (response.status === 200) {
        toast.success("Phân công thành công!");
        onOpenChange(false);
        getAssignSubject();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-black/80">
          <UserPlus className="w-4 h-4" />
          Phân công
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phân công môn học</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-medium">Chọn giảng viên</p>
            <Popover open={openTeacher} onOpenChange={(open) => {
              setOpenTeacher(open);
              if (!open) setSearchTeacher("");
            }}>
              <PopoverTrigger className="w-full">
                <Button
                  variant="outline"
                  disabled={isLoadingTeachers}
                  className="w-full justify-between"
                >
                  {selectedTeacher
                    ? `${selectedTeacher.code} - ${selectedTeacher.name}`
                    : "Chọn giảng viên"}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[450px] p-2 space-y-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên, mã giảng viên..."
                    value={searchTeacher}
                    onChange={(e) => setSearchTeacher(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {isLoadingTeachers ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {teachers?.data.map((teacher) => (
                        <div key={teacher.id} className="flex items-center justify-between">
                          <p>{teacher.code} - {teacher.name}</p>
                          <Button variant="outline" size="icon" onClick={() => handleSelectTeacher(teacher)}>
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Chọn môn học</p>
            {selectedTeacher ? <Popover open={openSubject} onOpenChange={(open) => {
              setOpenSubject(open);
              if (!open) setSearchSubject("");
            }}>
              <PopoverTrigger className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  disabled={isLoadingSubjects || !selectedTeacher}
                >
                  {selectedSubjects.length > 0
                    ? `${selectedSubjects.length} môn học được chọn`
                    : "Chọn môn học"}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="min-w-[450px] p-2 space-y-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên, mã môn học..."
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {isLoadingSubjects ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                  ) : (
                    <ScrollArea className="h-40 w-full">
                      {subjects?.data && subjects.data.length > 0 ? (
                        subjects.data.map((subject) => (
                          <div
                            key={subject.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center"
                            onClick={() => handleToggleSubject(subject)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubjects.some((s) => s.code === subject.code)}
                              onChange={() => handleToggleSubject(subject)}
                              className="mr-2"
                            />
                            {`${subject.code} - ${subject.name}`}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500 text-center">Không tìm thấy môn học</div>
                      )}
                    </ScrollArea>
                  )}
                </div>
              </PopoverContent>
            </Popover> : (
              <div className="flex items-center h-full">
                <p className="text-gray-500 text-xs">Vui lòng chọn giảng viên trước</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <div className="flex justify-between space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <div className="flex space-x-2">
              <Button
                type="button"
                className="bg-black hover:bg-black/80"
                onClick={handleAssignTeacher}
                disabled={!selectedSubjects || isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Phân công"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignSubjectDialog;