import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useFieldArray } from 'react-hook-form';
import { isVideoPopupConfig, type QuestionFormData, type VideoPopupConfig } from '@/types/questionFormTypes';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type { UseFormReturn } from 'react-hook-form';
import { useRef, useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { VideoUpload } from '@/components/upload/VideoUpload';

interface VideoPopupFormProps {
  form: UseFormReturn<QuestionFormData>;
  updateOption: (index: number, text: string, value?: string) => void;
}

const MAX_OPTIONS = 4;

export const VideoPopupForm = ({ form, updateOption }: VideoPopupFormProps) => {
  const { register, control, setValue, watch } = form;
  const popupTimes = useFieldArray({ control, name: 'answer_config.popup_times' });
  const answers = useFieldArray({ control, name: 'answers' });
  const config = watch('answer_config');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const isVideoPopup = isVideoPopupConfig(config);

  // Đảm bảo popup_times luôn có options hợp lệ
  useEffect(() => {
    if (isVideoPopup && (config as VideoPopupConfig).popup_times) {
      (config as VideoPopupConfig).popup_times.forEach((popup, index) => {
        if (!popup.options || !Array.isArray(popup.options)) {
          setValue(`answer_config.popup_times.${index}.options`, ['A', 'B']);
        }
      });
    }
  }, [config, setValue, isVideoPopup]);

  const handleAddPopup = () => {
    const newPopupId = uuidv4();
    popupTimes.append({
      time: 0,
      question: '',
      options: ['A', 'B'],
      correct: '',
    });

    const newAnswers = [
      { id: uuidv4(), content: { text: '', value: 'A' }, order_index: answers.fields.length + 1 },
      { id: uuidv4(), content: { text: '', value: 'B' }, order_index: answers.fields.length + 2 },
    ];
    answers.append(newAnswers);
  };

  const handleRemovePopup = (index: number) => {
    if (!isVideoPopup) return;
    const popupOptionsCount = (config as VideoPopupConfig).popup_times[index]?.options?.length || 0;
    const startIndex = (config as VideoPopupConfig).popup_times.slice(0, index).reduce((acc, p) => acc + (p.options?.length || 0), 0);
    for (let i = 0; i < popupOptionsCount; i++) {
      answers.remove(startIndex);
    }
    popupTimes.remove(index);
  };

  const handleAddOptionToPopup = (popupIndex: number) => {
    if (!isVideoPopup) return;
    const scrollPosition = scrollRef.current?.scrollTop;
    const updated = [...(config as VideoPopupConfig).popup_times];
    const newOptionValue = String.fromCharCode(65 + (updated[popupIndex].options?.length || 0));
    const newOptions = [...(updated[popupIndex].options || []), newOptionValue];

    popupTimes.update(popupIndex, {
      ...updated[popupIndex],
      options: newOptions,
    });

    const startIndex = (config as VideoPopupConfig).popup_times.slice(0, popupIndex).reduce((acc, p) => acc + (p.options?.length || 0), 0);
    const newAnswer = {
      id: uuidv4(),
      content: { text: '', value: newOptionValue },
      order_index: startIndex + newOptions.length,
    };
    answers.append(newAnswer);

    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollPosition || 0;
      }
    }, 0);
  };

  const handleRemoveOptionFromPopup = (popupIndex: number, optionIndex: number) => {
    if (!isVideoPopup) return;
    const updated = [...(config as VideoPopupConfig).popup_times];
    if ((updated[popupIndex].options?.length || 0) <= 2) {
      toast.error('Cần ít nhất 2 phương án cho mỗi câu hỏi popup');
      return;
    }
    const newOptions = (updated[popupIndex].options || []).filter((_, i) => i !== optionIndex);
    if (updated[popupIndex].correct === updated[popupIndex].options?.[optionIndex]) {
      updated[popupIndex].correct = '';
      setValue(`answer_config.popup_times.${popupIndex}.correct`, '');
    }
    popupTimes.update(popupIndex, {
      ...updated[popupIndex],
      options: newOptions,
    });

    const startIndex = (config as VideoPopupConfig).popup_times.slice(0, popupIndex).reduce((acc, p) => acc + (p.options?.length || 0), 0);
    answers.remove(startIndex + optionIndex);
  };

  const handleUpdateOption = (popupIndex: number, optionIndex: number, text: string) => {
    if (!isVideoPopup) return;
    const updated = [...(config as VideoPopupConfig).popup_times];
    const optionValue = updated[popupIndex].options?.[optionIndex] || '';
    const startIndex = (config as VideoPopupConfig).popup_times.slice(0, popupIndex).reduce((acc, p) => acc + (p.options?.length || 0), 0);
    updateOption(startIndex + optionIndex, text, optionValue);
  };

  const handleToggleCorrect = (popupIndex: number, value: string) => {
    if (!isVideoPopup) return;
    setValue(`answer_config.popup_times.${popupIndex}.correct`, value === watch(`answer_config.popup_times.${popupIndex}.correct`) ? '' : value);
  };

  return (
    <div className="space-y-6" ref={scrollRef}>
      <div className="space-y-2">
        <Label>Upload video</Label>
        <VideoUpload onUploadSuccess={setVideoUrl} />
      </div>

      <div className="space-y-4">
        <Label className="text-lg font-medium">Câu hỏi Popup</Label>
        {popupTimes.fields.map((popup, index) => (
          <div key={popup.id} className="border rounded-lg p-4 space-y-4 relative">
            <button type="button" onClick={() => handleRemovePopup(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="space-y-2">
              <Label htmlFor={`popup-time-${index}`}>Thời gian (giây)</Label>
              <Input type="number" step="0.1" min="0" {...register(`answer_config.popup_times.${index}.time` as const)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`popup-question-${index}`}>Câu hỏi</Label>
              <Textarea
                rows={2}
                {...register(`answer_config.popup_times.${index}.question` as const)}
                accept-charset="UTF-8"
                onChange={(e) => setValue(`answer_config.popup_times.${index}.question`, e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Phương án</Label>
                <Button type="button" size="sm" variant="outline" onClick={() => handleAddOptionToPopup(index)} disabled={popup.options?.length >= MAX_OPTIONS}>
                  <Plus className="h-4 w-4 mr-1" /> Thêm phương án
                </Button>
              </div>
              <RadioGroup value={watch(`answer_config.popup_times.${index}.correct`) || ''} onValueChange={(value) => handleToggleCorrect(index, value)} className="space-y-2">
                {(popup.options || []).map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`answer-${index}-${optIndex}`} className="border-gray-700" />
                    <span className="w-8">{opt}</span>
                    <Input
                      className="flex-1"
                      value={
                        answers.fields[isVideoPopup ? (config as VideoPopupConfig).popup_times.slice(0, index).reduce((acc, p) => acc + (p.options?.length || 0), 0) + optIndex : 0]?.content?.value ||
                        ''
                      }
                      onChange={(e) => handleUpdateOption(index, optIndex, e.target.value)}
                      placeholder={`Phương án ${opt}`}
                      accept-charset="UTF-8"
                    />
                    {(popup.options?.length || 0) > 2 && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => handleRemoveOptionFromPopup(index, optIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ))}

        <Button type="button" onClick={handleAddPopup}>
          <Plus className="h-4 w-4 mr-2" /> Thêm câu hỏi popup
        </Button>
      </div>
    </div>
  );
};

export default VideoPopupForm;
