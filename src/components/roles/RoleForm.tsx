import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { apiCreateRole } from '@/services/admin/role';
import type { CreateRoleRequest } from '@/types/roleType';

const roleSchema = z.object({
  name: z.string().min(1, 'Tên vai trò là bắt buộc'),
  code: z.string().min(1, 'Mã vai trò là bắt buộc'),
  description: z.string().optional(),
  is_system: z.boolean().default(false),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleFormProps {
  onSuccess: () => void;
  setOpen?: (open: boolean) => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ onSuccess, setOpen }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      is_system: false,
    },
  });

  const onSubmit = async (formData: RoleFormData) => {
    try {
      const roleData: CreateRoleRequest = {
        ...formData,
      };
      await apiCreateRole(roleData);
      toast.success('Tạo vai trò thành công');
      onSuccess();
      setOpen?.(false);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tạo vai trò');
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Tạo vai trò mới</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Tên vai trò</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="code">Mã vai trò</Label>
          <Input id="code" {...register('code')} />
          {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Mô tả</Label>
          <Textarea id="description" {...register('description')} />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="is_system" {...register('is_system')} className="rounded border-gray-300 text-primary focus:ring-primary" />
          <Label htmlFor="is_system">Vai trò hệ thống</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen?.(false)}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default RoleForm;
