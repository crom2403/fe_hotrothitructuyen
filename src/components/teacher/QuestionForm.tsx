import type { QuestionFormData } from '@/features/teacher/QuestionBank'
import { type UseFormReturn } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { ImageIcon, Loader2 } from 'lucide-react';

import MultipleChoiceForm from './MultipleChoiceForm';
import type { Question } from '@/types/questionType';
import { SingleChoiceForm } from './SingleChoiceForm';

interface QuestionFormProps {
  form: UseFormReturn<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => void;
  editingQuestion: Question | null;
  isLoading: boolean;
  questionType: string;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, value: string) => void;
  toggleCorrectAnswer: (index: number) => void;
}

const QuestionForm = ({
  form,
  onSubmit,
  editingQuestion,
  isLoading,
  questionType,
  addOption,
  removeOption,
  updateOption,
  toggleCorrectAnswer,
}: QuestionFormProps) => {
  const subjects = [
    { label: "Lập trình Web", value: "web" },
    { label: "Cơ sở dữ liệu", value: "database" },
    { label: "Mạng máy tính", value: "network" },
    { label: "Hệ điều hành", value: "operating-system" },
  ]

  const questionTypes = [
    { label: "Câu hỏi đơn", value: "single" },
    { label: "Câu hỏi nhiều lựa chọn", value: "multiple" },
    { label: "Câu hỏi ghép đôi", value: "matching" },
    { label: "Câu hỏi kéo thả", value: "drag-drop" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Môn học</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Chọn môn học" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.value} value={subject.value}>
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chủ đề</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập chủ đề"
                    {...field}
                    className='w-full'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại câu hỏi</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Chọn loại câu hỏi" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ khó</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Chọn độ khó" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điểm</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Nhập số điểm"
                    step={0.1}
                    {...field}
                    defaultValue={1}
                    onChange={(e) => {
                      field.onChange(Number(e.target.value))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='space-y-2'>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nội dung câu hỏi</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type='button' variant='outline' size="sm">
            <ImageIcon className="mr-2 h-4 w-4" />
            Thêm hình ảnh
          </Button>
        </div>

        {/* Dạng câu hỏi */}
        {questionType === "single" && (
          <SingleChoiceForm
            form={form}
            addOption={addOption}
            removeOption={removeOption}
            updateOption={updateOption}
            toggleCorrectAnswer={toggleCorrectAnswer}
          />
        )}

        {questionType === "multiple" && (
          <MultipleChoiceForm
            form={form}
            addOption={addOption}
            removeOption={removeOption}
            updateOption={updateOption}
            toggleCorrectAnswer={toggleCorrectAnswer}
          />
        )}

        <div className="space-y-2">
          <FormLabel>Giải thích (tùy chọn)</FormLabel>
          <Textarea
            id="explanation"
            rows={2}
            {...form.register("explanation")}
            placeholder="Giải thích đáp án đúng..."
          />
        </div>

        <div className='flex justify-end space-x-2'>
          <Button type='button'
            variant='outline'
            onClick={() => {
              form.reset()
              
            }}
          > Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingQuestion ? "Đang cập nhật..." : "Đang tạo..."}
              </>
            ) : editingQuestion ? (
              "Cập nhật"
            ) : (
              "Tạo câu hỏi"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default QuestionForm