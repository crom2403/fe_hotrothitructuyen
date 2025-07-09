import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { User } from "@/types/userType"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"

interface UserDetailProps {
  user: User | null
  isLoading: boolean
}

const UserDetail = ({ user, isLoading }: UserDetailProps) => {
  return (
    <>
    {isLoading ? (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    ) : (
    <DialogContent className="min-w-[50vw] max-w-[1200px] min-h-[60vh] overflow-y-auto bg-white p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center">Chi tiết người dùng</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-2">
        <Avatar className="w-20 h-20">
          <AvatarImage src={ "/placeholder.svg"} />
          <AvatarFallback>{getInitials(user?.full_name || "")}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="font-semibold text-lg">{user?.full_name}</h2>
          <Badge variant={getRoleVariant(user?.role.name || "student")}>{user?.role.name}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <DetailItem label="Mã người dùng" value={user?.code} />
        <DetailItem label="Email" value={user?.email || "Chưa liên kết email"} />
        <DetailItem label="Số điện thoại" value={user?.phone || "Chưa cập nhật"} />
        <DetailItem label="Giới tính" value={getGenderText(user?.gender)} />
        <DetailItem label="Ngày sinh" value={user?.date_of_birth ? format(new Date(user?.date_of_birth), "dd/MM/yyyy") : "Chưa cập nhật"} />
        <DetailItem label="Trạng thái" value={
          <Badge className={user?.is_active ? "bg-green-500" : "bg-red-500"}>
            {user?.is_active ? "Hoạt động" : "Bị khóa"}
          </Badge>
        } />
        <DetailItem label="Ngày tạo tài khoản" value={user?.created_at ? format(new Date(user?.created_at), "dd/MM/yyyy") : "Chưa cập nhật"} />
      </div>
    </DialogContent>
    )}
    </>
  )
}

const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div>
    <span className="font-semibold block text-gray-900">{label}:</span>
    <span className="text-gray-600">{value}</span>
  </div>
)

const getRoleVariant = (role: string) => {
  switch (role) {
    case "Admin": return "destructive"
    case "Giảng viên": return "default"
    case "Sinh viên": return "secondary"
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