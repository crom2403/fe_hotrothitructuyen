import SubjectFormDialog from "@/components/admin/SubjectFormDialog";
import SubjectTable from "@/components/admin/SubjectTable";
import type { Subject, SubjectFormData } from "@/types/subjectType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const SubjectSchema = z.object({
  code: z.string().min(1, { message: "Mã môn học là bắt buộc" }),
  name: z.string().min(1, { message: "Tên môn học là bắt buộc" }),
  credits: z.number().min(1, { message: "Số tín chỉ là bắt buộc" }),
  theoryHours: z.number().min(1, { message: "Số tiết lý thuyết là bắt buộc" }),
  practiceHours: z.number().min(1, { message: "Số tiết thực hành là bắt buộc" }),
})

const SubjectManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: "1",
      code: "MATH101",
      name: "Toán học cơ bản",
      credits: 3,
      description: "Giới thiệu các khái niệm toán học cơ bản",
      theoryHours: 30,
      practiceHours: 10,
      status: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      code: "CS101",
      name: "Lập trình cơ bản",
      credits: 4,
      description: "Học lập trình với Python",
      theoryHours: 20,
      practiceHours: 20,
      status: true,
      createdAt: "2024-01-02T00:00:00Z",
    },
    {
      id: "3",
      code: "PHY101",
      name: "Vật lý đại cương",
      credits: 3,
      description: "Cơ học cổ điển",
      theoryHours: 25,
      practiceHours: 5,
      status: false,
      createdAt: "2024-01-03T00:00:00Z",
    },
  ])

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(SubjectSchema),
    defaultValues: {
      code: "",
      name: "",
      credits: 0,
      theoryHours: 0,
      practiceHours: 0,
    }
  })

  const handleSubmit = async (data: SubjectFormData) => {
    console.log(data)
  }

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setIsDialogOpen(true)
    form.reset()
  }

  const handleDelete = async (subjectId: string) => {
    console.log(subjectId)
  }

  const handleToggleStatus = async (subjectId: string) => {
    console.log(subjectId)
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
          subjects={subjects}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          page={page}
          setPage={setPage}
          totalPages={100}
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