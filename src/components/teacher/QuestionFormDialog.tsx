import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Loader2, Plus } from 'lucide-react';
import type { QuestionItem, QuestionTypeResponse } from '@/types/questionType';
import { useForm } from 'react-hook-form';
import type { DifficultyLevel } from '@/types/difficultyLevelType';
import type { AssignedSubjectByTeacher } from '@/types/subjectType';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useEffect, useState } from 'react';
import { useApiCall } from '@/hooks/useApiCall';
import { apiGetAssignedSubjectByTeacher } from '@/services/admin/subject';
import { apiCreateQuestion, apiGetDifficultyLevels, apiGetQuestionTypes } from '@/services/teacher/question';
import QuillEditor from '../common/QuillEditor';
import SingleChoiceForm from './QuestionType/SingleChoiceForm';
import MatchingForm from './QuestionType/MatchingForm';
import OrderingForm from './QuestionType/OrderingForm';
import InfoPopup from '../common/InfoPopup';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import useAuthStore from '@/stores/authStore';
import DrapDropForm from './QuestionType/DrapDropForm';
import { VideoPopupForm } from './QuestionType/VideoPopupForm';
import { createQuestionSchema } from '@/types/questionFormValidation';
import type { QuestionFormData, AnswerConfig, AnswerItem, MatchingConfig, DragDropConfig } from '@/types/questionFormTypes';
import { isSingleChoiceConfig, isMultipleSelectConfig, isDragDropConfig, isMatchingConfig, isOrderingConfig, isVideoPopupConfig } from '@/types/questionFormTypes';
import MultipleChoiceForm from './QuestionType/MultipleChoiceForm';
import { v4 as uuidv4 } from 'uuid';
import { apiGenerateQuestion } from '@/services/admin/question';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import IconAI from '../../../public/gifs/turing-test.gif';
import { Label } from '@/components/ui/label';

interface QuestionFormDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingQuestion?: QuestionItem | null;
  setEditingQuestion?: (question: QuestionItem | null) => void;
  refetchQuestionsPrivate?: () => void;
}

let questionTypes: QuestionTypeResponse | undefined;

const QuestionFormDialog = ({ isDialogOpen, setIsDialogOpen, editingQuestion, setEditingQuestion, refetchQuestionsPrivate }: QuestionFormDialogProps) => {
  const { data: fetchedQuestionTypes, isLoading: isLoadingQuestionTypes, refetch: refetchQuestionTypes } = useApiCall<QuestionTypeResponse>(() => apiGetQuestionTypes());
  const { data: difficultyLevels, isLoading: isLoadingDifficultyLevels, refetch: refetchDifficultyLevels } = useApiCall<{ data: DifficultyLevel[] }>(() => apiGetDifficultyLevels());
  const [open, setOpen] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const { currentUser } = useAuthStore();
  const [assignedSubjects, setAssignedSubjects] = useState<AssignedSubjectByTeacher[]>([]);
  const [isLoadingAssignedSubjects, setIsLoadingAssignedSubjects] = useState(false);
  const [isLoadingGenerateQuestion, setIsLoadingGenerateQuestion] = useState(false);
  const [contentGenerateQuestion, setContentGenerateQuestion] = useState<string>('');

  questionTypes = fetchedQuestionTypes || undefined;

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(createQuestionSchema(questionTypes)),
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
    refetchQuestionTypes();
    refetchDifficultyLevels();
    handleGetAssignedSubjects();
  }, []);

  const typeId = form.watch('type_id');
  const questionType = questionTypes?.data.find((type) => type.id === typeId)?.code || '';

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
        newConfig = { kind: 'drag_drop', zones: ['Vùng 1'], correct: [] };
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
          { id: uuidv4(), content: { left: '', right: '' }, order_index: 1 },
          { id: uuidv4(), content: { left: '', right: '' }, order_index: 2 },
        ];
        break;
      case 'ordering':
        newConfig = {
          kind: 'ordering',
          items_count: 2,
          correct: [
            { id: uuidv4(), order: 1 },
            { id: uuidv4(), order: 2 },
          ],
        };
        newAnswers = [
          { id: newConfig.correct[0].id, content: { text: '' }, order_index: 1 },
          { id: newConfig.correct[1].id, content: { text: '' }, order_index: 2 },
        ];
        break;
      case 'video_popup':
        newConfig = { kind: 'video_popup', video_id: '', url: '', popup_times: [] };
        newAnswers = [];
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

  // useEffect(() => {
  //   if (editingQuestion) {
  //     const sortedAnswers = [...editingQuestion.answers].sort((a, b) => a.order_index - b.order_index);
  //     const questionTypeCode = questionTypes?.data.find((type) => type.id === editingQuestion.question_type.id)?.code || "";
  //     let answerConfig: AnswerConfig;
  //     let answers: AnswerItem[] = [];
  //     switch (questionTypeCode) {
  //       case "single_choice":
  //         answerConfig = {
  //           kind: "single_choice",
  //           options_count: editingQuestion.answers.length,
  //           correct: editingQuestion.answers.find((a) => a.is_correct && a.content)?.content?.text || "",
  //         };
  //         answers = sortedAnswers.map((answer, index) => ({
  //           id: answer.id || uuidv4(),
  //           content: { text: answer.content?.text || "", value: String.fromCharCode(65 + index) },
  //           order_index: answer.order_index,
  //         }));
  //         break;
  //       case "multiple_select":
  //         answerConfig = {
  //           kind: "multiple_select",
  //           options_count: editingQuestion.answers.length,
  //           correct: editingQuestion.answers
  //             .filter((a) => a.is_correct && a.content)
  //             .map((a) => a.content!.text),
  //         };
  //         answers = sortedAnswers.map((answer, index) => ({
  //           id: answer.id || uuidv4(),
  //           content: { text: answer.content?.text || "", value: String.fromCharCode(65 + index) },
  //           order_index: answer.order_index,
  //         }));
  //         break;
  //       case "drag_drop":
  //         answerConfig = {
  //           kind: "drag_drop",
  //           zones: editingQuestion.answers.map((a) => a.drag_drop_zone || "").filter(Boolean),
  //           correct: editingQuestion.answers
  //             .filter((a) => a.is_correct && a.drag_drop_zone && a.content)
  //             .map((a) => ({
  //               id: a.id,
  //               zone: a.drag_drop_zone!,
  //               value: a.content!.text, // Assuming text is used as value
  //             })),
  //         };
  //         answers = sortedAnswers.map((answer, index) => ({
  //           id: answer.id || uuidv4(),
  //           content: { text: answer.content?.text || "", value: String.fromCharCode(65 + index) },
  //           order_index: answer.order_index,
  //         }));
  //         break;
  //       case "matching":
  //         answerConfig = {
  //           kind: "matching",
  //           pairs: editingQuestion.answers
  //             .filter((a) => a.content && a.match_pair)
  //             .map((a) => ({
  //               left: a.content!.text,
  //               right: a.match_pair || "",
  //             })),
  //           correct: editingQuestion.answers
  //             .filter((a) => a.is_correct && a.content && a.match_pair)
  //             .map((a) => ({
  //               left: a.content!.text,
  //               right: a.match_pair!,
  //             })),
  //         };
  //         answers = sortedAnswers.map((answer) => ({
  //           id: answer.id || uuidv4(),
  //           content: { left: answer.content?.text || "", right: answer.match_pair || "" },
  //           order_index: answer.order_index,
  //         }));
  //         break;
  //       case "ordering":
  //         answerConfig = {
  //           kind: "ordering",
  //           items_count: editingQuestion.answers.length,
  //           correct: editingQuestion.answers.map((a) => ({
  //             id: a.id,
  //             order: a.order_index,
  //           })),
  //         };
  //         answers = sortedAnswers.map((answer) => ({
  //           id: answer.id || uuidv4(),
  //           content: { text: answer.content?.text || "" },
  //           order_index: answer.order_index,
  //         }));
  //         break;
  //       case "video_popup":
  //         answerConfig = {
  //           kind: "video_popup",
  //           video_id: editingQuestion.question_type.config_template?.video_url || "",
  //           url: editingQuestion.question_type.config_template?.video_url || "",
  //           popup_times: (editingQuestion.question_type.config_template?.questions || []).map((q) => ({
  //             time: q.time || 0,
  //             question: q.question || "",
  //             options: q.options || [],
  //             correct: q.correct || "",
  //           })),
  //         };
  //         answers = sortedAnswers.map((answer) => ({
  //           id: answer.id || uuidv4(),
  //           content: { text: answer.content?.text || "" },
  //           order_index: answer.order_index,
  //         }));
  //         break;
  //       default:
  //         answerConfig = { kind: "single_choice", options_count: 2, correct: "" };
  //         answers = [
  //           { id: uuidv4(), content: { text: "", value: "A" }, order_index: 1 },
  //           { id: uuidv4(), content: { text: "", value: "B" }, order_index: 2 },
  //         ];
  //     }
  //     form.reset({
  //       content: editingQuestion.content,
  //       type_id: editingQuestion.question_type.id,
  //       subject_id: editingQuestion.subject.id,
  //       difficulty_level_id: editingQuestion.difficulty_level.id,
  //       answers,
  //       answer_config: answerConfig,
  //       explanation: editingQuestion.explanation || "",
  //       is_public: editingQuestion.is_public,
  //     });
  //   }
  // }, [editingQuestion, form, questionTypes]);

  const addOption = () => {
    const currentAnswers = form.getValues('answers');
    const newAnswer: AnswerItem =
      questionType === 'matching'
        ? {
            id: uuidv4(),
            content: { left: '', right: '' },
            order_index: currentAnswers.length + 1,
          }
        : {
            id: uuidv4(),
            content: {
              text: '',
              value: questionType === 'single_choice' || questionType === 'multiple_select' || questionType === 'drag_drop' ? String.fromCharCode(65 + currentAnswers.length) : '',
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
      const newCorrect = [...currentConfig.correct, { id: newAnswer.id, order: currentAnswers.length + 1 }];
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
                value:
                  questionType === 'single_choice' || questionType === 'multiple_select' || questionType === 'drag_drop'
                    ? String.fromCharCode(65 + i)
                    : (answer.content as { text: string; value?: string }).value,
              },
      }));
    form.setValue('answers', newAnswers);

    const currentConfig = form.getValues('answer_config');
    if (questionType === 'single_choice' && isSingleChoiceConfig(currentConfig)) {
      form.setValue('answer_config.options_count', newAnswers.length);
      if (currentConfig.correct === ('value' in removedAnswer.content ? removedAnswer.content.value : 'text' in removedAnswer.content && removedAnswer.content.text)) {
        form.setValue('answer_config.correct', '');
      }
    } else if (questionType === 'multiple_select' && isMultipleSelectConfig(currentConfig)) {
      form.setValue('answer_config.options_count', newAnswers.length);
      form.setValue(
        'answer_config.correct',
        currentConfig.correct.filter((c) => c !== ('value' in removedAnswer.content ? removedAnswer.content.value : 'text' in removedAnswer.content && removedAnswer.content.text)),
      );
    } else if (questionType === 'ordering' && isOrderingConfig(currentConfig)) {
      form.setValue('answer_config.items_count', newAnswers.length);
      form.setValue(
        'answer_config.correct',
        newAnswers.map((a, i) => ({ id: a.id, order: i + 1 })),
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
        value: value || (questionType === 'single_choice' || questionType === 'multiple_select' || questionType === 'drag_drop' ? String.fromCharCode(65 + index) : text),
      },
    };
    form.setValue('answers', newAnswers);

    if (questionType === 'drag_drop' && isDragDropConfig(form.getValues('answer_config'))) {
      const currentConfig = form.getValues('answer_config') as DragDropConfig;
      const newCorrect = currentConfig.correct.map((c) => (c.id === newAnswers[index].id ? { ...c, value: 'text' in newAnswers[index].content ? newAnswers[index].content.text : '' } : c));
      form.setValue('answer_config.correct', newCorrect);
    }
  };

  const toggleCorrectAnswer = (index: number) => {
    const currentAnswers = form.getValues('answers');
    const currentConfig = form.getValues('answer_config');
    if (questionType === 'single_choice' && isSingleChoiceConfig(currentConfig)) {
      const value =
        'value' in currentAnswers[index].content
          ? currentAnswers[index].content.value || String.fromCharCode(65 + index)
          : 'text' in currentAnswers[index].content && currentAnswers[index].content.text
          ? currentAnswers[index].content.text
          : '';
      form.setValue('answer_config.correct', value);
    } else if (questionType === 'multiple_select' && isMultipleSelectConfig(currentConfig)) {
      const value =
        'value' in currentAnswers[index].content
          ? currentAnswers[index].content.value || String.fromCharCode(65 + index)
          : 'text' in currentAnswers[index].content && currentAnswers[index].content.text
          ? currentAnswers[index].content.text
          : '';
      form.setValue('answer_config.correct', currentConfig.correct.includes(value) ? currentConfig.correct.filter((c) => c !== value) : [...currentConfig.correct, value]);
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
    const currentConfig = form.getValues('answer_config') as MatchingConfig;
    const newPairs = [...currentConfig.pairs];
    newPairs[index] = { left, right };
    form.setValue('answer_config.pairs', newPairs);
    form.setValue('answer_config.correct', newPairs);
  };

  const onSubmit = async (data: QuestionFormData) => {
    setIsLoadingSubmit(true);
    try {
      if (questionType === 'drag_drop' && isDragDropConfig(data.answer_config) && data.answers.length !== data.answer_config.correct.length) {
        toast.error('Tất cả lựa chọn phải được gán vào vùng!');
        return;
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
        toast.error('Tạo câu hỏi thất bại');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  const handleGerenateQuestionByAI = async () => {
    setIsLoadingGenerateQuestion(true);

    console.log('assignedSubjects', assignedSubjects);
    console.log('difficultyLevels', difficultyLevels);
    console.log('questionTypes', questionTypes);
    const formValues = form.getValues();
    console.log('formValues', formValues);
    const subject_name: string = assignedSubjects.find((e) => e.subject.id === formValues.subject_id)?.subject.name || '';
    const difficultyLevel: any = difficultyLevels?.data.find((e) => e.id === form.getValues('difficulty_level_id'));

    try {
      const res: any = await apiGenerateQuestion({
        subject_name,
        question_type: questionType,
        content: contentGenerateQuestion,
        difficulty_level: difficultyLevel?.name || '',
      });

      if (res.status === 200) {
        form.setValue('content', res.data.question);

        let answerConfig: string = '';
        const answers = res.data.options.map((answer: any, index: number) => {
          if (answer.is_correct) {
            answerConfig = String.fromCharCode(65 + index);
          }
          return {
            content: {
              text: answer.content,
              value: String.fromCharCode(65 + index),
            },
            order_index: index + 1,
          };
        });

        form.setValue('answers', answers);
        form.setValue('answer_config', { correct: answerConfig, options_count: answers.length, kind: 'single_choice' });
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
        <Button
          className="bg-black hover:bg-black/80"
          onClick={() => {
            setEditingQuestion?.(null);
            setIsDialogOpen(true);
            form.reset();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm câu hỏi
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[70vw] max-w-[1200px] max-h-[90vh] overflow-y-auto bg-white p-6">
        <DialogHeader>
          <div className="flex justify-between">
            <div>
              <DialogTitle>{editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</DialogTitle>
              <DialogDescription>{editingQuestion ? 'Cập nhật thông tin câu hỏi' : 'Tạo câu hỏi mới cho ngân hàng'}</DialogDescription>
            </div>
            <div>
              {form.getValues('subject_id') && questionType === 'single_choice' && (
                <Popover>
                  <PopoverTrigger>
                    <img src={IconAI} alt="Icon AI" className="size-14" />
                  </PopoverTrigger>
                  <PopoverContent className="" side="left">
                    <div className="flex flex-col gap-4">
                      <Label>Tạo câu hỏi với AI</Label>
                      <Textarea rows={4} placeholder="Nhập nội dung câu hỏi mẫu..." onChange={(e) => setContentGenerateQuestion(e.target.value)} />
                      <Button onClick={handleGerenateQuestionByAI}>{isLoadingGenerateQuestion ? 'Đang tạo...' : 'Gửi yêu cầu'}</Button>
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
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        value={field.value}
                        disabled={isLoadingQuestionTypes}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingQuestionTypes ? 'Đang tải loại câu hỏi...' : 'Chọn loại câu hỏi'} />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes?.data.map((type) => (
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isLoadingDifficultyLevels ? 'Đang tải độ khó...' : 'Chọn độ khó'} />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyLevels?.data.map((difficulty) => (
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
              <FormField control={form.control} name="content" render={({ field }) => <QuillEditor form={form} name="content" label="Nội dung câu hỏi" placeholder="Nhập nội dung câu hỏi..." />} />
            </div>

            {questionType === 'single_choice' && (
              <SingleChoiceForm form={form} addOption={addOption} removeOption={removeOption} updateOption={updateOption} toggleCorrectAnswer={toggleCorrectAnswer} />
            )}
            {questionType === 'multiple_select' && (
              <MultipleChoiceForm form={form} addOption={addOption} removeOption={removeOption} updateOption={updateOption} toggleCorrectAnswer={toggleCorrectAnswer} />
            )}
            {questionType === 'matching' && <MatchingForm form={form} addOption={addOption} removeOption={removeOption} updateMatchContent={updateMatchContent} />}
            {questionType === 'ordering' && <OrderingForm form={form} addOption={addOption} removeOption={removeOption} />}
            {questionType === 'drag_drop' && <DrapDropForm addOption={addOption} removeOption={removeOption} updateOption={updateOption} />}
            {/* {questionType === "video_popup" && (
              <VideoPopupForm
                form={form}
                addOption={addOption}
                removeOption={removeOption}
                updateOption={updateOption}
              />
            )} */}

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
                          <InfoPopup text="Khi lưu vào ngân hàng câu hỏi cần phải qua sự kiểm duyệt của quản trị viên" open={open} setOpen={setOpen} />
                        </div>
                        <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=unchecked]:bg-gray-300 cursor-pointer" />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <div>
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
                <Button type="submit" className="bg-black hover:bg-black/80" disabled={isLoadingSubmit}>
                  {isLoadingSubmit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingQuestion ? 'Đang cập nhật...' : 'Đang tạo...'}
                    </>
                  ) : editingQuestion ? (
                    'Cập nhật'
                  ) : (
                    'Tạo câu hỏi'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionFormDialog;
