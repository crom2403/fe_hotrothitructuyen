import type { QuestionFormData, QuestionType } from '@/types/questionType'
import { type UseFormReturn } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

import MultipleChoiceForm from './MultipleChoiceForm';
import type { Question } from '@/types/questionType';
import { SingleChoiceForm } from './SingleChoiceForm';
import { Switch } from '../ui/switch';
import { useEffect } from 'react';
import type { DifficultyLevel } from '@/types/difficultyLevelType';
import type { Subject } from '@/types/subjectType';
import QuillEditor from '../common/QuillEditor';

interface QuestionFormProps {
  form: UseFormReturn<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => void;
  editingQuestion: Question | null;
  isLoading: boolean;
  questionType: string;
  questionTypes: QuestionType[];
  isLoadingQuestionTypes: boolean;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateOption: (index: number, value: string) => void;
  toggleCorrectAnswer: (index: number) => void;
  difficultyLevels: DifficultyLevel[];
  isLoadingDifficultyLevels: boolean;
  subjects: Subject[];
  isLoadingSubjects: boolean;
}

const QuestionForm = ({
  form,
  onSubmit,
  editingQuestion,
  isLoading,
  questionType,
  questionTypes,
  isLoadingQuestionTypes,
  addOption,
  removeOption,
  updateOption,
  toggleCorrectAnswer,
  difficultyLevels,
  isLoadingDifficultyLevels,
  subjects,
  isLoadingSubjects,
}: QuestionFormProps) => {

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className='space-y-2'>
          <FormField
            control={form.control}
            name="subject_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Môn học</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingSubjects}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={isLoadingSubjects ? "Đang tải môn học..." : "Chọn môn học"} />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name="type_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại câu hỏi</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingQuestionTypes}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={isLoadingQuestionTypes ? "Đang tải loại câu hỏi..." : "Chọn loại câu hỏi"} />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
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
            name="difficulty_level_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Độ khó</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingDifficultyLevels}>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder={isLoadingDifficultyLevels ? "Đang tải độ khó..." : "Chọn độ khó"} />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((difficulty) => (
                        <SelectItem key={difficulty.id} value={difficulty.id}>
                          {difficulty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              <QuillEditor
                form={form}
                name="content"
                label="Nội dung câu hỏi"
                placeholder="Nhập nội dung câu hỏi..."
              />
            )}
          />
        </div>

        {/* Dạng câu hỏi */}
        {questionType === "single_choice" && (
          <SingleChoiceForm
            form={form}
            addOption={addOption}
            removeOption={removeOption}
            updateOption={updateOption}
            toggleCorrectAnswer={toggleCorrectAnswer}
          />
        )}
        {questionType === "multiple_choice" && (
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

        <div className='space-y-2'>
          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className='flex items-center gap-2 justify-between'>
                    <FormLabel className='text-md font-medium'>Muốn câu hỏi công khai?</FormLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className='data-[state=unchecked]:bg-gray-300 w-10 h-6'
                    />
                  </div>
                </FormControl>
              </FormItem>
            )}
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
          <Button type="submit" className='bg-black hover:bg-black/80' disabled={isLoading}>
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