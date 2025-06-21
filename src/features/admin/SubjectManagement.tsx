import SubjectFormDialog from "@/components/admin/subject/SubjectFormDialog";
import SubjectTable from "@/components/admin/subject/SubjectTable";
import { apiCreateSubject, apiDeleteSubject, apiGetSubjects, apiToggleStatusSubject } from "@/services/admin/subject";
import type { Subject, SubjectFormData } from "@/types/subjectType";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const SubjectSchema = z.object({
  code: z.string().min(1, { message: "Mã môn học là bắt buộc" }),
  name: z.string().min(1, { message: "Tên môn học là bắt buộc" }),
  credits: z.number().min(1, { message: "Số tín chỉ là bắt buộc" }),
  theory_hours: z.number().optional().default(0),
  practice_hours: z.number().optional().default(0),
  description: z.string().optional().default(""),
})

export interface SubjectResponse {
  data: Subject[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
}

const SubjectManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectResponse, setSubjectResponse] = useState<SubjectResponse | null>(null);

  useEffect(() => {
    handleGetSubjects()
  }, [page, statusFilter, searchTerm])

  const handleGetSubjects = async () => {
    setIsLoading(true)
    const response = await apiGetSubjects(page, statusFilter, searchTerm)
    if (response.status === 200) {
      setSubjectResponse(response.data)
    }
    setIsLoading(false)
  }

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(SubjectSchema),
    defaultValues: {
      code: "",
      name: "",
      credits: 0,
      theory_hours: 0,
      practice_hours: 0,
      description: "",
    }
  })

  const handleSubmit = async (data: SubjectFormData) => {
    setIsLoading(true)
    try {
      const response = await apiCreateSubject(data)
      if (response.status === 201) {
        toast.success("Thêm môn học thành công")
        setIsDialogOpen(false)
        form.reset()
        handleGetSubjects()
      } else {
        toast.error(response.data.message || "Thêm môn học thất bại")
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsDialogOpen(true);
    form.reset({
      code: subject.code,
      name: subject.name,
      credits: subject.credits,
      theory_hours: subject.theory_hours ?? 0,
      practice_hours: subject.practice_hours ?? 0,
      description: subject.description ?? "",
    });
  }

  const handleDelete = async (subjectId: string) => {
    console.log(subjectId)
    setIsLoading(true)
    try {
      const response = await apiDeleteSubject(subjectId)
      if (response.status === 200) {
        toast.success("Xóa môn học thành công")
        handleGetSubjects()
      } else {
        toast.error(response.data.message || "Xóa môn học thất bại")
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (subjectId: string, is_active: boolean) => {
    setIsLoading(true);
    try {
      console.log("Toggling status for subject:", { subjectId, newStatus: !is_active });
      const response = await apiToggleStatusSubject(subjectId, !is_active);
      if (response.status === 200) {
        toast.success("Cập nhật trạng thái thành công");
        handleGetSubjects();
      } else {
        toast.error(response.data.message || "Cập nhật trạng thái thất bại");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handlePageClick = (page: number) => {
    setPage(page)
  }

  return (
    <div className="space-y-6">
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý môn học</h1>
          <p>Quản lý danh sách môn học trong chương trình đào tạo</p>
        </div>
        <SubjectFormDialog
          form={form}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          editingSubject={editingSubject}
          setEditingSubject={setEditingSubject}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
      <div>
        <SubjectTable
          subjects={subjectResponse?.data || []}
          subjectCount={subjectResponse?.metadata.total || 0}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isLoading={isLoading}
          page={subjectResponse?.metadata.page || 1}
          totalPages={subjectResponse?.metadata.last_page || 1}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handlePageClick={handlePageClick}
          handleToggleStatus={handleToggleStatus}
        />
      </div>
    </div>
  )
}

export default SubjectManagement;