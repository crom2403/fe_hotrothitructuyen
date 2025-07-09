import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import type { Role } from '@/types/roleType';
import { apiGetRoles, apiDeleteRole } from '@/services/admin/role';
import RoleForm from './RoleForm';

import { Dialog, DialogTrigger } from '@/components/ui/dialog';

const RoleList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response: any = await apiGetRoles();
      if (response.data) {
        setRoles(response.data.data);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách vai trò');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteRole(id);
      toast.success('Xóa vai trò thành công');
      fetchRoles();
    } catch (error) {
      toast.error('Không thể xóa vai trò');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Danh sách vai trò</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Tạo vai trò mới</Button>
          </DialogTrigger>
          <RoleForm onSuccess={fetchRoles} setOpen={setIsCreateOpen} />
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Hệ thống</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.code}</TableCell>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.description || 'Không có'}</TableCell>
              <TableCell>{role.is_system ? 'Có' : 'Không'}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Chỉnh sửa</Button>
                    </DialogTrigger>
                    <RoleForm role={role} onSuccess={fetchRoles} />
                  </Dialog>
                  <Dialog open={isAssignOpen === role.id} onOpenChange={(open) => setIsAssignOpen(open ? role.id : null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Gán quyền</Button>
                    </DialogTrigger>
                    {/* <AssignPermission roleId={role.id} onSuccess={fetchRoles} setOpen={() => setIsAssignOpen(null)} /> */}
                  </Dialog>
                  <Button variant="destructive" onClick={() => handleDelete(role.id)}>
                    Xóa
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoleList;
