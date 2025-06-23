import type { User, UserInfoResponse } from "@/types/userType";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Edit, MoreHorizontal, Search, Unlock, Lock, Trash2, Eye, Loader2 } from "lucide-react";
import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Badge } from "../../ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import Paginate from "../../common/Pagination";
import { useState } from "react";
import { Dialog } from "../../ui/dialog";
import UserDetail from "./UserDetail";

interface UserTableProps {
  users: UserInfoResponse[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  page: number;
  totalPages: number;
  handleEdit: (user: UserInfoResponse) => void;
  handleToggleStatus: (userId: string) => Promise<void>;
  handleDelete: (userId: string) => Promise<void>;
  handlePageClick: (page: number) => void;
  isLoading: boolean;
}

const UserTable = ({ users, searchTerm, setSearchTerm, roleFilter, setRoleFilter, page, totalPages, handleEdit, handleToggleStatus, handleDelete, handlePageClick, isLoading }: UserTableProps) => {
  const [isOpenDetailUser, setIsOpenDetailUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInfoResponse | null>(null)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role_code === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "teacher":
        return "default";
      case "student":
        return "secondary";
      default:
        return "outline";
    }
  };

  const openDetailUser = (user: UserInfoResponse) => {
    setSelectedUser(user)
    setIsOpenDetailUser(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách người dùng</CardTitle>
        <CardDescription>Tổng cộng {users.length} người dùng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên, mã số hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Quản trị viên</SelectItem>
              <SelectItem value="teacher">Giáo viên</SelectItem>
              <SelectItem value="student">Sinh viên</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã người dùng</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-10 h-10 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.code}>
                  <TableCell className="font-medium">{user.code}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role_code) as any}>{user.role_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(user.is_active ? "bg-green-500" : "bg-red-500")}>
                      {user.is_active ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDetailUser(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(user.code)}>
                          {user.is_active ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Khóa tài khoản
                            </>
                          ) : (
                            <>
                              <Unlock className="mr-2 h-4 w-4" />
                              Mở khóa
                            </>
                          )}
                        </DropdownMenuItem>
                        {user.role_code !== "admin" && (
                          <DropdownMenuItem onClick={() => handleDelete(user.code)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 && !isLoading && (
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">Không tìm thấy người dùng nào</TableCell>
            </TableRow>
          </TableBody>
        )}
        <Paginate page={page} totalPages={totalPages} onPageChange={handlePageClick} />

        {/* <Dialog open={isOpenDetailUser} onOpenChange={setIsOpenDetailUser}>
          <UserDetail user={selectedUser} />
        </Dialog> */}
      </CardContent>
    </Card>
  )
}

export default UserTable