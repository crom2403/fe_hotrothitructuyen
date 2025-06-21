import type { Year, YearForm } from "@/types/year_semesterType";
import { type UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";
import { Loader2, PlusIcon } from "lucide-react";

interface YearFormDialogProps {
  form: UseFormReturn<YearForm>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  onSubmit: (data: YearForm) => Promise<void>;
  isLoading: boolean;
}

const currentYear = new Date().getFullYear();

const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i); // 5 năm trước và 5 năm sau


const YearFormDialog = ({ form, isDialogOpen, setIsDialogOpen, onSubmit, isLoading }: YearFormDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <Button className="bg-black hover:bg-black/80"
          onClick={() => {
            form.reset()
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Thêm năm học
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm năm học</DialogTitle>
          <DialogDescription>Thêm mới năm học trong chương trình học</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="start_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm bắt đầu</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn năm bắt đầu" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="end_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Năm kết thúc</FormLabel>
                      <FormControl>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn năm kết thúc" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-black hover:bg-black/80" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog >
  )
}

export default YearFormDialog