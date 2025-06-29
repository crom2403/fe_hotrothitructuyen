import * as React from 'react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { apiGetPermissions } from '@/services/admin/permission';
import type { IPermission } from '@/types/permissionType';
import PermissionTable from '@/components/permissions/PermissionTable';

const PermissionUser: React.FC = () => {
  const [permissions, setPermissions] = useState<IPermission[]>([]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data } = await apiGetPermissions();
      console.log(JSON.stringify(data));
      setPermissions(data.data);
    } catch (error) {
      console.log(error);
      toast.error('Không thể tải danh sách quyền');
    }
  };

  const handleChangePermission = (data: string[]) => {
    console.log(data);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <PermissionTable permissions={permissions} handleChangePermission={handleChangePermission} />
      </Card>
    </div>
  );
};

export default PermissionUser;
