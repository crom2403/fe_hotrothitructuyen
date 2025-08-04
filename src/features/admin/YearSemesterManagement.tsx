import SemesterFormDialog from '@/components/admin/year_semester/SemesterFormDialog';
import YearFormDialog from '@/components/admin/year_semester/YearFormDialog';
import YearSemesterTable from '@/components/admin/year_semester/YearSemesterTable';
import { apiCreateAcademicYear, apiCreateSemester, apiDeleteSemester, apiGetAcademicYears, apiGetSemesters } from '@/services/admin/yearSemester';
import type { Semester, Year } from '@/types/year_semesterType';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { differenceInMonths, format } from 'date-fns';
import { set } from 'lodash';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const yearFormSchema = z
  .object({
    start_year: z
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 5),
    end_year: z
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 5),
  })
  .refine((data) => data.start_year <= data.end_year, {
    message: 'Năm bắt đầu phải nhỏ hơn năm kết thúc',
    path: ['end_year'],
  });

const semesterFormSchema = z
  .object({
    name: z.string().min(1, 'Bắt buộc chọn học kỳ'),
    code: z.string().min(1, 'Bắt buộc chọn mã học kỳ'),
    year: z.string().min(1, 'Bắt buộc chọn năm học'),
    start_date: z.date().refine((date) => date !== undefined && date !== null, {
      message: 'Bắt buộc chọn ngày bắt đầu',
      path: ['start_date'],
    }),
    end_date: z.date().refine((date) => date !== undefined && date !== null, {
      message: 'Bắt buộc chọn ngày kết thúc',
      path: ['end_date'],
    }),
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
      message: 'Thời gian học kỳ phải kéo dài từ 4 đến 5 tháng',
      path: ['end_date'],
    },
  );

type YearForm = z.infer<typeof yearFormSchema>;
type SemesterForm = z.infer<typeof semesterFormSchema>;

interface SemesterResponse {
  data: Semester[];
  metadata: {
    size: number;
    page: number;
    last_page: number;
    total: number;
  };
}

const YearSemesterManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<Year[]>([]);
  const [isYearFormDialogOpen, setIsYearFormDialogOpen] = useState(false);
  const [isSemesterFormDialogOpen, setIsSemesterFormDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [semesterResponse, setSemesterResponse] = useState<SemesterResponse | null>(null);
  const [isYearLoading, setIsYearLoading] = useState(false);
  const [isSemesterLoading, setIsSemesterLoading] = useState(false);

  const yearForm = useForm<YearForm>({
    resolver: zodResolver(yearFormSchema),
    defaultValues: {
      start_year: new Date().getFullYear(),
      end_year: new Date().getFullYear() + 1,
    },
  });

  const semesterForm = useForm<SemesterForm>({
    resolver: zodResolver(semesterFormSchema),
    defaultValues: {
      name: '',
      code: '',
      year: '',
      start_date: undefined,
      end_date: undefined,
    },
  });

  useEffect(() => {
    handleGetAcademicYears();
  }, [isSemesterFormDialogOpen]);

  const handleYearFormSubmit = async (data: YearForm) => {
    // console.log(data);
    setIsYearLoading(true);
    try {
      const response = await apiCreateAcademicYear(data);
      if (response.status === 200) {
        toast.success('Tạo năm học thành công');
        handleGetAcademicYears();
        setIsYearFormDialogOpen(false);
        yearForm.reset();
        handleGetAcademicYears();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsYearLoading(false);
    }
  };

  useEffect(() => {
    handleGetSemesters();
  }, [page, yearFilter]);

  const handleGetSemesters = async () => {
    setIsLoading(true);
    try {
      const response = await apiGetSemesters(page, yearFilter);
      if (response.status === 200) {
        setSemesterResponse(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSemesterFormSubmit = async (data: SemesterForm) => {
    setIsSemesterLoading(true);
    try {
      const dataRequest = {
        name: data.name,
        code: data.code,
        academic_year_id: data.year,
        start_date: format(data.start_date || new Date(), 'yyyy-MM-dd'),
        end_date: format(data.end_date || new Date(), 'yyyy-MM-dd'),
      }
      // console.log(dataRequest);
      const response = await apiCreateSemester(dataRequest);
      if(response.status === 200) {
        toast.success('Tạo mới học kỳ thành công');
        setIsSemesterFormDialogOpen(false);
        semesterForm.reset({
          name: '',
          code: '',
          year: '',
          start_date: undefined,
          end_date: undefined,
        });
        handleGetSemesters();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsSemesterLoading(false);
    }
  };

  const handleGetAcademicYears = async () => {
    try {
      const response = await apiGetAcademicYears();
      if (response.status === 200) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (semester: Semester) => {
    setEditingSemester(semester);
    setIsSemesterFormDialogOpen(true);
  };



  const handlePageClick = (page: number) => {
    setPage(page);
  };

  return (
    <div className="space-y-6 md:w-full w-[380px] overflow-x-scroll">
      <div className="flex items-center justify-between md:flex-row flex-col">
        <div>
          <h1 className="text-2xl font-bold">Quản lý năm học & học kỳ</h1>
          <p>Quản lý thời gian học tập trong chương trình đào tạo</p>
        </div>
        <div className="md:w-fit w-full flex gap-2 md:justify-end justify-start md:mt-0 mt-2">
          <YearFormDialog form={yearForm as any} isDialogOpen={isYearFormDialogOpen} setIsDialogOpen={setIsYearFormDialogOpen} onSubmit={handleYearFormSubmit} isLoading={isYearLoading} />
          <SemesterFormDialog
            form={semesterForm as any}
            years={academicYears}
            isDialogOpen={isSemesterFormDialogOpen}
            setIsDialogOpen={setIsSemesterFormDialogOpen}
            onSubmit={handleSemesterFormSubmit}
            isLoading={isSemesterLoading}
            editingSemester={editingSemester}
            setEditingSemester={setEditingSemester}
          />
        </div>
      </div>
      <div>
        <YearSemesterTable
          semesters={semesterResponse?.data || []}
          academicYears={academicYears}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isLoading={isLoading}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          page={semesterResponse?.metadata.page || 1}
          totalPages={semesterResponse?.metadata.last_page || 1}
          handleEdit={handleEdit}
          handlePageClick={handlePageClick}
          handleGetSemesters={handleGetSemesters}
        />
      </div>
    </div>
  );
};

export default YearSemesterManagement;
