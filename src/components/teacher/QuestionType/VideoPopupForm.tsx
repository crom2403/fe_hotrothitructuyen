import React, { useRef, useEffect, useState, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { isVideoPopupConfig, type QuestionFormData, type VideoPopupConfig } from '@/types/questionFormTypes';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { VideoUpload } from '@/components/upload/VideoUpload';
import { Slider } from '@/components/ui/slider';

interface VideoPopupFormProps {
  form: UseFormReturn<QuestionFormData>;
  updateOption: (index: number, text: string, value?: string) => void;
}

const DEFAULT_OPTIONS = ['A', 'B', 'C', 'D'];

const TextareaWithRef = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => <Textarea {...props} ref={ref} />);
TextareaWithRef.displayName = 'TextareaWithRef';

export const VideoPopupForm = ({ form, updateOption }: VideoPopupFormProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0); 
  const { setValue, watch, register, formState: { errors } } = form; 

  const popupTimes = useFieldArray({
    name: 'answer_config.popup_times',
    control: form.control,
  });

  const answers = useFieldArray({
    name: 'answers',
    control: form.control,
  });

  const config = watch('answer_config');
  const isVideoPopup = isVideoPopupConfig(config);
  const currentUrl = watch('answer_config.url') || ''; // Lấy url từ form

  useEffect(() => {
    if (isVideoPopup && config.popup_times) {
      config.popup_times.forEach((popup, index) => {
        if (!popup.options || !Array.isArray(popup.options) || popup.options.length !== DEFAULT_OPTIONS.length) {
          setValue(`answer_config.popup_times.${index}.options`, DEFAULT_OPTIONS);
        }
      });
    }
  }, [config, setValue, isVideoPopup]);

  const handleVideoLoad = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    setVideoDuration(video.duration);
  };

  const handleAddPopup = () => {
    if (!currentUrl) {
      toast.error('Vui lòng tải lên video trước.');
      return;
    }

    if (!isVideoPopup) return;

    const existingTimes = config.popup_times.map((p) => p.time);
    let newTime = 0;

    while (existingTimes.some((time) => Math.abs(time - newTime) < 1)) {
      newTime += 1;
      if (newTime > videoDuration) {
        toast.error('Không có thời gian trống cho câu hỏi popup mới');
        return;
      }
    }

    const newPopupId = uuidv4();
    popupTimes.append({
      time: newTime,
      question: '',
      options: DEFAULT_OPTIONS,
      correct: '',
    });

    const newAnswers = DEFAULT_OPTIONS.map((opt) => ({
      id: uuidv4(),
      content: {
        kind: 'text' as const,
        text: '',
        value: opt,
      },
      order_index: answers.fields.length + 1,
    }));
    answers.append(newAnswers);

    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (popupIndex: number, newValue: number) => {
    if (!isVideoPopup) return;

    const otherTimes = (config as VideoPopupConfig).popup_times.map((p) => p.time).filter((_, i) => i !== popupIndex);

    if (otherTimes.some((time) => Math.abs(time - newValue) < 1)) {
      toast.error('Thời gian bật lên phải cách nhau ít nhất 1 giây.');
      return;
    }

    setValue(`answer_config.popup_times.${popupIndex}.time`, newValue);
  };

  return (
    <div className="space-y-6" ref={scrollRef}>
      <div className="space-y-2">
        <Label>Upload video</Label>
        <VideoUpload
          onUploadSuccess={() => {}} // Giữ onUploadSuccess để tránh lỗi
          onUploadError={(error) => toast.error(error)}
          setValue={setValue} // Truyền setValue vào
          maxSizeMB={100}
        />
        {currentUrl && (
          <div className="space-y-2">
            <Label className="hidden">URL video</Label>
            <Input
              {...register('answer_config.url')}
              value={currentUrl}
              placeholder="https://example.com/video.mp4"
              accept-charset="UTF-8"
              disabled
              className="hidden"
            />
            <video src={currentUrl} className="hidden" onLoadedMetadata={handleVideoLoad} />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Câu hỏi Popup</Label>
          <Button type="button" variant="outline" onClick={handleAddPopup} disabled={!currentUrl}>
            <Plus className="h-4 w-4 mr-1" /> Thêm câu hỏi
          </Button>
        </div>

        {popupTimes.fields.map((popup, index) => (
          <div key={popup.id} className="border rounded-lg p-4 space-y-4 relative">
            <button type="button" onClick={() => handleRemovePopup(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="space-y-2">
              <Label htmlFor={`popup-time-${index}`}>Thời gian ({formatTime(watch(`answer_config.popup_times.${index}.time`) || 0)})</Label>
              <div className="px-2">
                <Slider
                  value={[watch(`answer_config.popup_times.${index}.time`) || 0]}
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  onValueChange={([value]) => handleTimeChange(index, value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`popup-question-${index}`}>Câu hỏi</Label>
              <TextareaWithRef
                rows={2}
                {...register(`answer_config.popup_times.${index}.question` as const)}
                accept-charset="UTF-8"
                onChange={(e) => setValue(`answer_config.popup_times.${index}.question`, e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Phương án</Label>
              <RadioGroup
                value={watch(`answer_config.popup_times.${index}.correct`) || ''}
                onValueChange={(value) => handleToggleCorrect(index, value)}
                className="space-y-2"
              >
                {DEFAULT_OPTIONS.map((option, optionIndex) => {
                  const answerStartIndex = (config as VideoPopupConfig).popup_times.slice(0, index).reduce((acc, p) => acc + (p.options?.length || 0), 0);
                  const answer = answers.fields[answerStartIndex + optionIndex];
                  const content = answer?.content as { text: string; value?: string };

                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}-${optionIndex}`} />
                      <div className="flex-1">
                        <Input
                          placeholder={`Phương án ${option}`}
                          value={content?.text || ''}
                          onChange={(e) => handleUpdateOption(index, optionIndex, e.target.value)}
                        />
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </div>
        ))}
      </div>
      {Object.keys(errors).length > 0 && <pre>{JSON.stringify(errors, null, 2)}</pre>} 
    </div>
  );
};

export default VideoPopupForm;