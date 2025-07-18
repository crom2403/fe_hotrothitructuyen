import React, { useState, useEffect, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface PermissionTableProps {
  permissions: string[]; // Ví dụ: ['user.create', 'role.read']
  handleChangePermission: (data: string[]) => void;
}

// Danh sách các hành động (không có add và remove)
const actions = [
  { code: 'read', label: 'Xem' },
  { code: 'create', label: 'Thêm' },
  { code: 'update', label: 'Sửa' },
  { code: 'delete', label: 'Xóa' },
  { code: 'approve', label: 'Duyệt' },
  { code: 'assign', label: 'Gán' },
];

// Danh sách các tài nguyên
const resources = [
  { code: 'user', label: 'Người dùng', disable_actions: ['approve', 'assign'] },
  { code: 'role', label: 'Vai trò', disable_actions: ['approve', 'assign'] },
  { code: 'permission', label: 'Quyền', disable_actions: ['approve'] },
  { code: 'academic_year', label: 'Năm học', disable_actions: ['approve', 'assign'] },
  { code: 'semester', label: 'Học kỳ', disable_actions: ['approve', 'assign'] },
  { code: 'subject', label: 'Môn học', disable_actions: ['approve', 'assign'] },
  { code: 'teacher_subject', label: 'Giáo viên môn học', disable_actions: ['create', 'update', 'approve'] },
  { code: 'study_group', label: 'Nhóm học phần', disable_actions: ['approve', 'assign'] },
  { code: 'group_student', label: 'Sinh viên nhóm', disable_actions: ['update', 'approve', 'assign'] },
  { code: 'question', label: 'Câu hỏi', disable_actions: ['assign'] },
  { code: 'exam', label: 'Đề thi', disable_actions: [] },
  { code: 'exam_config', label: 'Cấu hình đề thi', disable_actions: ['approve', 'assign'] },
];

const PermissionTable: React.FC<PermissionTableProps> = ({ permissions, handleChangePermission }) => {
  // Khởi tạo permissionStates bằng useMemo
  const initialPermissionStates = useMemo(() => {
    const state: Record<string, Record<string, boolean>> = {};
    resources.forEach((resource) => {
      state[resource.code] = {};
      actions.forEach((action) => {
        let permissionCode = `${resource.code}.${action.code}`;
        if (resource.code === 'group_student' && action.code === 'create') {
          permissionCode = `${resource.code}.create`; // Ánh xạ group_student.create
        } else if (resource.code === 'teacher_subject' && action.code === 'assign') {
          permissionCode = `${resource.code}.assign`; // Ánh xạ teacher_subject.assign
        } else if (resource.code === 'teacher_subject' && action.code === 'delete') {
          permissionCode = `${resource.code}.delete`; // Ánh xạ teacher_subject.delete
        } else if (resource.code === 'permission' && action.code === 'assign') {
          permissionCode = `${resource.code}.assign`; // Ánh xạ permission.assign
        } else if (resource.code === 'permission' && action.code === 'delete') {
          permissionCode = `${resource.code}.remove`; // Ánh xạ permission.remove thành delete
        } else if (resource.code === 'exam' && action.code === 'assign') {
          permissionCode = `${resource.code}.assign`; // Ánh xạ exam.assign
        }
        state[resource.code][action.code] = permissions.includes(permissionCode);
      });
    });
    return state;
  }, [permissions]);

  const [permissionStates, setPermissionStates] = useState(initialPermissionStates);

  // Cập nhật permissionStates khi permissions thay đổi
  useEffect(() => {
    setPermissionStates(initialPermissionStates);
  }, [initialPermissionStates]);

  // Xử lý thay đổi checkbox
  const handleCheckboxChange = (resourceCode: string, action: string, checked: boolean) => {
    setPermissionStates((prev) => ({
      ...prev,
      [resourceCode]: {
        ...prev[resourceCode],
        [action]: checked,
      },
    }));
  };

  // Xử lý khi nhấn nút Lưu
  const handleSave = () => {
    const updatedPermissions: string[] = [];
    Object.keys(permissionStates).forEach((resourceCode) => {
      Object.keys(permissionStates[resourceCode]).forEach((action) => {
        if (permissionStates[resourceCode][action]) {
          let permissionCode = `${resourceCode}.${action}`;
          if (resourceCode === 'group_student' && action === 'create') {
            permissionCode = `${resourceCode}.create`; // Ánh xạ group_student.create
          } else if (resourceCode === 'teacher_subject' && action === 'assign') {
            permissionCode = `${resourceCode}.assign`; // Ánh xạ teacher_subject.assign
          } else if (resourceCode === 'teacher_subject' && action === 'delete') {
            permissionCode = `${resourceCode}.delete`; // Ánh xạ teacher_subject.delete
          } else if (resourceCode === 'permission' && action === 'assign') {
            permissionCode = `${resourceCode}.assign`; // Ánh xạ permission.assign
          } else if (resourceCode === 'permission' && action === 'delete') {
            permissionCode = `${resourceCode}.remove`; // Ánh xạ permission.remove
          } else if (resourceCode === 'exam' && action === 'assign') {
            permissionCode = `${resourceCode}.assign`; // Ánh xạ exam.assign
          }
          updatedPermissions.push(permissionCode);
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
                      className="cursor-pointer"
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
      <div className="w-full flex justify-end">
        <Button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded " onClick={handleSave}>
          Lưu
        </Button>
      </div>
    </div>
  );
};

export default PermissionTable;
