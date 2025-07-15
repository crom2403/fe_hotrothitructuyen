import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Plus } from 'lucide-react';
import type { QuestionItem, QuestionTypeResponse } from '@/types/questionType';
import { useForm } from 'react-hook-form';
import type { AssignedSubjectByTeacher } from '@/types/subjectType';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useEffect, useState } from 'react';
import { apiGetAssignedSubjectByTeacher } from '@/services/admin/subject';
import QuillEditor from '../common/QuillEditor';
import SingleChoiceForm from './QuestionType/SingleChoiceForm';
import MatchingForm from './QuestionType/MatchingForm';
import OrderingForm from './QuestionType/OrderingForm';
import InfoPopup from '../common/InfoPopup';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import useAuthStore from '@/stores/authStore';
import DragDropForm from './QuestionType/DragDropForm';
import { VideoPopupForm } from './QuestionType/VideoPopupForm';
import { createQuestionSchema } from '@/types/questionFormValidation';
import type { QuestionFormData, AnswerConfig, AnswerItem, MatchingConfig, DragDropConfig, VideoPopupConfig, SingleChoiceConfig, MultipleSelectConfig, OrderingConfig } from '@/types/questionFormTypes';
import { isSingleChoiceConfig, isMultipleSelectConfig, isDragDropConfig, isMatchingConfig, isOrderingConfig, isVideoPopupConfig } from '@/types/questionFormTypes';
import MultipleChoiceForm from './QuestionType/MultipleChoiceForm';
import { v4 as uuidv4 } from 'uuid';
import { apiGenerateQuestion } from '@/services/admin/question';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import IconAI from '../../../public/gifs/turing-test.gif';
import { Label } from '@/components/ui/label';
import useAppStore from '@/stores/appStore';
import { apiCreateQuestion } from '@/services/teacher/question';

interface QuestionFormDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingQuestion?: QuestionItem | null;
  setEditingQuestion?: (question: QuestionItem | null) => void;
  refetchQuestionsPrivate?: () => void;
}

const DEFAULT_OPTIONS = ['A', 'B', 'C', 'D'];

const QuestionFormDialog = ({ isDialogOpen, setIsDialogOpen, editingQuestion, setEditingQuestion, refetchQuestionsPrivate }: QuestionFormDialogProps) => {
  const { questionTypes, difficultyLevels } = useAppStore();
  const [open, setOpen] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const { currentUser } = useAuthStore();
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubjectByTeacher[]>([]);
  const [isLoadingAssignedSubjects, setIsLoadingAssignedSubjects] = useState(false);
  const [isLoadingGenerateQuestion, setIsLoadingGenerateQuestion] = useState(false);
  const [contentGenerateQuestion, setContentGenerateQuestion] = useState<string>('');

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(createQuestionSchema(questionTypes as unknown as QuestionTypeResponse)) as any,
    defaultValues: {
      content: '',
      type_id: '',
      subject_id: '',
      difficulty_level_id: '',
      answers: [],
      answer_config: { kind: 'single_choice', options_count: 2, correct: '' },
      explanation: '',
      is_public: false,
    },
  });

  const handleGetAssignedSubjects = async () => {
    setIsLoadingAssignedSubjects(true);
    try {
      const response = await apiGetAssignedSubjectByTeacher(currentUser?.id || '');
      setAssignedSubjects(response.data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingAssignedSubjects(false);
    }
  };

  useEffect(() => {
    handleGetAssignedSubjects();
  }, []);

  const typeId = form.watch('type_id');
  const questionType = questionTypes?.find((type) => type.id === typeId)?.code || '';

  useEffect(() => {
    if (!questionType) return;
    let newConfig: AnswerConfig;
    let newAnswers: AnswerItem[] = [];
    switch (questionType) {
      case 'single_choice':
        newConfig = { kind: 'single_choice', options_count: 2, correct: '' };
        newAnswers = [
          { id: uuidv4(), content: { text: '', value: 'A' }, order_index: 1 },
          { id: uuidv4(), content: { text: '', value: 'B' }, order_index: 2 },
        ];
        break;
      case 'multiple_select':
        newConfig = { kind: 'multiple_select', options_count: 2, correct: [] };
        newAnswers = [
          { id: uuidv4(), content: { text: '', value: 'A' }, order_index: 1 },
          { id: uuidv4(), content: { text: '', value: 'B' }, order_index: 2 },
        ];
        break;
      case 'drag_drop':
        newConfig = { kind: 'drag_drop', zones: [{ text: 'Vùng 1', value: 'zone1' }], correct: [] };
        newAnswers = [
          { id: uuidv4(), content: { text: 'Mục 1', value: 'A' }, order_index: 1 },
          { id: uuidv4(), content: { text: 'Mục 2', value: 'B' }, order_index: 2 },
        ];
        break;
      case 'matching':
        newConfig = {
          kind: 'matching',
          pairs: [
            { left: '', right: '' },
            { left: '', right: '' },
          ],
          correct: [
            { left: '', right: '' },
            { left: '', right: '' },
          ],
        };
        newAnswers = [
          { id: uuidv4(), content: { left: 'Nội dung A', right: 'Nội dung B' }, order_index: 1 },
          { id: uuidv4(), content: { left: 'Nội dung C', right: 'Nội dung D' }, order_index: 2 },
        ];
        break;
      case 'ordering':
        newConfig = {
          kind: 'ordering',
          items_count: 2,
          correct: [
            { id: uuidv4(), value: 'A', order: 1 },
            { id: uuidv4(), value: 'B', order: 2 },
          ],
        };
        newAnswers = [
          { id: newConfig.correct[0].id, content: { text: '', value: 'A' }, order_index: 1 },
          { id: newConfig.correct[1].id, content: { text: '', value: 'B' }, order_index: 2 },
        ];
        break;
      case 'video_popup':
        newConfig = {
          kind: 'video_popup',
          video_id: uuidv4(),
          url: '',
          popup_times: [
            {
              id: `popup-${uuidv4()}`,
              time: 0,
              question: '',
              options: DEFAULT_OPTIONS,
              correct: '',
            },
          ],
        };
        newAnswers = DEFAULT_OPTIONS.map((opt, idx) => ({
          id: uuidv4(),
          content: { text: '', value: opt },
          order_index: idx + 1,
        }));
        break;
      default:
        newConfig = { kind: 'single_choice', options_count: 2, correct: '' };
        newAnswers = [
          { id: uuidv4(), content: { text: '', value: 'A' }, order_index: 1 },
          { id: uuidv4(), content: { text: '', value: 'B' }, order_index: 2 },
        ];
    }
    form.setValue('answer_config', newConfig);
    form.setValue('answers', newAnswers);
  }, [questionType, form]);

  const addOption = () => {
    const currentAnswers = form.getValues('answers');
    const newAnswer: AnswerItem =
      questionType === 'matching'
        ? { id: uuidv4(), content: { left: '', right: '' }, order_index: currentAnswers.length + 1 }
        : {
            id: uuidv4(),
            content: {
              text: '',
              value: ['single_choice', 'multiple_select', 'drag_drop', 'ordering'].includes(questionType) ? String.fromCharCode(65 + currentAnswers.length) : '',
            },
            order_index: currentAnswers.length + 1,
          };
    form.setValue('answers', [...currentAnswers, newAnswer]);

    const currentConfig = form.getValues('answer_config');
    if (questionType === 'single_choice' && isSingleChoiceConfig(currentConfig)) {
      form.setValue('answer_config.options_count', currentAnswers.length + 1);
    } else if (questionType === 'multiple_select' && isMultipleSelectConfig(currentConfig)) {
      form.setValue('answer_config.options_count', currentAnswers.length + 1);
    } else if (questionType === 'ordering' && isOrderingConfig(currentConfig)) {
      form.setValue('answer_config.items_count', currentAnswers.length + 1);
      console.log('newAnswer', newAnswer);
      const newCorrect = [
        ...currentConfig.correct,
        {
          id: newAnswer.id,
          value: 'text' in newAnswer.content && 'value' in newAnswer.content ? newAnswer.content.value || '' : '',
          order: currentAnswers.length + 1,
        },
      ];
      form.setValue('answer_config.correct', newCorrect);
    } else if (questionType === 'matching' && isMatchingConfig(currentConfig)) {
      form.setValue('answer_config.pairs', [...currentConfig.pairs, { left: '', right: '' }]);
      form.setValue('answer_config.correct', [...currentConfig.correct, { left: '', right: '' }]);
    }
  };

  const removeOption = (index: number) => {
    const currentAnswers = form.getValues('answers');
    if (currentAnswers.length <= 2) {
      toast.error(`Cần ít nhất 2 ${questionType === 'ordering' ? 'mục' : questionType === 'matching' ? 'cặp ghép' : 'phương án'}`);
      return;
    }
    const removedAnswer = currentAnswers[index];
    const newAnswers = currentAnswers
      .filter((_, i) => i !== index)
      .map((answer, i) => ({
        ...answer,
        order_index: i + 1,
        content:
          questionType === 'matching'
            ? { left: (answer.content as { left: string; right: string }).left, right: (answer.content as { left: string; right: string }).right }
            : {
                text: (answer.content as { text: string; value?: string }).text,
                value: ['single_choice', 'multiple_select', 'drag_drop'].includes(questionType) ? String.fromCharCode(65 + i) : (answer.content as { text: string; value?: string }).value,
              },
      }));
    form.setValue('answers', newAnswers);

    const currentConfig = form.getValues('answer_config');
    if (questionType === 'single_choice' && isSingleChoiceConfig(currentConfig)) {
      form.setValue('answer_config.options_count', newAnswers.length);
      if (currentConfig.correct === ('value' in removedAnswer.content ? removedAnswer.content.value : 'text' in removedAnswer.content ? removedAnswer.content.text : '')) {
        form.setValue('answer_config.correct', '');
      }
    } else if (questionType === 'multiple_select' && isMultipleSelectConfig(currentConfig)) {
      form.setValue('answer_config.options_count', newAnswers.length);
      form.setValue(
        'answer_config.correct',
        currentConfig.correct.filter((c) => c !== ('value' in removedAnswer.content ? removedAnswer.content.value : 'text' in removedAnswer.content ? removedAnswer.content.text : '')),
      );
    } else if (questionType === 'ordering' && isOrderingConfig(currentConfig)) {
      form.setValue('answer_config.items_count', newAnswers.length);
      form.setValue(
        'answer_config.correct',
        newAnswers.map((a, i) => ({ id: a.id, value: 'text' in a.content && 'value' in a.content ? a.content.value || '' : '', order: i + 1 })),
      );
    } else if (questionType === 'matching' && isMatchingConfig(currentConfig)) {
      const newPairs = currentConfig.pairs.filter((_, i) => i !== index);
      const newCorrect = currentConfig.correct.filter((_, i) => i !== index);
      form.setValue('answer_config.pairs', newPairs);
      form.setValue('answer_config.correct', newCorrect);
    } else if (questionType === 'drag_drop' && isDragDropConfig(currentConfig)) {
      form.setValue(
        'answer_config.correct',
        currentConfig.correct.filter((c) => c.id !== removedAnswer.id),
      );
    }
  };

  const updateOption = (index: number, text: string, value?: string) => {
    const currentAnswers = form.getValues('answers');
    const newAnswers = [...currentAnswers];
    newAnswers[index] = {
      ...newAnswers[index],
      content: {
        text,
        value: value || (['single_choice', 'multiple_select', 'drag_drop', 'ordering'].includes(questionType) ? String.fromCharCode(65 + index) : text),
      },
    };
    form.setValue('answers', newAnswers);

    if (questionType === 'drag_drop' && isDragDropConfig(form.getValues('answer_config'))) {
      const currentConfig = form.getValues('answer_config');
      const newCorrect = (currentConfig as DragDropConfig).correct.map((c) => (c.id === newAnswers[index].id ? { ...c, value: text } : c));
      form.setValue('answer_config.correct', newCorrect);
    }

    if (questionType === 'video_popup' && isVideoPopupConfig(form.getValues('answer_config'))) {
      const currentConfig = form.getValues('answer_config');
      const newCorrect = (currentConfig as VideoPopupConfig).popup_times.map((c: any) => (c.id === newAnswers[index].id ? { ...c, value: text } : c));
      form.setValue('answer_config.popup_times', newCorrect);
    }

    if (questionType === 'ordering' && isOrderingConfig(form.getValues('answer_config'))) {
      const currentConfig = form.getValues('answer_config');
      const newCorrect = (currentConfig as OrderingConfig).correct.map((c) =>
        c.id === newAnswers[index].id
          ? {
              ...c,
              value: 'text' in newAnswers[index].content && 'value' in newAnswers[index].content ? newAnswers[index].content.value || '' : '',
            }
          : c,
      );
      form.setValue('answer_config.correct', newCorrect);
    }
  };

  const toggleCorrectAnswer = (index: number) => {
    const currentAnswers = form.getValues('answers');
    const currentConfig = form.getValues('answer_config');
    const answer = currentAnswers[index];
    const value = (answer.content as { value?: string; text?: string }).value || (answer.content as { value?: string; text?: string }).text || String.fromCharCode(65 + index);

    if (questionType === 'single_choice' && isSingleChoiceConfig(currentConfig)) {
      form.setValue('answer_config.correct', value);
    } else if (questionType === 'multiple_select' && isMultipleSelectConfig(currentConfig)) {
      const currentCorrect = currentConfig.correct as string[];
      if (currentCorrect.includes(value)) {
        form.setValue(
          'answer_config.correct',
          currentCorrect.filter((c) => c !== value),
        );
      } else {
        form.setValue('answer_config.correct', [...currentCorrect, value]);
      }
    }
  };

  const updateMatchContent = (index: number, left: string, right: string) => {
    const currentAnswers = form.getValues('answers');
    const newAnswers = [...currentAnswers];
    newAnswers[index] = {
      ...newAnswers[index],
      content: { left, right },
      order_index: index + 1,
    };
    form.setValue('answers', newAnswers);
    const currentConfig = form.getValues('answer_config');
    const newPairs = [...(currentConfig as MatchingConfig).pairs];
    newPairs[index] = { left, right };
    form.setValue('answer_config.pairs', newPairs);
    form.setValue('answer_config.correct', newPairs);
  };

  const onSubmit = async (data: QuestionFormData) => {
    console.log('Form Data before submit:', data);
    console.log('Form Data before submit:', JSON.stringify(data, null, 2));
    setIsLoadingSubmit(true);
    try {
      if (questionType === 'drag_drop' && isDragDropConfig(data.answer_config) && data.answers.length !== data.answer_config.correct.length) {
        toast.error('Tất cả lựa chọn phải được gán vào vùng!');
        return;
      }
      if (questionType === 'video_popup' && isVideoPopupConfig(data.answer_config)) {
        if (!data.answer_config.url) {
          toast.error('Vui lòng tải lên video!');
          return;
        }

        const totalOptions = data.answer_config.popup_times.reduce((acc, p) => acc + p.options.length, 0);
        if (data.answers.length !== totalOptions) {
          toast.error(`Số lượng đáp án (${data.answers.length}) không khớp với tổng số phương án (${totalOptions})!`);
          return;
        }
      }

      if (questionType === 'ordering' && isOrderingConfig(data.answer_config)) {
        const newCorrect = data.answers.map((answer) => ({
          id: answer.id,
          value: 'text' in answer.content && 'value' in answer.content ? answer.content.value || '' : '',
          order: answer.order_index,
        }));
        data.answer_config.correct = newCorrect;
      }

      const apiData = {
        subject_id: data.subject_id,
        type_id: data.type_id,
        difficulty_level_id: data.difficulty_level_id,
        content: data.content,
        is_public: data.is_public,
        explanation: data.explanation,
        answer_config: data.answer_config,
        answers: data.answers.map((answer) => ({
          content: answer.content,
          order_index: answer.order_index,
        })),
      };
      console.log('API Data:', apiData);
      const response = await apiCreateQuestion(apiData);
      if (response.status === 201) {
        toast.success('Tạo câu hỏi thành công');
        setIsDialogOpen(false);
        refetchQuestionsPrivate?.();
        form.reset();
      } else {
        toast.error(`Tạo câu hỏi thất bại: ${response.statusText}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      console.error('API Error:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleGenerateQuestionByAI = async () => {
    setIsLoadingGenerateQuestion(true);
    const formValues = form.getValues();
    if (!formValues.subject_id || !formValues.type_id || !formValues.difficulty_level_id) {
      toast.error('Vui lòng chọn môn học, loại câu hỏi và độ khó trước khi tạo bằng AI');
      setIsLoadingGenerateQuestion(false);
      return;
    }
    const subject_name = assignedSubjects.find((e) => e.subject.id === formValues.subject_id)?.subject.name || '';
    const difficultyLevel = difficultyLevels.find((e) => e.id === formValues.difficulty_level_id);

    try {
      const res = await apiGenerateQuestion({
        subject_name,
        question_type: questionType,
        content: contentGenerateQuestion,
        difficulty_level: difficultyLevel?.name || '',
      });

      console.log('res', res);

      if (res.status === 200) {
        form.setValue('content', res.data.question);
        let answerConfig: AnswerConfig = { kind: questionType as any, correct: '', options_count: 0 };
        const answers = res.data.options?.map((answer: any, index: number) => {
          if (answer.is_correct) {
            if (questionType === 'single_choice') (answerConfig as SingleChoiceConfig).correct = String.fromCharCode(65 + index);
            else if (questionType === 'multiple_select') {
              (answerConfig as MultipleSelectConfig).correct = [
                ...res.data.options
                  ?.map((e: any, index: number) => {
                    if (e.is_correct) return String.fromCharCode(65 + index);
                    return;
                  })
                  .filter(Boolean),
              ];
            } else if (questionType === 'drag_drop') {
              (answerConfig as DragDropConfig).correct = [
                ...res.data.options
                  ?.map((e: any, index: number) => {
                    if (e.is_correct) return String.fromCharCode(65 + index);
                    return;
                  })
                  .filter(Boolean),
              ];
            } else if (questionType === 'ordering') {
              (answerConfig as OrderingConfig).correct = [
                ...res.data.options?.map((e: { content: string; order: number }) => {
                  return { id: uuidv4(), value: String.fromCharCode(65 + e.order), order: e.order };
                }),
              ];
            } else if (questionType === 'matching') {
              const matchingAnswers = res.data.options.map((e: { left: string; right: string }, idx: number) => ({
                id: uuidv4(),
                content: { left: e.left, right: e.right },
                order_index: idx + 1,
              }));
              answerConfig = {
                kind: 'matching',
                pairs: res.data.options.map((e: { left: string; right: string }) => ({ left: e.left, right: e.right })),
                correct: res.data.options.map((e: { left: string; right: string }) => ({ left: e.left, right: e.right })),
              };
              form.setValue('answers', matchingAnswers);
              form.setValue('answer_config', answerConfig);
              return; // Thoát sớm để tránh overwrite
            }
          }
          return {
            id: uuidv4(),
            content: { text: answer.content, value: String.fromCharCode(65 + index) },
            order_index: index + 1,
          };
        });
        answerConfig = { ...answerConfig, options_count: answers.length };
        form.setValue('answers', answers);
        form.setValue('answer_config', answerConfig);
        form.setValue('explanation', res.data.explanation);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingGenerateQuestion(false);
    }
  };

  const handleSaveSuccess = () => {
    setIsDialogOpen(false);
    refetchQuestionsPrivate?.();
    form.reset();
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          form.reset();
          setEditingQuestion?.(null);
        }
      }}
    >
      <DialogTrigger>
        <Button className="bg-primary hover:bg-primary/90 cursor-pointer" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm câu hỏi
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70vw] max-w-[1200px] max-h-[90vh] overflow-y-auto bg-white p-6">
        <DialogHeader>
          <div className="flex justify-between">
            <div>
              <DialogTitle>{editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</DialogTitle>
              <DialogDescription>{editingQuestion ? 'Cập nhật thông tin câu hỏi' : 'Tạo câu hỏi mới cho ngân hàng (ngày: 06/07/2025, 11:41 AM)'}</DialogDescription>
            </div>
            <div>
              {form.getValues('subject_id') && (
                <Popover>
                  <PopoverTrigger>
                    <img src={IconAI} alt="Icon AI" className="size-14" />
                  </PopoverTrigger>
                  <PopoverContent className="" side="left">
                    <div className="flex flex-col gap-4">
                      <Label>Tạo câu hỏi với AI</Label>
                      <Textarea rows={4} placeholder="Nhập nội dung câu hỏi mẫu..." onChange={(e) => setContentGenerateQuestion(e.target.value)} />
                      <Button onClick={handleGenerateQuestionByAI}>{isLoadingGenerateQuestion ? 'Đang tạo...' : 'Gửi yêu cầu'}</Button>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Môn học</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingAssignedSubjects}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingAssignedSubjects ? 'Đang tải môn học...' : 'Chọn môn học'} />
                        </SelectTrigger>
                        <SelectContent>
                          {assignedSubjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.subject.id}>
                              {subject.subject.code} - {subject.subject.name}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại câu hỏi</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn loại câu hỏi" />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn độ khó" />
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
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => <QuillEditor form={form as any} name="content" label="Nội dung câu hỏi" placeholder="Nhập nội dung câu hỏi..." />}
              />
            </div>

            {questionType === 'single_choice' && (
              <SingleChoiceForm form={form} addOption={addOption} removeOption={removeOption} updateOption={updateOption} toggleCorrectAnswer={toggleCorrectAnswer} />
            )}
            {questionType === 'multiple_select' && (
              <MultipleChoiceForm form={form} addOption={addOption} removeOption={removeOption} updateOption={updateOption} toggleCorrectAnswer={toggleCorrectAnswer} />
            )}
            {questionType === 'matching' && <MatchingForm form={form} addOption={addOption} removeOption={removeOption} updateMatchContent={updateMatchContent} />}
            {questionType === 'ordering' && <OrderingForm form={form} addOption={addOption} removeOption={removeOption} />}
            {questionType === 'drag_drop' && <DragDropForm addOption={addOption} removeOption={removeOption} updateOption={updateOption} />}
            {questionType === 'video_popup' && <VideoPopupForm form={form} onSaveSuccess={handleSaveSuccess} />}

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giải thích</FormLabel>
                    <FormControl>
                      <Textarea id="explanation" rows={2} {...field} placeholder="Giải thích đáp án đúng..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-md font-medium">Lưu vào ngân hàng câu hỏi?</FormLabel>
                          <InfoPopup text="Khi lưu vào ngân hàng câu hỏi cần phải qua sự kiểm duyệt của quản trị viên" _open={open} _setOpen={setOpen} />
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=unchecked]:bg-gray-300 cursor-pointer" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              {questionType !== 'video_popup' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setIsDialogOpen(false);
                      setEditingQuestion?.(null);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 cursor-pointer" disabled={isLoadingSubmit}>
                    {isLoadingSubmit ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin " />
                        {editingQuestion ? 'Đang cập nhật...' : 'Đang tạo...'}
                      </>
                    ) : editingQuestion ? (
                      'Cập nhật'
                    ) : (
                      'Tạo câu hỏi'
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* {Object.keys(form.formState.errors).length > 0 && (
              <pre className="text-red-500 bg-gray-100 p-2 rounded">{JSON.stringify(form.formState.errors, null, 2)}</pre>
            )} */}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionFormDialog;
