import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { User } from "@/types/userType"
import { format } from "date-fns"

interface UserDetailProps {
  user: User | null
}

const UserDetail = ({ user }: UserDetailProps) => {
  return (
    <DialogContent className="min-w-[50vw] max-w-[1200px] min-h-[60vh] overflow-y-auto bg-white p-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">Chi tiết người dùng</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-2">
        <Avatar className="w-20 h-20">
          <AvatarImage src={user?.avatar || "/placeholder.svg"} />
          <AvatarFallback>{getInitials(user?.fullName || "")}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-semibold text-lg">{user?.fullName}</h2>
          <Badge variant={getRoleVariant(user?.role || "student")}>{getRoleText(user?.role || "student")}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <DetailItem label="Mã người dùng" value={user?.code} />
        <DetailItem label="Email" value={user?.email} />
        <DetailItem label="Số điện thoại" value={user?.phone || "Chưa cập nhật"} />
        <DetailItem label="Giới tính" value={getGenderText(user?.gender)} />
        <DetailItem label="Ngày sinh" value={user?.birthDate ? format(new Date(user?.birthDate), "dd/MM/yyyy") : "Chưa cập nhật"} />
        <DetailItem label="Trạng thái" value={
          <Badge className={user?.isActive ? "bg-green-500" : "bg-red-500"}>
            {user?.isActive ? "Hoạt động" : "Bị khóa"}
          </Badge>
        } />
        <DetailItem label="Ngày tạo tài khoản" value={user?.createdAt} />
      </div>
    </DialogContent>
  )
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div>
    <span className="font-semibold block text-gray-900">{label}:</span>
    <span className="text-gray-600">{value}</span>
  </div>
)

const getRoleText = (role: User["role"]) => {
  switch (role) {
    case "admin": return "Quản trị viên"
    case "teacher": return "Giáo viên"
    case "student": return "Sinh viên"
    default: return role
  }
}

const getRoleVariant = (role: User["role"]) => {
  switch (role) {
    case "admin": return "destructive"
    case "teacher": return "default"
    case "student": return "secondary"
    default: return "outline"
  }
}

const getGenderText = (gender?: User["gender"]) => {
  if (!gender) return "Chưa cập nhật"
  return gender === "male" ? "Nam" : "Nữ"
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}


export default UserDetail