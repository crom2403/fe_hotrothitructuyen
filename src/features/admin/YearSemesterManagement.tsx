import SemesterFormDialog from "@/components/admin/SemesterFormDialog"
import YearFormDialog from "@/components/admin/YearFormDialog"
import YearSemesterTable from "@/components/admin/YearSemesterTable"
import type { Semester, Year } from "@/types/year_semesterType"
import { zodResolver } from "@hookform/resolvers/zod"
import { differenceInMonths } from "date-fns"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const yearFormSchema = z.object({
  start_year: z.number().min(1900).max(new Date().getFullYear() + 5),
  end_year: z.number().min(1900).max(new Date().getFullYear() + 5),
}).refine((data) => data.start_year <= data.end_year, {
  message: "Năm bắt đầu phải nhỏ hơn năm kết thúc",
  path: ["end_year"],
})

const semesterFormSchema = z
  .object({
    name: z.string().min(1, "Vui lòng chọn học kỳ"),
    code: z.string().min(1, "Mã học kỳ là bắt buộc"),
    year: z.string().min(1, "Vui lòng chọn năm học"),
    start_date: z.date(),
    end_date: z.date(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        const isChronologicallyValid = data.start_date <= data.end_date;
        const monthDiff = differenceInMonths(data.end_date, data.start_date);
        const isInRange = monthDiff >= 4 && monthDiff <= 5;
        return isChronologicallyValid && isInRange;
      }
      return true;
    },
    {
      message: "Thời gian học kỳ phải kéo dài từ 4 đến 5 tháng",
      path: ["end_date"],
    }
  );

type YearForm = z.infer<typeof yearFormSchema>
type SemesterForm = z.infer<typeof semesterFormSchema>

const YearSemesterManagement = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isYearFormDialogOpen, setIsYearFormDialogOpen] = useState(false)
  const [isSemesterFormDialogOpen, setIsSemesterFormDialogOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [yearFilter, setYearFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: "1",
      name: "Học kỳ 1",
      code: "HK1_2024",
      year_name: "2024-2025",
      start_date: "2024-09-01",
      end_date: "2024-12-31",
      is_current: true,
    },
    {
      id: "2",
      name: "Học kỳ 2",
      code: "HK2_2024",
      year_name: "2024-2025",
      start_date: "2025-01-15",
      end_date: "2025-05-31",
      is_current: false,
    },
    {
      id: "3",
      name: "Học kỳ hè",
      code: "HKH_2024",
      year_name: "2024-2025",
      start_date: "2025-06-01",
      end_date: "2025-08-31",
      is_current: false,
    },
  ])

  const yearForm = useForm<YearForm>({
    resolver: zodResolver(yearFormSchema),
    defaultValues: {
      start_year: new Date().getFullYear(),
      end_year: new Date().getFullYear() + 1,
    },
  })

  const semesterForm = useForm<SemesterForm>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: {
      name: "",
      code: "",
      year: "",
      start_date: undefined,
      end_date: undefined,
    },
  })

  const handleYearFormSubmit = async (data: YearForm) => {
    console.log(data)
  }

  const handleSemesterFormSubmit = async (data: SemesterForm) => {
    console.log(data)
  }

  const academicYears: Year[] = [
    {
      id: "1",
      code: "2024-2025",
      start_year: 2024,
      end_year: 2025,
      is_current: true,
    },
    {
      id: "2",
      code: "2025-2026",
      start_year: 2025,
      end_year: 2026,
      is_current: false,
    },
    {
      id: "3",
      code: "2026-2027",
      start_year: 2026,
      end_year: 2027,
      is_current: false,
    },
  ]

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester)
    setIsSemesterFormDialogOpen(true)
  }

  const handleDelete = (semesterId: string) => {
    console.log(semesterId)
  }

  const handlePageClick = (page: number) => {
    setPage(page)
  }

  const handleSetCurrent = (semesterId: string) => {
    console.log(semesterId)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý năm học & học kỳ</h1>
          <p>Quản lý thời gian học tập trong chương trình đào tạo</p>
        </div>
        <div className="flex gap-2">
          <YearFormDialog
            form={yearForm}
            isDialogOpen={isYearFormDialogOpen}
            setIsDialogOpen={setIsYearFormDialogOpen}
            onSubmit={handleYearFormSubmit}
            isLoading={isLoading}
          />
          <SemesterFormDialog
            form={semesterForm}
            years={academicYears}
            isDialogOpen={isSemesterFormDialogOpen}
            setIsDialogOpen={setIsSemesterFormDialogOpen}
            onSubmit={handleSemesterFormSubmit}
            isLoading={isLoading}
            editingSemester={editingSemester}
            setEditingSemester={setEditingSemester}
          />
        </div>
      </div>
      <div>
        <YearSemesterTable
          semesters={semesters}
          academicYears={academicYears}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          page={page}
          totalPages={100}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handlePageClick={handlePageClick}
          handleSetCurrent={handleSetCurrent}
        />
      </div>
    </div>
  )
}

export default YearSemesterManagement