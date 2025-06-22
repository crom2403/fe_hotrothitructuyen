import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Loader2, Plus, Save } from "lucide-react"
import type { StudyGroup, StudyGroupFormData } from "@/types/studyGroup"
import type { UseFormReturn } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Subject } from "@/types/subjectType"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import type { UserInfoResponse } from "@/types/userType"
import type { Semester, Year } from "@/types/year_semesterType"
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from "@/components/ui/select"

interface StudyGroupFormDialogProps {
  form: UseFormReturn<StudyGroupFormData>
  subjects: Subject[]
  teachers: UserInfoResponse[]
  academicYears: Year[]
  semestersPerYear: Semester[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: StudyGroupFormData) => void
  isLoading: boolean
  isLoadingSubjects: boolean
  isLoadingTeachers: boolean
  isLoadingAcademicYears: boolean
  isLoadingSemesters: boolean
  editingStudyGroup: StudyGroup | null
  setEditingStudyGroup: (studyGroup: StudyGroup | null) => void
  onYearChange: (academic_year_id: string) => void
}

const StudyGroupFormDialog = ({ form, subjects, teachers, academicYears, semestersPerYear, isOpen, onOpenChange, onSubmit, isLoading, isLoadingSubjects, isLoadingTeachers, isLoadingAcademicYears, isLoadingSemesters, editingStudyGroup, setEditingStudyGroup, onYearChange }: StudyGroupFormDialogProps) => {
  const [searchSubject, setSearchSubject] = useState("")
  const [searchTeacher, setSearchTeacher] = useState("")
  const [openSubject, setOpenSubject] = useState(false)
  const [openTeacher, setOpenTeacher] = useState(false)
  const prevYearRef = useRef<string>("");

  const filteredSubjects = useMemo(
    () =>
      subjects.filter((subject) =>
        subject.name.toLowerCase().includes(searchSubject.toLowerCase())
      ),
    [subjects, searchSubject]
  );

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        if (!teacher.name) return false;
        const normalizedName = teacher.name.normalize("NFC").toLowerCase();
        const normalizedSearch = searchTeacher.normalize("NFC").toLowerCase();
        return normalizedName.includes(normalizedSearch);
      }),
    [teachers, searchTeacher]
  );

  const selectedYear = form.watch("academic_year");

  useEffect(() => {
    if (selectedYear && isOpen && selectedYear !== prevYearRef.current) {
      onYearChange(selectedYear);
      prevYearRef.current = selectedYear;
    }
  }, [selectedYear, isOpen, onYearChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger>
        <Button className="bg-black hover:bg-black/80"
          onClick={() => {
            setEditingStudyGroup(null)
            form.reset()
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm lớp học phần
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>{editingStudyGroup ? "Chỉnh sửa lớp học phần" : "Thêm lớp học phần mới"}</DialogTitle>
          <DialogDescription>
            {editingStudyGroup ? "Cập nhật thông tin lớp học phần" : "Tạo lớp học phần mới vào hệ thống"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã lớp</FormLabel>
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
                        <Input {...field} type="number"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
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
                  name="subject_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Môn học</FormLabel>
                      <Popover open={openSubject} onOpenChange={setOpenSubject}>
                        <PopoverTrigger>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {isLoadingSubjects ? (
                                <>
                                  <span>Đang tải...</span>
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                </>
                              ) : (
                                <>
                                  {field.value
                                    ? subjects.find((subject) => subject.id === field.value)?.name
                                    : "Chọn môn học"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] max-h-[300px] overflow-y-auto">
                          <Command>
                            <CommandInput
                              placeholder="Tìm kiếm môn học..."
                              value={searchSubject}
                              onValueChange={setSearchSubject}
                            />
                            <CommandEmpty>Không tìm thấy môn học.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                              {filteredSubjects.map((subject) => (
                                <CommandItem
                                  key={subject.id}
                                  value={subject.id}
                                  onSelect={() => {
                                    form.setValue("subject_id", subject.id);
                                    setOpenSubject(false);
                                    setSearchSubject("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === subject.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {subject.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
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
                  name="teacher_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giáo viên</FormLabel>
                      <Popover open={openTeacher} onOpenChange={setOpenTeacher}>
                        <PopoverTrigger>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {isLoadingTeachers ? (
                                <>
                                  <span>Đang tải...</span>
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                </>
                              ) : (
                                <>
                                  {field.value
                                    ? teachers.find((teacher) => teacher.id === field.value)?.name
                                    : "Chọn giáo viên"}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] max-h-[300px] overflow-y-auto">
                          <Command>
                            <CommandInput
                              placeholder="Tìm kiếm giáo viên..."
                              value={searchTeacher}
                              onValueChange={setSearchTeacher}
                            />
                            <CommandEmpty>Không tìm thấy giáo viên.</CommandEmpty>
                            <CommandGroup className="max-h-[200px] overflow-y-auto">
                              {filteredTeachers.map((teacher) => (
                                <CommandItem
                                  key={teacher.id}
                                  value={teacher.id}
                                  onSelect={() => {
                                    form.setValue("teacher_id", teacher.id);
                                    setOpenTeacher(false);
                                    setSearchTeacher("");
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === teacher.code ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {teacher.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
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
                            form.setValue("academic_year", value);
                            form.setValue("semester_id", "");
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={isLoadingAcademicYears ? "Đang tải năm học..." : "Chọn năm học"} />
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học kỳ</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => form.setValue("semester_id", value)}
                          value={form.watch("semester_id")}
                          disabled={!form.watch("academic_year")}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={form.watch("academic_year") ? (isLoadingSemesters ? "Đang tải học kỳ..." : "Chọn học kỳ") : "Chọn năm học trước"} />
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
              <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" className="bg-black hover:bg-black/80" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingStudyGroup ? "Cập nhật" : "Thêm"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default StudyGroupFormDialog