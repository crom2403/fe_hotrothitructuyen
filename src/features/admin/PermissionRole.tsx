import PermissionTable from '@/components/permissions/PermissionTable';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiAssignPermissionRole, apiGetPermissionByRole } from '@/services/admin/permission';
import { apiGetRoles } from '@/services/admin/role';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface IRole {
  id: string;
  code: string;
  name: string;
}

const PermissionRole = () => {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<IRole | null>(null);

  const handleChangePermission = async (data: string[]) => {
    if (!selectedRole) return;
    try {
      await apiAssignPermissionRole(selectedRole.id, data);
      toast.success('Cập nhật quyền thành công');
      // Tải lại permissions sau khi lưu
      fetchPermissions();
    } catch (error) {
      console.error(error);
      toast.error('Không thể cập nhật quyền');
    }
  };

  const handleGetRoles = async () => {
    try {
      const response = await apiGetRoles();
      console.log('handleGetRoles', response);
      setRoles(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách vai trò');
    }
  };

  const fetchPermissions = async () => {
    if (!selectedRole) return;
    try {
      const { data } = await apiGetPermissionByRole(selectedRole.id);
      console.log('fetchPermissions', data);
      setPermissions(data.map((permission) => permission));
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách quyền');
    }
  };

  // Tải danh sách roles khi component mount
  useEffect(() => {
    handleGetRoles();
  }, []);

  // Thiết lập role đầu tiên làm mặc định khi roles được cập nhật
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // Tải permissions khi selectedRole thay đổi
  useEffect(() => {
    if (selectedRole) {
      fetchPermissions();
    }
  }, [selectedRole]);

  return (
    <div>
      <Card>
        <Select value={selectedRole?.id || ''} onValueChange={(value) => setSelectedRole(roles.find((role) => role.id === value) || null)}>
          <div className="flex items-center justify-between px-6">
            <h1 className="text-2xl font-bold">Phân quyền vai trò</h1>
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
          </div>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <PermissionTable permissions={permissions} handleChangePermission={handleChangePermission} />
      </Card>
    </div>
  );
};

export default PermissionRole;
