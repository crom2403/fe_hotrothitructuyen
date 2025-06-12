import UserFormDialog from "@/components/admin/UserFormDialog"
import UserTable from "@/components/admin/UserTable"
import type { User, UserFormData } from "@/types/userType"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const userSchema = z.object({
  code: z.string().min(1, "Vui lòng nhập mã người dùng"),
  email: z.string().email("Email không hợp lệ"),
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  role: z.enum(["admin", "teacher", "student"], {
    required_error: "Vui lòng chọn vai trò",
  }),
  phone: z.string().optional(),
})

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(0)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      code: "",
      email: "",
      fullName: "",
      role: "student",
      phone: "",
    },
  })

  const [users, setUsers] = useState<User[]>([
    {
      code: "1",
      username: "admin",
      email: "admin@university.edu.vn",
      fullName: "Quản trị viên",
      role: "admin",
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      code: "2",
      username: "teacher1",
      email: "teacher1@university.edu.vn",
      fullName: "Nguyễn Văn A",
      role: "teacher",
      phone: "0123456789",
      isActive: true,
      createdAt: "2024-01-02T00:00:00Z",
    },
    {
      code: "3",
      username: "student1",
      email: "student1@university.edu.vn",
      fullName: "Trần Thị B",
      role: "student",
      phone: "0987654321",
      isActive: false,
      createdAt: "2024-01-03T00:00:00Z",
    },
  ])

  const handleSubmit = async (data: UserFormData) => {
    console.log(data)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
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
          editingUser={editingUser}
          setEditingUser={setEditingUser}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
      <div>
        <UserTable
          users={users}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          page={page}
          setPage={setPage}
          totalPages={100}
          handleEdit={handleEdit}
          handleToggleStatus={handleToggleStatus}
          handleDelete={handleDelete}
          handlePageClick={handlePageClick}
        />
      </div>
    </div>
  )
}

export default UserManagement