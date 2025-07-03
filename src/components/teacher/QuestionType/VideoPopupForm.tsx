import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import type { QuestionFormData } from "../QuestionFormDialog";
import type { UseFormReturn } from "react-hook-form";

export function VideoPopupForm({ form }: { form: UseFormReturn<QuestionFormData> }) {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "answer_config.popup_times" });
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="answer_config.video_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video ID</FormLabel>
            <Input {...field} placeholder="Nhập Video ID" />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="answer_config.url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Video URL</FormLabel>
            <Input {...field} placeholder="Nhập URL video" />
            <FormMessage />
          </FormItem>
        )}
      />
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-2 border p-4 rounded">
          <FormField
            control={form.control}
            name={`answer_config.popup_times.${index}.time`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thời gian (giây)</FormLabel>
                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`answer_config.popup_times.${index}.question`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Câu hỏi</FormLabel>
                <Input {...field} placeholder="Nhập câu hỏi" />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`answer_config.popup_times.${index}.options`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phương án (cách nhau bằng dấu phẩy)</FormLabel>
                <Input
                  onChange={(e) => field.onChange(e.target.value.split(",").map((o) => o.trim()))}
                  placeholder="Nhập các phương án"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`answer_config.popup_times.${index}.correct`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đáp án đúng</FormLabel>
                <Input {...field} placeholder="Nhập đáp án đúng" />
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ time: 0, question: "", options: ["", ""], correct: "" })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Thêm câu hỏi popup
      </Button>
    </div>
  );
}