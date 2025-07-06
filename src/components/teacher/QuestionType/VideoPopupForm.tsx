import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { VideoUpload } from '@/components/upload/VideoUpload';
import { Slider } from '@/components/ui/slider';
import { v4 as uuidv4 } from 'uuid';
import type { UseFormReturn } from 'react-hook-form';
import type { QuestionFormData } from '@/types/questionFormTypes';
import type { AxiosError } from 'axios';
import { apiCreateQuestion } from '@/services/teacher/question';

interface VideoPopupConfig {
  video_id: string;
  url: string;
  popup_times: Array<{
    id: string;
    time: number;
    question: string;
    options: string[];
    correct: string;
  }>;
}

interface AnswerItem {
  id: string;
  content: { text: string; value: string };
  order_index: number;
}

interface VideoPopupFormProps {
  form: UseFormReturn<QuestionFormData>;
  onSaveSuccess: () => void;
}

const DEFAULT_OPTIONS = ['A', 'B', 'C', 'D'];

export const VideoPopupForm = ({ form, onSaveSuccess }: VideoPopupFormProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState<boolean>(false);
  const [videoConfig, setVideoConfig] = useState<VideoPopupConfig>({
    video_id: uuidv4(),
    url: '',
    popup_times: [],
  });
  const [answers, setAnswers] = useState<AnswerItem[]>([]);

  const handleVideoLoad = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    setVideoDuration(video.duration);
    setIsVideoLoaded(true);
  };

  const handleAddPopup = () => {
    if (!videoConfig.url) {
      toast.error('Vui lòng tải lên video trước.');
      return;
    }

    if (!isVideoLoaded || videoDuration === 0) {
      toast.error('Video chưa được tải hoàn toàn. Vui lòng đợi một chút.');
      return;
    }

    const existingTimes = videoConfig.popup_times.map((p) => p.time);

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

    const newPopupIndex = videoConfig.popup_times.length;

    setVideoConfig((prev) => ({
      ...prev,
      popup_times: [
        ...prev.popup_times,
        {
          id: `popup-${newPopupIndex}`,
          time: newTime,
          question: '',
          options: DEFAULT_OPTIONS,
          correct: '',
        },
      ],
    }));

    setAnswers((prev) => [
      ...prev,
      ...DEFAULT_OPTIONS.map((opt, optionIndex) => ({
        id: `answer-${newPopupIndex}-${optionIndex}`,
        content: { text: '', value: opt },
        order_index: prev.length + optionIndex + 1,
      })),
    ]);

    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
  };

  const handleRemovePopup = (index: number) => {
    const count = DEFAULT_OPTIONS.length;
    const startIndex = index * count;

    setVideoConfig((prev) => ({
      ...prev,
      popup_times: prev.popup_times.filter((_, i) => i !== index),
    }));

    setAnswers((prev) => prev.filter((_, i) => i < startIndex || i >= startIndex + count));

    // Cập nhật lại order_index cho answers
    setAnswers((prev) =>
      prev.map((answer, i) => ({
        ...answer,
        order_index: i + 1,
      })),
    );
  };

  const handleInputChange = useCallback((popupIndex: number, optionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const globalIndex = popupIndex * DEFAULT_OPTIONS.length + optionIndex;

    setAnswers((prev) =>
      prev.map((answer, i) =>
        i === globalIndex
          ? {
            ...answer,
            content: { text, value: DEFAULT_OPTIONS[optionIndex] },
          }
          : answer,
      ),
    );
  }, []);

  const handleQuestionChange = useCallback((popupIndex: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;

    setVideoConfig((prev) => ({
      ...prev,
      popup_times: prev.popup_times.map((popup, i) =>
        i === popupIndex ? { ...popup, question: text } : popup,
      ),
    }));
  }, []);

  const handleToggleCorrect = (popupIndex: number, value: string) => {
    setVideoConfig((prev) => ({
      ...prev,
      popup_times: prev.popup_times.map((popup, i) => (i === popupIndex ? { ...popup, correct: value } : popup)),
    }));
  };

  const handleTimeChange = (popupIndex: number, newValue: number[]) => {
    setVideoConfig((prev) => ({
      ...prev,
      popup_times: prev.popup_times.map((popup, i) => (i === popupIndex ? { ...popup, time: newValue[0] } : popup)),
    }));
  };

  const saveQuestions = async () => {
    if (!videoConfig.url) {
      toast.error('Vui lòng tải lên video!');
      return;
    }
    const totalOptions = videoConfig.popup_times.reduce((acc, p) => acc + p.options.length, 0);
    if (answers.length !== totalOptions) {
      toast.error(`Số lượng đáp án (${answers.length}) không khớp với tổng số phương án (${totalOptions})!`);
      return;
    }

    try {
      const apiData = {
        subject_id: form.getValues('subject_id'),
        type_id: form.getValues('type_id'),
        difficulty_level_id: form.getValues('difficulty_level_id'),
        content: form.getValues('content'),
        is_public: form.getValues('is_public'),
        explanation: form.getValues('explanation'),
        answer_config: {
          kind: 'video_popup',
          video_id: videoConfig.video_id,
          url: videoConfig.url,
          popup_times: videoConfig.popup_times,
        },
        answers: answers.map((answer) => ({
          content: {
            text: answer.content.text,
            value: answer.content.value,
          },
          order_index: answer.order_index,
        })),
      };
      console.log('API Data:', apiData);
      const response = await apiCreateQuestion(apiData);
      if (response.status === 201) {
        toast.success('Tạo câu hỏi video popup thành công');
        onSaveSuccess();
      } else {
        toast.error(`Tạo câu hỏi thất bại: ${response.statusText}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || 'Đã có lỗi xảy ra';
      toast.error(errorMessage);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6" ref={scrollRef}>
      <div className="space-y-2">
        <Label>Upload video</Label>
        <VideoUpload
          onUploadSuccess={(url) => {
            setVideoConfig((prev) => ({ ...prev, url }));
          }}
          onUploadError={(error) => toast.error(error)}
          maxSizeMB={100}
        />
      </div>

      {videoConfig.url && (
        <div className="space-y-2 hidden">
          <Label>Video Preview</Label>
          <video
            src={videoConfig.url}
            onLoadedMetadata={handleVideoLoad}
            style={{ width: '100%', maxWidth: '400px' }}
            controls
          />
          {isVideoLoaded && <p className="text-sm text-gray-500">Thời lượng video: {formatTime(videoDuration)}</p>}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Câu hỏi Popup</Label>
          <Button type="button" variant="outline" onClick={handleAddPopup} disabled={!videoConfig.url || !isVideoLoaded}>
            <Plus className="h-4 w-4 mr-1" /> Thêm câu hỏi
          </Button>
        </div>

        {videoConfig.popup_times.map((popup, index) => (
          <div key={popup.id} className="border rounded-lg p-4 space-y-4 relative">
            <button
              type="button"
              onClick={() => handleRemovePopup(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <div className="space-y-2">
              <Label htmlFor={`popup-time-${index}`}>Thời gian ({formatTime(popup.time)})</Label>
              <Slider
                value={[popup.time]}
                min={0}
                max={videoDuration}
                step={0.1}
                onValueChange={(value) => handleTimeChange(index, value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Câu hỏi</Label>
              <Textarea
                rows={2}
                value={popup.question}
                onChange={(e) => handleQuestionChange(index, e)}
                placeholder="Nhập câu hỏi..."
              />
            </div>

            <div className="space-y-2">
              <Label>Phương án</Label>
              <RadioGroup
                value={popup.correct}
                onValueChange={(value) => handleToggleCorrect(index, value)}
                className="space-y-2"
              >
                {DEFAULT_OPTIONS.map((option, optionIndex) => {
                  const globalIndex = index * DEFAULT_OPTIONS.length + optionIndex;
                  const answer = answers[globalIndex];
                  const inputValue = answer?.content?.text || '';

                  return (
                    <div key={`popup-${index}-option-${optionIndex}`} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${index}-${optionIndex}`} />
                      <div className="flex-1">
                        <Input
                          value={inputValue}
                          onChange={(e) => handleInputChange(index, optionIndex, e)}
                          placeholder={`Phương án ${option}`}
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

      <div className="flex justify-end">
        <Button type="button" onClick={saveQuestions} disabled={!videoConfig.popup_times.length}
          className="mt-4 bg-black hover:bg-black/80">
          Lưu câu hỏi
        </Button>
      </div>
    </div>
  );
};

export default VideoPopupForm;  