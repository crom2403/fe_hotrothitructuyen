import StudyGroupFormDialog from "@/components/admin/study_group/StudyGroupFormDialog";
import StudyGroupTable from "@/components/admin/study_group/StudyGroupTable";
import type { StudyGroupFormData, StudyGroupInfo, StudyGroupResponse } from "@/types/studyGroupType";
import type { Semester, Year } from "@/types/year_semesterType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { SubjectResponse } from "@/types/subjectType";
import { apiGetSubjects } from "@/services/admin/subject";
import { apiGetAcademicYears, apiGetSemestersByYear } from "@/services/admin/yearSemester";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { apiGetUsers } from "@/services/admin/user";
import type { UserResponse } from "@/types/userType";
import { apiCreateStudyGroup, apiDeleteStudyGroup, apiGetAllStudyGroup } from "@/services/admin/studyGroup";
import { useDebounce } from "@/utils/functions";

const studyGroupSchema = z.object({
  name: z.string().min(1, "Tên lớp không được để trống"),
  subject_id: z.string().min(1, "Vui lòng chọn môn học"),
  academic_year: z.string().min(1, "Vui lòng chọn năm học"),
  semester_id: z.string().min(1, "Vui lòng chọn học kỳ"),
  teacher_id: z.string().min(1, "Vui lòng chọn giáo viên"),
  max_students: z.number().min(1, "Số sinh viên tối đa phải lớn hơn 0"),
  description: z.string().optional(),
});

const StudyGroupManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingStudyGroup, setEditingStudyGroup] = useState<StudyGroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingAcademicYears, setIsLoadingAcademicYears] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [page, setPage] = useState(1);  
  const [subjectResponse, setSubjectResponse] = useState<SubjectResponse | null>(null);
  const [semestersPerYear, setSemestersPerYear] = useState<Semester[]>([]);
  const [academicYears, setAcademicYears] = useState<Year[]>([]);
  const [teachers, setTeachers] = useState<UserResponse | null>(null);
  const [studyGroups, setStudyGroups] = useState<StudyGroupResponse | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const form = useForm<z.infer<typeof studyGroupSchema>>({
    resolver: zodResolver(studyGroupSchema),
    defaultValues: {
      name: "",
      subject_id: "",
      academic_year: "",
      semester_id: "",
      teacher_id: "",
      max_students: 0,
      description: "",
    },
  });

  useEffect(() => {
    handleGetStudyGroups();
  }, [page, debouncedSearchTerm, subjectFilter, yearFilter]);

  useEffect(() => {
    handleGetSubjects();
    handleGetAcademicYears();
  }, []);

  useEffect(() => {
    if (isOpen) {
      handleGetTeachers();
    }
  }, [isOpen, teacherSearchTerm]);

  const handleGetStudyGroups = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetAllStudyGroup(page, debouncedSearchTerm, subjectFilter, yearFilter);
      if (response.status === 200) {
        setStudyGroups(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const response = await apiGetSubjects(1, undefined, undefined, 100);
      if (response.status === 200) {
        setSubjectResponse(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const handleGetSemesterPerYear = useCallback(
    async (year_id: string) => {
      setIsLoadingSemesters(true);
      try {
        const year = academicYears.find((y) => y.id === year_id);
        if (!year) {
          setSemestersPerYear([]);
          return;
        }
        const response = await apiGetSemestersByYear(year.id);
        if (response.status === 200) {
          setSemestersPerYear(response.data.data || []);
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ message: string; error: string }>;
        const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
        toast.error(errorMessage);
        setSemestersPerYear([]);
      } finally {
        setIsLoadingSemesters(false);
      }
    },
    [academicYears]
  );

  const handleGetAcademicYears = async () => {
    setIsLoadingAcademicYears(true);
    try {
      const response = await apiGetAcademicYears();
      if (response.status === 200) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingAcademicYears(false);
    }
  };

  const handleGetTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const response = await apiGetUsers(1, "teacher", teacherSearchTerm, 100);
      if (response.status === 200) {
        setTeachers(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const handleSubmit = async (data: StudyGroupFormData) => {
    setIsLoadingSubmit(true);
    try {
      const { academic_year, ...payload } = data;
      const response = await apiCreateStudyGroup(payload);
      if (response.status === 201) {
        toast.success("Lớp học phần đã được tạo thành công");
        handleGetStudyGroups();
        setIsOpen(false);
        form.reset({
          name: "",
          subject_id: "",
          academic_year: "",
          semester_id: "",
          teacher_id: "",
          max_students: 0,
          description: "",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleEdit = (studyGroup: StudyGroupInfo) => {
    setEditingStudyGroup(studyGroup);
    form.reset({
      name: studyGroup.study_group_name,
      subject_id: subjectResponse?.data.find((s) => s.name === studyGroup.subject_name)?.id || "",
      academic_year: studyGroup.academic_year_code,
      semester_id: semestersPerYear.find((s) => s.name === studyGroup.semester_name)?.id || "",
      teacher_id: teachers?.data.find((t) => t.name === studyGroup.teacher_full_name)?.id || "",
      max_students: studyGroup.study_group_max_students,
      description: studyGroup.study_group_description || "",
    });
    setIsOpen(true);
  };

  const handleDelete = async (studyGroupId: string) => {
    setIsLoading(true);
    try {
      const response = await apiDeleteStudyGroup(studyGroupId);
      if (response.status === 200) {
        toast.success("Lớp học phần đã được xóa thành công");
        handleGetStudyGroups();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageClick = (page: number) => {
    setPage(page);
  };

  const handleToggleStatus = (studyGroupId: string, isActive: boolean) => {
    console.log(studyGroupId, isActive);
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý lớp học phần</h1>
          <p className="text-gray-500">Tạo và quản lý các lớp học phần trong hệ thống</p>
        </div>
        <StudyGroupFormDialog
          form={form}
          teachers={teachers?.data || []}
          academicYears={academicYears}
          semestersPerYear={semestersPerYear}
          teacherSearchTerm={teacherSearchTerm}
          setTeacherSearchTerm={setTeacherSearchTerm}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSubmit={handleSubmit}
          isLoading={isLoadingSubmit}
          isLoadingTeachers={isLoadingTeachers}
          isLoadingAcademicYears={isLoadingAcademicYears}
          isLoadingSemesters={isLoadingSemesters}
          editingStudyGroup={editingStudyGroup}
          setEditingStudyGroup={setEditingStudyGroup}
          onYearChange={handleGetSemesterPerYear}
        />
      </div>
      <div>
        <StudyGroupTable
          isLoading={isLoading}
          studyGroups={studyGroups?.data || []}
          subjects={subjectResponse?.data || []}
          academicYears={academicYears}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          subjectFilter={subjectFilter}
          setSubjectFilter={setSubjectFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          isLoadingSubjects={isLoadingSubjects} 
          isLoadingAcademicYears={isLoadingAcademicYears}
          page={page}
          totalPages={studyGroups?.metadata.last_page || 1}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handlePageClick={handlePageClick}
          handleToggleStatus={handleToggleStatus}
          copyInviteCode={copyInviteCode}
        />
      </div>
    </div>
  );
};

export default StudyGroupManagement;
