import React, { useRef, useEffect, useState, forwardRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useFieldArray, type UseFormReturn, useWatch } from 'react-hook-form';
import { type AnswerItem, type QuestionFormData, type VideoPopupConfig, type AnswerContent } from '@/types/questionFormTypes';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { VideoUpload } from '@/components/upload/VideoUpload';
import { Slider } from '@/components/ui/slider';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface VideoPopupFormProps {
  form: UseFormReturn<QuestionFormData>;
  updateOption: (index: number, text: string, value?: string) => void;
}

const DEFAULT_OPTIONS = ['A', 'B', 'C', 'D'];

const TextareaWithRef = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => <Textarea {...props} ref={ref} />);
TextareaWithRef.displayName = 'TextareaWithRef';

const isTextContent = (content: AnswerContent): content is { text: string; value?: string } => {
  return 'text' in content;
};

export const VideoPopupForm = ({ form, updateOption }: VideoPopupFormProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  
  const [localInputs, setLocalInputs] = useState<{[key: string]: string}>({});
  
  const { setValue, formState: { errors } } = form;

  const popupTimes = useFieldArray({
    name: 'answer_config.popup_times',
    control: form.control,
  });

  const answers = useFieldArray({
    name: 'answers',
    control: form.control,
  });

  const config = useWatch({
    control: form.control,
    name: 'answer_config',
  }) as VideoPopupConfig | undefined;

  const currentUrl = useWatch({
    control: form.control,
    name: 'answer_config.url',
  });

  useEffect(() => {
    if (!config || config.kind !== 'video_popup') {
      const videoId = uuidv4();
      setValue('answer_config', {
        kind: 'video_popup',
        video_id: videoId,
        url: '',
        popup_times: [
          {
            time: 0,
            question: '',
            options: DEFAULT_OPTIONS,
            correct: '',
          },
        ],
      });
    }
  }, [config, setValue]);

  // Initialize answers and local inputs based on popup_times
  useEffect(() => {
    if (config && config.popup_times) {
      const totalAnswersNeeded = config.popup_times.length * DEFAULT_OPTIONS.length;
      const currentAnswersCount = answers.fields.length;
      
      if (currentAnswersCount < totalAnswersNeeded) {
        for (let i = currentAnswersCount; i < totalAnswersNeeded; i++) {
          const popupIndex = Math.floor(i / DEFAULT_OPTIONS.length);
          const optionIndex = i % DEFAULT_OPTIONS.length;
          answers.append({
            id: uuidv4(),
            content: { text: '', value: DEFAULT_OPTIONS[optionIndex] },
            order_index: i + 1,
          });
        }
      }

      const newLocalInputs: {[key: string]: string} = {};
      config.popup_times.forEach((popup, popupIndex) => {
        DEFAULT_OPTIONS.forEach((option, optionIndex) => {
          const globalIndex = popupIndex * DEFAULT_OPTIONS.length + optionIndex;
          const key = `${popupIndex}-${optionIndex}`;
          const answer = answers.fields[globalIndex];
          newLocalInputs[key] = answer?.content && isTextContent(answer.content) ? answer.content.text : '';
        });
      });
      setLocalInputs(newLocalInputs);
    }
  }, [config?.popup_times?.length, answers.fields.length]);

  useEffect(() => {
    if (currentUrl) {
      setIsVideoLoaded(false);
      setVideoDuration(0);
    }
  }, [currentUrl]);

  const handleVideoLoad = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    setVideoDuration(video.duration);
    setIsVideoLoaded(true);
  };

  const handleAddPopup = () => {
    if (!currentUrl) {
      toast.error('Vui lòng tải lên video trước.');
      return;
    }

    if (!isVideoLoaded || videoDuration === 0) {
      toast.error('Video chưa được tải hoàn toàn. Vui lòng đợi một chút.');
      return;
    }

    const existingTimes = config?.popup_times.map((p) => p.time) || [];
    
    const findNextAvailableTime = (startTime: number): number => {
      let candidateTime = startTime;
      while (candidateTime <= videoDuration) {
        const isTimeAvailable = !existingTimes.some((time) => Math.abs(time - candidateTime) < 1);
        if (isTimeAvailable) {
          return candidateTime;
        }
        candidateTime += 1;
      }
      return -1;
    };

    const newTime = findNextAvailableTime(0);
    
    if (newTime === -1) {
      toast.error('Không có thời gian trống cho câu hỏi popup mới');
      return;
    }

    const newPopupIndex = popupTimes.fields.length;
    
    popupTimes.append({
      time: newTime,
      question: '',
      options: DEFAULT_OPTIONS,
      correct: '',
    });

    DEFAULT_OPTIONS.forEach((opt, optionIndex) => {
      const answerId = uuidv4();
      answers.append({
        id: answerId,
        content: { text: '', value: opt },
        order_index: answers.fields.length + 1,
      });
      
      const key = `${newPopupIndex}-${optionIndex}`;
      setLocalInputs(prev => ({
        ...prev,
        [key]: ''
      }));
    });

    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
  };

  const handleRemovePopup = (index: number) => {
    if (!config) return;
    
    const count = DEFAULT_OPTIONS.length;
    const startIndex = index * count;
    for (let i = count - 1; i >= 0; i--) {
      answers.remove(startIndex + i);
    }
    
    popupTimes.remove(index);
    
    const newLocalInputs = { ...localInputs };
    DEFAULT_OPTIONS.forEach((_, optionIndex) => {
      const key = `${index}-${optionIndex}`;
      delete newLocalInputs[key];
    });
    
    const updatedInputs: {[key: string]: string} = {};
    Object.entries(newLocalInputs).forEach(([key, value]) => {
      const [popupIdx, optionIdx] = key.split('-').map(Number);
      if (popupIdx > index) {
        updatedInputs[`${popupIdx - 1}-${optionIdx}`] = value;
      } else if (popupIdx < index) {
        updatedInputs[key] = value;
      }
    });
    
    setLocalInputs(updatedInputs);
  };

  const debouncedUpdateRef = useRef<{[key: string]: NodeJS.Timeout}>({});
  
  const handleInputChange = useCallback((popupIndex: number, optionIndex: number, text: string) => {
    const key = `${popupIndex}-${optionIndex}`;
    
    setLocalInputs(prev => ({
      ...prev,
      [key]: text
    }));
    
    if (debouncedUpdateRef.current[key]) {
      clearTimeout(debouncedUpdateRef.current[key]);
    }
    
    debouncedUpdateRef.current[key] = setTimeout(() => {
      const globalIndex = popupIndex * DEFAULT_OPTIONS.length + optionIndex;
      const existingAnswer = answers.fields[globalIndex];
      
      if (existingAnswer) {
        const newAnswer: AnswerItem = {
          id: existingAnswer.id,
          content: { text, value: DEFAULT_OPTIONS[optionIndex] },
          order_index: globalIndex + 1,
        };
        
        answers.update(globalIndex, newAnswer);
        updateOption(globalIndex, text, DEFAULT_OPTIONS[optionIndex]);
      }
    }, 300);
  }, [answers, updateOption]);

  const handleToggleCorrect = (popupIndex: number, value: string) => {
    setValue(`answer_config.popup_times.${popupIndex}.correct`, value);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (popupIndex: number, newValue: number[]) => {
    setValue(`answer_config.popup_times.${popupIndex}.time`, newValue[0]);
  };

  return (
    <div className="space-y-6" ref={scrollRef}>
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="answer_config.url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload video</FormLabel>
              <FormControl>
                <VideoUpload
                  onUploadSuccess={(url) => {
                    field.onChange(url);
                    setValue('answer_config.url', url);
                  }}
                  onUploadError={(error) => toast.error(error)}
                  maxSizeMB={100}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {currentUrl && (
        <div className="space-y-2">
          <Label>Video Preview</Label>
          <video
            src={currentUrl}
            onLoadedMetadata={handleVideoLoad}
            style={{ width: '100%', maxWidth: '400px' }}
            controls
          />
          {isVideoLoaded && (
            <p className="text-sm text-gray-500">
              Thời lượng video: {formatTime(videoDuration)}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Câu hỏi Popup</Label>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddPopup} 
            disabled={!currentUrl || !isVideoLoaded}
          >
            <Plus className="h-4 w-4 mr-1" /> Thêm câu hỏi
          </Button>
        </div>

        {popupTimes.fields.map((popup, index) => (
          <div key={popup.id} className="border rounded-lg p-4 space-y-4 relative">
            <button 
              type="button" 
              onClick={() => handleRemovePopup(index)} 
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="space-y-2">
              <Label htmlFor={`popup-time-${index}`}>
                Thời gian ({formatTime(config?.popup_times[index]?.time || 0)})
              </Label>
              <Slider
                value={[config?.popup_times[index]?.time || 0]}
                min={0}
                max={videoDuration}
                step={0.1}
                onValueChange={handleTimeChange.bind(null, index)}
              />
            </div>

            <FormField
              control={form.control}
              name={`answer_config.popup_times.${index}.question`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Câu hỏi</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={2} 
                      value={field.value || ''} 
                      onChange={field.onChange} 
                      placeholder="Nhập câu hỏi..." 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Phương án</Label>
              <RadioGroup 
                value={config?.popup_times[index]?.correct || ''} 
                onValueChange={(value) => handleToggleCorrect(index, value)} 
                className="space-y-2"
              >
                {DEFAULT_OPTIONS.map((option, optionIndex) => {
                  const key = `${index}-${optionIndex}`;
                  const inputValue = localInputs[key] || '';

                  return (
                    <div key={`popup-${index}-option-${optionIndex}`} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}-${optionIndex}`} />
                      <div className="flex-1">
                        <Input
                          placeholder={`Phương án ${option}`}
                          value={inputValue}
                          onChange={(e) => handleInputChange(index, optionIndex, e.target.value)}
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

      {Object.keys(errors).length > 0 && (
        <pre className="text-red-500 bg-gray-100 p-2 rounded">
          {JSON.stringify(errors, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default VideoPopupForm;