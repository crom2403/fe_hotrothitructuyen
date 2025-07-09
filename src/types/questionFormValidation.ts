import { z } from 'zod';
import type { QuestionTypeResponse } from './questionType';
import {
  isMatchingConfig,
  isOrderingConfig,
  isVideoPopupConfig,
  type SingleChoiceConfig,
  type MultipleSelectConfig,
  type DragDropConfig,
  type MatchingConfig,
  type OrderingConfig,
  type VideoPopupConfig,
} from './questionFormTypes';

// Schema for AnswerContent (union type for different question types)
export const answerContentSchema = z.union([
  z.object({
    text: z.string().min(1, 'Nội dung đáp án không được để trống'),
    value: z.string().optional(),
  }),
  z.object({
    left: z.string().min(1, 'Nội dung cột trái không được để trống'),
    right: z.string().min(1, 'Nội dung cột phải không được để trống'),
  }),
]);

// Schema for AnswerItem
export const answerItemSchema = z.object({
  id: z.string(),
  content: answerContentSchema,
  order_index: z.number().int().min(1, 'Thứ tự phải bắt đầu từ 1'),
});

// Schemas for different answer configurations
export const singleChoiceConfigSchema = z.object({
  kind: z.literal('single_choice'),
  options_count: z.number().min(2, 'Phải có ít nhất 2 phương án'),
  correct: z.string().min(1, 'Phải chọn 1 đáp án đúng'),
});

export const multipleSelectConfigSchema = z.object({
  kind: z.literal('multiple_select'),
  options_count: z.number().min(2, 'Phải có ít nhất 2 phương án'),
  correct: z.array(z.string()).min(1, 'Phải có ít nhất 1 đáp án đúng'),
});

export const dragDropConfigSchema = z.object({
  kind: z.literal('drag_drop'),
  zones: z
    .array(
      z.object({
        text: z.string().min(1, 'Tên vùng không được để trống'),
        value: z.string().min(1, 'Giá trị vùng không được để trống'),
      }),
    )
    .min(1, 'Phải có ít nhất 1 vùng'),
  correct: z
    .array(
      z.object({
        id: z.string(),
        zone: z.string().min(1, 'Vùng không được để trống'),
        value: z.string().min(1, 'Giá trị không được để trống'),
      }),
    )
    .min(1, 'Phải có ít nhất 1 mục đúng'),
});

export const matchingConfigSchema = z.object({
  kind: z.literal('matching'),
  pairs: z
    .array(
      z.object({
        left: z.string().min(1, 'Nội dung cột trái không được để trống'),
        right: z.string().min(1, 'Nội dung cột phải không được để trống'),
      }),
    )
    .min(2, 'Phải có ít nhất 2 cặp ghép'),
  correct: z
    .array(
      z.object({
        left: z.string().min(1, 'Nội dung cột trái không được để trống'),
        right: z.string().min(1, 'Nội dung cột phải không được để trống'),
      }),
    )
    .min(2, 'Phải có ít nhất 2 cặp đúng'),
});

export const orderingConfigSchema = z.object({
  kind: z.literal('ordering'),
  items_count: z.number().min(2, 'Phải có ít nhất 2 mục'),
  correct: z
    .array(
      z.object({
        id: z.string(),
        value: z.string(),
        order: z.number().int().min(1, 'Thứ tự phải bắt đầu từ 1'),
      }),
    )
    .min(2, 'Phải có ít nhất 2 mục đúng'),
});

export const videoPopupConfigSchema = z.object({
  kind: z.literal('video_popup'),
  video_id: z.string().min(1, 'Video ID không được để trống'),
  url: z.string().url('URL video không hợp lệ'),
  popup_times: z
    .array(
      z.object({
        id: z.string(),
        time: z.number().min(0, 'Thời gian phải lớn hơn hoặc bằng 0'),
        question: z.string().min(1, 'Câu hỏi không được để trống'),
        options: z.array(z.string()).min(2, 'Phải có ít nhất 2 phương án'),
        correct: z.string().min(1, 'Phải chọn 1 đáp án đúng'),
      }),
    )
    .min(1, 'Phải có ít nhất 1 câu hỏi popup'),
});

export const answerConfigSchema = z.discriminatedUnion('kind', [
  singleChoiceConfigSchema,
  multipleSelectConfigSchema,
  dragDropConfigSchema,
  matchingConfigSchema,
  orderingConfigSchema,
  videoPopupConfigSchema,
]);

export const createQuestionSchema = (questionTypes: QuestionTypeResponse | undefined) =>
  z
    .object({
      content: z.string().min(1, 'Nội dung câu hỏi không được để trống'),
      type_id: z.string().min(1, 'Vui lòng chọn loại câu hỏi'),
      subject_id: z.string().min(1, 'Vui lòng chọn môn học'),
      difficulty_level_id: z.string().min(1, 'Vui lòng chọn độ khó'),
      answers: z.array(answerItemSchema).min(2, 'Phải có ít nhất 2 phương án/cặp ghép'),
      answer_config: answerConfigSchema,
      explanation: z.string().optional(),
      is_public: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      // Kiểm tra nếu questionTypes là undefined hoặc không có data
      const questionTypesData = questionTypes?.data || [];
      const questionTypeCode = questionTypesData.find((type) => type.id === data.type_id)?.code || '';

      // Validate answer content structure based on question type
      data.answers.forEach((answer, index) => {
        if (questionTypeCode === 'matching') {
          if (!('left' in answer.content && 'right' in answer.content)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`answers.${index}.content`],
              message: "Đáp án cho câu hỏi ghép cặp phải có thuộc tính 'left' và 'right'",
            });
          }
        } else if (['single_choice', 'multiple_select', 'ordering'].includes(questionTypeCode)) {
          if (!('text' in answer.content)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`answers.${index}.content`],
              message: "Đáp án phải có thuộc tính 'text' cho loại câu hỏi này",
            });
          }
        }
      });

      // Validate specific question types
      const answerConfig = data.answer_config as { kind: string };
      if (questionTypeCode === 'single_choice') {
        const config = data.answer_config as SingleChoiceConfig;
        if (data.answers.length !== config.options_count) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answers'],
            message: 'Số lượng đáp án phải khớp với options_count',
          });
        }
        const validValues = data.answers.map((a) => ('value' in a.content && a.content.value ? a.content.value : 'text' in a.content && a.content.text ? a.content.text : ''));
        if (!validValues.includes(config.correct)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answer_config.correct'],
            message: 'Đáp án đúng phải nằm trong danh sách đáp án',
          });
        }
      } else if (questionTypeCode === 'multiple_select') {
        const config = data.answer_config as MultipleSelectConfig;
        if (data.answers.length !== config.options_count) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answers'],
            message: 'Số lượng đáp án phải khớp với options_count',
          });
        }
        const validValues = data.answers.map((a) => ('value' in a.content && a.content.value ? a.content.value : 'text' in a.content && a.content.text ? a.content.text : ''));
        if (!config.correct.every((c) => validValues.includes(c))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answer_config.correct'],
            message: 'Tất cả đáp án đúng phải nằm trong danh sách đáp án',
          });
        }
      } else if (questionTypeCode === 'drag_drop' && answerConfig.kind === 'drag_drop') {
        const config = data.answer_config as DragDropConfig;
        if (config.correct.length !== data.answers.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answers'],
            message: 'Số lượng đáp án phải khớp với số lượng mục đúng',
          });
        }
        if (!config.correct.every((c) => data.answers.some((a) => a.id === c.id))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answer_config.correct'],
            message: 'Tất cả ID trong correct phải khớp với ID trong answers',
          });
        }
      } else if (questionTypeCode === 'matching' && isMatchingConfig(data.answer_config as MatchingConfig)) {
        const config = data.answer_config as MatchingConfig;
        if (config.pairs.length !== data.answers.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answers'],
            message: 'Số lượng đáp án phải khớp với số lượng cặp',
          });
        }
        config.pairs.forEach((pair, index) => {
          if (!data.answers.some((a) => 'left' in a.content && a.content.left === pair.left && a.content.right === pair.right)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`answer_config.pairs.${index}`],
              message: 'Cặp ghép phải khớp với đáp án',
            });
          }
        });
        config.correct?.forEach((correct, index) => {
          if (!config.pairs.some((p) => p.left === correct.left && p.right === correct.right)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`answer_config.correct.${index}`],
              message: 'Cặp đúng phải nằm trong danh sách cặp ghép',
            });
          }
        });
      } else if (questionTypeCode === 'ordering' && isOrderingConfig(data.answer_config as OrderingConfig)) {
        const config = data.answer_config as OrderingConfig;
        if (data.answers.length !== config.items_count) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answers'],
            message: 'Số lượng đáp án phải khớp với items_count',
          });
        }
        if (config.correct.length !== data.answers.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answer_config.correct'],
            message: 'Số lượng mục đúng phải khớp với số lượng đáp án',
          });
        }
        if (!config.correct.every((c) => data.answers.some((a) => a.id === c.id && a.order_index === c.order))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answer_config.correct'],
            message: 'Thứ tự và ID trong correct phải khớp với answers',
          });
        }
      } else if (questionTypeCode === 'video_popup' && isVideoPopupConfig(data.answer_config as VideoPopupConfig)) {
        const config = data.answer_config as VideoPopupConfig;
        const totalOptions = config.popup_times.flatMap((p) => p.options).length;
        if (data.answers.length !== totalOptions) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answers'],
            message: 'Số lượng đáp án phải khớp với tổng số phương án trong popup_times',
          });
        }
        config.popup_times.forEach((popup, index) => {
          if (!popup.options.includes(popup.correct)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`answer_config.popup_times.${index}.correct`],
              message: 'Đáp án đúng phải nằm trong danh sách phương án của câu hỏi popup',
            });
          }
        });
      }
    });
