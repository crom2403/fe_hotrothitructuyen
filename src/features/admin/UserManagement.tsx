import UserFormDialog from "@/components/admin/user/UserFormDialog"
import UserTable from "@/components/admin/user/UserTable"
import { apiGetUsers } from "@/services/admin/user"
import type { UserFormData, UserInfoResponse, UserResponse } from "@/types/userType"
import { zodResolver } from "@hookform/resolvers/zod"
import type { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const userSchema = z.object({
  code: z.string().min(1, "Vui lòng nhập mã người dùng"),
  email: z.string().optional(),
  full_name: z.string().min(1, "Vui lòng nhập họ và tên"),
  role: z.enum(["admin", "teacher", "student"], {
    required_error: "Vui lòng chọn vai trò",
  }),
  phone: z.string().optional(),
  date_of_birth: z.date(),
  gender: z.enum(["male", "female"]),
})

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserInfoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<UserResponse | null>(null)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      code: "",
      full_name: "",
      role: "student",
      phone: "",
      date_of_birth: new Date(),
      gender: "male",
    },
  })

  useEffect(() => {
    handleGetUsers()
  }, [page, roleFilter])

  const handleGetUsers = async () => {
    setIsLoading(true)
    try {
      const apiRoleFilter = roleFilter === "" ? "all" : roleFilter;
      const response = await apiGetUsers(page, apiRoleFilter)
      if (response.status === 200) {
        setUsers(response.data)
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string, error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: UserFormData) => {
    console.log(data)
  }

  const handleEdit = (user: UserInfoResponse) => {
    setEditingUser(user as any)
    setIsDialogOpen(true)
  }

  const handleToggleStatus = async (userId: string) => {
    console.log(userId)
  }

  const handleDelete = async (userId: string) => {
    console.log(userId)
  }

  const handlePageClick = (page: number) => {
    setPage(page)
    console.log(page)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-500">Quản lý tài khoản sinh viên, giáo viên và quản trị viên</p>
        </div>
        <UserFormDialog
          form={form}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          editingUser={editingUser as any}
          setEditingUser={setEditingUser as any}
          onSubmit={handleSubmit}
          isLoading={isLoading}
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
          handleToggleStatus={handleToggleStatus}
          handleDelete={handleDelete}
          handlePageClick={handlePageClick}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default UserManagement