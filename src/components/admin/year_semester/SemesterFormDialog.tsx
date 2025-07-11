import { useEffect } from 'react';
import type { Semester, SemesterForm, Year } from '@/types/year_semesterType';
import type { UseFormReturn } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, PlusIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '../../ui/calendar';

interface SemesterFormDialogProps {
  form: UseFormReturn<SemesterForm>;
  years: Year[];
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingSemester: Semester | null;
  setEditingSemester: (semester: Semester | null) => void;
  onSubmit: (data: SemesterForm) => Promise<void>;
  isLoading: boolean;
}

const semesterOptions = [
  { label: 'Học kỳ 1', code: 'HK1' },
  { label: 'Học kỳ 2', code: 'HK2' },
  { label: 'Học kỳ hè', code: 'HKH' },
];

const SemesterFormDialog = ({ form, years, isDialogOpen, setIsDialogOpen, editingSemester, setEditingSemester, onSubmit, isLoading }: SemesterFormDialogProps) => {
  const selectedName = form.watch('name');

  useEffect(() => {
    if (selectedName) {
      const selectedOption = semesterOptions.find((option) => option.label === selectedName);
      if (selectedOption) {
        form.setValue('code', selectedOption.code);
      }
    } else {
      form.setValue('code', '');
    }
  }, [selectedName, form]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary/90 cursor-pointer"
          onClick={() => {
            setEditingSemester(null);
            form.reset();
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          {editingSemester ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingSemester ? 'Chỉnh sửa học kỳ' : 'Thêm học kỳ'}</DialogTitle>
          <DialogDescription>{editingSemester ? 'Cập nhật thông tin học kỳ' : 'Tạo học kỳ mới trong hệ thống'}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên học kỳ</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn học kỳ" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesterOptions.map((option) => (
                            <SelectItem key={option.code} value={option.label}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {selectedName && (
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã học kỳ</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Năm học</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn năm học" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <Popover>
                      <PopoverTrigger>
                        <FormControl>
                          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'dd/MM/yyyy') : <span>Chọn ngày bắt đầu</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <Popover>
                      <PopoverTrigger>
                        <FormControl>
                          <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'dd/MM/yyyy') : <span>Chọn ngày kết thúc</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingSemester(null);
                  form.reset();
                  setIsDialogOpen(false);
                }}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <CalendarIcon className="mr-2 h-4 w-4 animate-spin" />
                    {editingSemester ? 'Đang cập nhật...' : 'Đang tạo...'}
                  </>
                ) : editingSemester ? (
                  'Cập nhật'
                ) : (
                  'Tạo mới'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SemesterFormDialog;
