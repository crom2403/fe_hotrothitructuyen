import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Loader2, Plus, Save, Search } from 'lucide-react';
import type { StudyGroupFormData, StudyGroupInfo } from '@/types/studyGroupType';
import type { UseFormReturn } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useRef, useState } from 'react';
import type { AssignedSubjectByTeacher } from '@/types/subjectType';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { UserInfo } from '@/types/userType';
import type { Semester, Year } from '@/types/year_semesterType';
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiGetAssignedSubjectByTeacher } from '@/services/admin/subject';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';

interface StudyGroupFormDialogProps {
  form: UseFormReturn<StudyGroupFormData>;
  teachers: UserInfo[];
  academicYears: Year[];
  semestersPerYear: Semester[];
  teacherSearchTerm: string;
  setTeacherSearchTerm: (searchTerm: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: StudyGroupFormData) => void;
  isLoading: boolean;
  isLoadingTeachers: boolean;
  isLoadingAcademicYears: boolean;
  isLoadingSemesters: boolean;
  editingStudyGroup: StudyGroupInfo | null;
  setEditingStudyGroup: (studyGroup: StudyGroupInfo | null) => void;
  onYearChange: (academic_year_id: string) => void;
}

const StudyGroupFormDialog = ({
  form,
  teachers,
  academicYears,
  semestersPerYear,
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  isLoadingTeachers,
  isLoadingAcademicYears,
  isLoadingSemesters,
  editingStudyGroup,
  setEditingStudyGroup,
  onYearChange,
  teacherSearchTerm,
  setTeacherSearchTerm,
}: StudyGroupFormDialogProps) => {
  const [openTeacher, setOpenTeacher] = useState(false);
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubjectByTeacher[]>([]);
  const [isLoadingAssignedSubjects, setIsLoadingAssignedSubjects] = useState(false);
  const prevYearRef = useRef<string>('');

  const selectedYear = form.watch('academic_year');
  const selectedTeacher = form.watch('teacher_id');

  const handleGetAssignedSubjects = async (teacherId: string) => {
    if (!teacherId) return;
    setIsLoadingAssignedSubjects(true);
    try {
      const response = await apiGetAssignedSubjectByTeacher(teacherId);
      setAssignedSubjects(response.data);
      if (editingStudyGroup && response.data.some((s) => s.subject.id === editingStudyGroup.subject_id)) {
        form.setValue('subject_id', editingStudyGroup.subject_id);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAssignedSubjects(false);
    }
  };

  useEffect(() => {
    if (selectedTeacher && !editingStudyGroup) {
      handleGetAssignedSubjects(selectedTeacher);
    }
  }, [selectedTeacher, isOpen, editingStudyGroup]);

  useEffect(() => {
    if (isOpen && editingStudyGroup && selectedTeacher) {
      handleGetAssignedSubjects(selectedTeacher);
    }
  }, [isOpen, editingStudyGroup, selectedTeacher]);

  useEffect(() => {
    if (selectedYear && isOpen && selectedYear !== prevYearRef.current && !editingStudyGroup) {
      onYearChange(selectedYear);
      prevYearRef.current = selectedYear;
    }
  }, [selectedYear, isOpen, onYearChange, editingStudyGroup]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary/90 cursor-pointer"
          onClick={() => {
            setEditingStudyGroup(null);
            form.reset({
              name: '',
              subject_id: '',
              academic_year: '',
              semester_id: '',
              teacher_id: '',
              max_students: 0,
              description: '',
            });
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm lớp học phần
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>{editingStudyGroup ? 'Chỉnh sửa lớp học phần' : 'Thêm lớp học phần mới'}</DialogTitle>
          <DialogDescription>{editingStudyGroup ? 'Cập nhật thông tin lớp học phần' : 'Tạo lớp học phần mới vào hệ thống'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên lớp</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="max_students"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng sinh viên tối đa</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="teacher_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giáo viên</FormLabel>
                      <Popover open={openTeacher} onOpenChange={setOpenTeacher}>
                        <PopoverTrigger>
                          <Button
                            disabled={!!editingStudyGroup}
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                          >
                            {isLoadingTeachers ? (
                              <>
                                <span>Đang tải...</span>
                                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              </>
                            ) : (
                              <>
                                {field.value ? teachers.find((teacher) => teacher.id === field.value)?.code + ' - ' + teachers.find((teacher) => teacher.id === field.value)?.name : 'Chọn giáo viên'}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className={cn("w-[400px] max-h-[300px] overflow-y-auto", !!editingStudyGroup && "pointer-events-none")}>
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              type="text"
                              placeholder="Tìm kiếm theo tên, mã giảng viên..."
                              value={teacherSearchTerm}
                              onChange={(e) => setTeacherSearchTerm(e.target.value)}
                              className="pl-10"
                              disabled={!!editingStudyGroup}
                            />
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {isLoadingTeachers ? (
                              <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-7 h-7 animate-spin" />
                              </div>
                            ) : (
                              <ScrollArea className="h-40 w-full">
                                {teachers.map((teacher) => (
                                  <div
                                    key={teacher.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer rounded-md flex items-center"
                                    onClick={() => {
                                      if (!editingStudyGroup) {
                                        form.setValue('teacher_id', teacher.id);
                                        setOpenTeacher(false);
                                      }
                                    }}
                                  >
                                    <Check className={cn('mr-2 h-4 w-4', field.value === teacher.id ? 'opacity-100' : 'opacity-0')} />
                                    {teacher.code} - {teacher.name}
                                  </div>
                                ))}
                              </ScrollArea>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Môn học</FormLabel>
                      <Select
                        onValueChange={(value) => form.setValue('subject_id', value)}
                        value={field.value}
                        disabled={!selectedTeacher || !!editingStudyGroup}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingAssignedSubjects ? 'Đang tải môn học...' : 'Chọn môn học'} />
                        </SelectTrigger>
                        <SelectContent>
                          {assignedSubjects.length > 0 ? (
                            assignedSubjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.subject.id}>
                                {subject.subject.code} - {subject.subject.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-gray-500">Không có môn học</p>
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="academic_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm học</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            form.setValue('academic_year', value);
                            form.setValue('semester_id', '');
                          }}
                          value={field.value}
                          disabled={!!editingStudyGroup}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={isLoadingAcademicYears ? 'Đang tải năm học...' : 'Chọn năm học'} />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.code}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="semester_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>Học kỳ</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => form.setValue('semester_id', value)}
                          value={form.watch('semester_id')}
                          disabled={!form.watch('academic_year') || !!editingStudyGroup}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={form.watch('academic_year') ? (isLoadingSemesters ? 'Đang tải học kỳ...' : 'Chọn học kỳ') : 'Chọn năm học trước'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {semestersPerYear.map((semester) => (
                              <SelectItem key={semester.id} value={semester.id}>
                                {semester.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 cursor-pointer" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingStudyGroup ? 'Cập nhật' : 'Thêm'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StudyGroupFormDialog;