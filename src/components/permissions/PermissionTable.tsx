import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { IPermission } from '@/types/permissionType';
import { SelectTrigger } from '@/components/ui/select';

interface PermissionTableProps {
  permissions: IPermission[];
  handleChangePermission: (data: string[]) => void;
}

// Danh sách các hành động
const actions = [
  { code: 'read', label: 'Xem' },
  { code: 'create', label: 'Thêm' },
  { code: 'update', label: 'Sửa' },
  { code: 'delete', label: 'Xóa' },
  { code: 'approve', label: 'Duyệt' },
  { code: 'assign', label: 'Phân quyền' },
];

// Danh sách các tài nguyên
const resources = [
  { code: 'user', label: 'Người dùng', disable_actions: ['approve'] },
  { code: 'role', label: 'Vai trò', disable_actions: ['approve'] },
  { code: 'permission', label: 'Quyền', disable_actions: ['approve'] },
  { code: 'academic_year', label: 'Năm học', disable_actions: ['approve'] },
  { code: 'semester', label: 'Học kỳ', disable_actions: ['approve'] },
  { code: 'subject', label: 'Môn học', disable_actions: ['approve'] },
  { code: 'teacher_subject', label: 'Giáo viên môn học', disable_actions: ['approve'] },
  { code: 'study_group', label: 'Nhóm học phần', disable_actions: ['approve'] },
  { code: 'question', label: 'Câu hỏi' },
  { code: 'exam', label: 'Đề thi', disable_actions: ['approve'] },
];

const PermissionTable: React.FC<PermissionTableProps> = ({ permissions, handleChangePermission }) => {
  // Khởi tạo permissionStates bằng useMemo để tránh tính toán lại mỗi lần render
  const initialPermissionStates = useMemo(() => {
    const state: Record<string, Record<string, boolean>> = {};
    resources.forEach((resource) => {
      state[resource.code] = {};
      actions.forEach((action) => {
        const permissionExists = permissions.some((perm) => perm.code === `${resource.code}.${action.code}`);
        state[resource.code][action.code] = permissionExists;
      });
    });
    return state;
  }, [permissions]);

  const [permissionStates, setPermissionStates] = useState(initialPermissionStates);

  // Cập nhật permissionStates khi permissions thay đổi
  useEffect(() => {
    setPermissionStates(initialPermissionStates);
  }, [initialPermissionStates]);

  // Hàm xử lý khi checkbox thay đổi
  const handleCheckboxChange = (resourceCode: string, action: string, checked: boolean) => {
    setPermissionStates((prev) => ({
      ...prev,
      [resourceCode]: {
        ...prev[resourceCode],
        [action]: checked,
      },
    }));
  };

  // Hàm xử lý khi nhấn nút Lưu
  const handleSave = () => {
    const updatedPermissions: string[] = [];
    Object.keys(permissionStates).forEach((resourceCode) => {
      Object.keys(permissionStates[resourceCode]).forEach((action) => {
        if (permissionStates[resourceCode][action]) {
          updatedPermissions.push(`${resourceCode}.${action}`);
        }
      });
    });
    handleChangePermission(updatedPermissions);
  };

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên Module</TableHead>
            {actions.map((action) => (
              <TableHead key={action.code}>{action.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.code}>
              <TableCell>{resource.label}</TableCell>
              {actions.map((action) => {
                const isDisabled = resource.disable_actions?.includes(action.code) || false;
                return (
                  <TableCell key={`${resource.code}-${action.code}`}>
                    <Checkbox
                      checked={permissionStates[resource.code]?.[action.code] || false}
                      onCheckedChange={(checked) => handleCheckboxChange(resource.code, action.code, checked as boolean)}
                      disabled={isDisabled}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave}>
        Lưu
      </button>
    </div>
  );
};

export default PermissionTable;
