import type { Subject, SubjectFormData } from "@/types/subjectType";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { UseFormReturn } from "react-hook-form"
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SubjectFormDialogProps {
  form: UseFormReturn<SubjectFormData>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingSubject: Subject | null;
  setEditingSubject: (subject: Subject | null) => void;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  isLoading: boolean;
}

const SubjectFormDialog = ({ form, isDialogOpen, setIsDialogOpen, editingSubject, setEditingSubject, onSubmit, isLoading }: SubjectFormDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) {
        setEditingSubject(null);
        form.reset({
          code: "",
          name: "",
          credits: 0,
          theory_hours: 0,
          practice_hours: 0,
          description: "",
        });
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-black hover:bg-black/80"
          onClick={() => {
            setEditingSubject(null)
            form.reset()
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm môn học
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingSubject ? "Chỉnh sửa môn học" : "Thêm môn học mới"}</DialogTitle>
          <DialogDescription>
            {editingSubject ? "Cập nhật thông tin môn học" : "Tạo môn học mới trong hệ thống"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã môn học</FormLabel>
                      <FormControl>
                        <Input {...field}
                          className={form.formState.errors.code ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên môn học</FormLabel>
                      <FormControl>
                        <Input {...field}
                          className={form.formState.errors.name ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Số tín chỉ</FormLabel>
                    <FormControl>
                      <Input {...field}
                        type="number"
                        min={1}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.valueAsNumber;
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                        className={form.formState.errors.credits ? "border-red-500" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="theory_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiết lý thuyết</FormLabel>
                      <FormControl>
                        <Input {...field}
                          type="number"
                          min={0}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.valueAsNumber;
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                          className={form.formState.errors.theory_hours ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="practice_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiết thực hành</FormLabel>
                      <FormControl>
                        <Input {...field}
                          type="number"
                          min={0}
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.valueAsNumber;
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                          className={form.formState.errors.practice_hours ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Mô tả</FormLabel>
                    <FormControl>
                      <Textarea {...field}
                        rows={5}
                        value={field.value || ""}
                        className={form.formState.errors.description ? "border-red-500" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setEditingSubject(null);
                form.reset({
                  code: "",
                  name: "",
                  credits: 0,
                  theory_hours: 0,
                  practice_hours: 0,
                  description: "",
                });
              }}>
                Hủy
              </Button>
              <Button type="submit" className="bg-black hover:bg-black/80" disabled={isLoading}>
                {isLoading ? "Đang lưu..." : editingSubject ? "Cập nhật" : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SubjectFormDialog