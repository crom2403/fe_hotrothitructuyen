import UserFormDialog from '@/components/admin/user/UserFormDialog';
import UserTable from '@/components/admin/user/UserTable';
import { apiBLockUser, apiCreateUser, apiGetUserDetail, apiGetUsers, apiUpdateUser } from '@/services/admin/user';
import type { User, UserFormData, UserInfo, UserResponse } from '@/types/userType';
import { useDebounce } from '@/utils/functions';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const userSchema = z.object({
  code: z.string().min(1, 'Vui lòng nhập mã người dùng'),
  email: z.string().optional(),
  full_name: z.string().min(1, 'Vui lòng nhập họ và tên'),
  role_code: z.enum(['admin', 'teacher', 'student'], {
    required_error: 'Vui lòng chọn vai trò',
  }),
  phone_number: z.string().optional(),
  date_of_birth: z.date().refine(
    (date) => {
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();
      const d = today.getDate() - date.getDate();

      const isAtLeast18 = age > 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));

      return isAtLeast18;
    },
    {
      message: 'Người dùng phải ít nhất 18 tuổi',
    },
  ),
  gender: z.enum(['male', 'female']),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<UserResponse | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema) as any,
    defaultValues: {
      code: '',
      full_name: '',
      role_code: 'student',
      phone_number: '',
      date_of_birth: new Date(),
      gender: 'male',
      password: '',
    },
  });

  useEffect(() => {
    handleGetUsers();
  }, [page, roleFilter, debouncedSearchTerm]);

  const handleGetUsers = async () => {
    setIsLoading(true);
    try {
      const apiRoleFilter = roleFilter === '' ? 'all' : roleFilter;
      const response = await apiGetUsers(page, apiRoleFilter, debouncedSearchTerm);
      if (response.status === 200) {
        setUsers(response.data);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: UserFormData) => {
    setIsLoadingSubmit(true);
    try {
      const formattedData = {
        ...data,
        date_of_birth: data.date_of_birth.toISOString().split('T')[0],
      };

      if (editingUser) {
        const updateData = {
          code: formattedData.code,
          full_name: formattedData.full_name,
          role_code: formattedData.role_code,
          phone_number: formattedData.phone_number,
          date_of_birth: formattedData.date_of_birth,
          gender: formattedData.gender,
        };
        const response = await apiUpdateUser(editingUser.id, updateData);
        if (response.status === 200) {
          toast.success('Cập nhật người dùng thành công');
          handleGetUsers();
          setIsDialogOpen(false);
          form.reset({
            code: '',
            full_name: '',
            role_code: 'student',
            phone_number: '',
            date_of_birth: new Date(),
            gender: 'male',
            password: '',
          });
        }
      } else {
        const response = await apiCreateUser(formattedData);
        if (response.status === 200) {
          toast.success('Tạo người dùng thành công');
          handleGetUsers();
          setIsDialogOpen(false);
          form.reset({
            code: '',
            full_name: '',
            role_code: 'student',
            phone_number: '',
            date_of_birth: new Date(),
            gender: 'male',
            password: '',
          });
        }
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleEdit = async (user: UserInfo) => {
    setIsLoadingEdit(true);
    try {
      const response = await apiGetUserDetail(user.id);
      if (response.status === 200) {
        const userData = response.data;
        setEditingUser(userData);
        form.reset({
          code: userData.code,
          full_name: userData.full_name,
          role_code: userData.role.code as 'admin' | 'teacher' | 'student',
          phone_number: userData.phone || '',
          date_of_birth: userData.date_of_birth ? new Date(userData.date_of_birth) : new Date(),
          gender: userData.gender as 'male' | 'female',
          password: '123456',
        });
        setIsDialogOpen(true);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handlePageClick = (page: number) => {
    setPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-500">Quản lý tài khoản sinh viên, giáo viên và quản trị viên</p>
        </div>
        <UserFormDialog
          form={form as any}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          onSubmit={handleSubmit}
          isLoading={isLoadingSubmit}
        />
      </div>
      <div>
        <UserTable
          users={users?.data || []}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          page={page}
          totalPages={users?.metadata.last_page || 0}
          handleEdit={handleEdit}
          handlePageClick={handlePageClick}
          isLoading={isLoading}
          handleGetUsers={handleGetUsers}
          isLoadingEdit={isLoadingEdit}
        />
      </div>
    </div>
  );
};

export default UserManagement;
