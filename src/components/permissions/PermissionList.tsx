import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { IPermission } from '@/types/permissionType';
import { Resource } from '@/enums';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PermissionListProps {
  permissions: IPermission[];
  onSelect?: (permission: IPermission) => void;
  selectedPermissions?: string[];
}

const PermissionList: React.FC<PermissionListProps> = ({ permissions, onSelect, selectedPermissions = [] }) => {
  const [search, setSearch] = React.useState('');
  const [moduleFilter, setModuleFilter] = React.useState<string>('');

  const filteredPermissions = React.useMemo(() => {
    return permissions.filter((permission) => {
      const matchesSearch =
        search.trim() === '' ||
        permission.name.toLowerCase().includes(search.toLowerCase()) ||
        permission.code.toLowerCase().includes(search.toLowerCase()) ||
        permission.description?.toLowerCase().includes(search.toLowerCase());

      const matchesModule = moduleFilter === '' || permission.module === moduleFilter;

      return matchesSearch && matchesModule;
    });
  }, [permissions, search, moduleFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (!onSelect) return;

    filteredPermissions.forEach((permission) => {
      if (checked && !selectedPermissions.includes(permission.id)) {
        onSelect(permission);
      } else if (!checked && selectedPermissions.includes(permission.id)) {
        onSelect(permission);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="search">Tìm kiếm</Label>
          <Input id="search" placeholder="Tìm theo tên, mã hoặc mô tả..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-[200px]">
          <Label htmlFor="module">Lọc theo module</Label>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả module</SelectItem>
              {Object.values(Resource).map((resource) => (
                <SelectItem key={resource} value={resource}>
                  {resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên quyền</TableHead>
              <TableHead>Module</TableHead>
              {onSelect && (
                <TableHead className="w-[50px] text-center">
                  <div className="flex items-center justify-center">
                    <Checkbox checked={filteredPermissions.length > 0 && filteredPermissions.every((p) => selectedPermissions.includes(p.id))} onCheckedChange={handleSelectAll} />
                  </div>
                </TableHead>
              )}
              <TableHead>Mã quyền</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead className="w-[100px] text-center">Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{permission.module}</Badge>
                </TableCell>
                {onSelect && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox checked={selectedPermissions.includes(permission.id)} onCheckedChange={() => onSelect(permission)} />
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-center">
                  <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">{permission.code}</code>
                </TableCell>
                <TableCell className="text-center">
                  <Badge>{permission.action}</Badge>
                </TableCell>
                <TableCell className="max-w-[300px] truncate">{permission.description}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    {permission.is_system && <Badge variant="secondary">Hệ thống</Badge>}
                    {!permission.is_active && <Badge variant="destructive">Vô hiệu</Badge>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredPermissions.length === 0 && (
              <TableRow>
                <TableCell colSpan={onSelect ? 7 : 6} className="h-24 text-center">
                  Không tìm thấy quyền nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default PermissionList;
