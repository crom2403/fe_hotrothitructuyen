import type { Subject, SubjectFormData } from "@/types/subjectType";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import type { UseFormReturn } from "react-hook-form"
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                        className={form.formState.errors.credits ? "border-red-500" : ""}
                      />
                    </FormControl>
                  </FormItem>
                )} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="theoryHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiết lý thuyết</FormLabel>
                      <FormControl>
                        <Input {...field}
                          type="number"
                          className={form.formState.errors.theoryHours ? "border-red-500" : ""}
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
                  name="practiceHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số tiết thực hành</FormLabel>
                      <FormControl>
                        <Input {...field}
                          type="number"
                          className={form.formState.errors.practiceHours ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsDialogOpen(false)
                setEditingSubject(null)
                form.reset()
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