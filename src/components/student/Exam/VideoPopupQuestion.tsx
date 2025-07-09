import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Pause, Volume2 } from 'lucide-react';

// Định nghĩa interface cho câu hỏi video popup
export interface VideoPopupQuestionType {
  url: string;
  video_id: string;
  popup_times: Array<{
    id: string;
    time: number;
    question: string;
    options: Array<{
      text: string;
      value: string;
    }>;
    correct?: string;
  }>;
}

// Định nghĩa interface cho câu trả lời
export interface VideoPopupAnswerType {
  content: {
    text: string;
    value: string; // A, B, C, D
  };
  order_index: number;
}

// Props cho component
interface VideoPopupQuestionProps {
  question: {
    id: string;
    content: string;
    answer_config: VideoPopupQuestionType;
    answers: VideoPopupAnswerType[];
  };
  answers: Record<number, VideoPopupAnswerType>;
  onAnswerChange: (timeIndex: number, answer: VideoPopupAnswerType) => void;
}

// Component cho câu hỏi Video Popup
function VideoPopupQuestion({ question, answers, onAnswerChange }: VideoPopupQuestionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQuestion, setShowQuestion] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const answeredQuestions = useRef<Set<number>>(new Set()); // Theo dõi các câu hỏi đã trả lời

  console.log('question', question);
  console.log('answers', answers);

  // Xử lý sự kiện timeupdate
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);

    question.answer_config.popup_times.forEach((popup, index) => {
      if (Math.abs(video.currentTime - popup.time) < 0.5 && !answeredQuestions.current.has(index) && showQuestion !== index) {
        video.pause();
        setIsPlaying(false);
        setShowQuestion(index);
      }
    });
  }, [question.answer_config.popup_times, showQuestion]);

  // Xử lý các sự kiện video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [handleTimeUpdate]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  // Xử lý tua video
  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  }, []);

  // Xử lý click vào thanh tiến trình
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      handleSeek(newTime);
    },
    [duration, handleSeek],
  );

  // Xử lý câu trả lời
  const handleQuestionAnswer = useCallback(
    (answerValue: string) => {
      if (showQuestion === null) return;

      const popup = question.answer_config.popup_times[showQuestion];
      const selectedOption = popup.options.find((opt) => opt.value === answerValue);
      const selectedAnswer = question.answers.find((answer) => answer.content.value === answerValue);

      if (!selectedOption || !selectedAnswer) return;

      const answer: VideoPopupAnswerType = {
        content: {
          text: selectedOption.text,
          value: selectedOption.value,
        },
        order_index: selectedAnswer.order_index,
      };

      onAnswerChange(showQuestion, answer);
      answeredQuestions.current.add(showQuestion);
      setShowQuestion(null);

      const video = videoRef.current;
      if (video) {
        video.play().catch(() => setIsPlaying(false));
      }
    },
    [showQuestion, question.answer_config.popup_times, question.answers, onAnswerChange],
  );

  // Định dạng thời gian
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Tính phần trăm tiến trình
  const getProgressPercentage = useCallback(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        <video ref={videoRef} className="w-full aspect-video" src={question.answer_config.url} onVolumeChange={(e) => setVolume((e.target as HTMLVideoElement).volume)}>
          Your browser does not support the video tag.
        </video>

        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Đang tải video...</p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
          <div className="relative mb-4">
            <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden cursor-pointer hover:h-4 transition-all duration-200" onClick={handleProgressClick}>
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-100 relative" style={{ width: `${getProgressPercentage()}%` }}>
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500"></div>
              </div>
            </div>

            {question.answer_config.popup_times?.map((popup, index) => {
              const position = duration > 0 ? (popup.time / duration) * 100 : 0;
              const isAnswered = !!answers[index];
              const isNearQuestion = currentTime >= popup.time - 2 && currentTime <= popup.time + 2;

              return (
                <div key={popup.id} className="absolute top-0 transform -translate-x-1/2 -translate-y-1 cursor-pointer group" style={{ left: `${position}%` }} onClick={() => handleSeek(popup.time)}>
                  <div
                    className={`
                      w-5 h-5 rounded-full border-3 border-white shadow-lg transition-all duration-300 group-hover:scale-125
                      ${isAnswered ? 'bg-green-500' : isNearQuestion ? 'bg-red-500 ring-2 ring-red-300' : 'bg-yellow-500'}
                    `}
                  >
                    <div className="absolute inset-1 bg-white rounded-full opacity-60"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-800 shadow-md">{index + 1}</div>
                  </div>
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                    <div className="font-medium">Câu hỏi {index + 1}</div>
                    <div className="text-xs text-gray-400">{formatTime(popup.time)}</div>
                    <div className="text-xs">{isAnswered ? '✅ Đã trả lời' : '⏗ Chưa trả lời'}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-medium bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {formatTime(popup.time)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20 p-2" disabled={isLoading}>
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = Number.parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (videoRef.current) {
                      videoRef.current.volume = newVolume;
                    }
                  }}
                  className="w-20 accent-blue-500"
                />
                <span className="text-xs w-8">{Math.round(volume * 100)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <div className="text-sm bg-black/50 px-3 py-1 rounded-full">
                <span className="text-green-400">{Object.keys(answers).length}</span>
                <span className="text-gray-400">/{question.answer_config.popup_times?.length}</span>
                <span className="text-xs ml-1">câu hỏi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={showQuestion !== null}
        onOpenChange={(open) => {
          if (!open && showQuestion !== null) {
            setShowQuestion(null);
            const video = videoRef.current;
            if (video) {
              video.play().catch(() => setIsPlaying(false));
            }
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{showQuestion !== null ? showQuestion + 1 : ''}</div>
              Câu hỏi video - {showQuestion !== null ? formatTime(question.answer_config.popup_times[showQuestion]?.time || 0) : ''}
            </DialogTitle>
            <DialogDescription>Trả lời câu hỏi để tiếp tục xem video</DialogDescription>
          </DialogHeader>
          {showQuestion !== null && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900">{question.answer_config.popup_times[showQuestion].question}</p>
              </div>
              <RadioGroup onValueChange={handleQuestionAnswer}>
                {question.answer_config.popup_times[showQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={option.value} id={`video-q-${index}`} />
                    <Label htmlFor={`video-q-${index}`} className="cursor-pointer flex-1 font-medium text-gray-900">
                      {String.fromCharCode(65 + index)}. {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-lg">Câu hỏi trong video</h4>
          <Badge variant={Object.keys(answers).length === question.answer_config.popup_times?.length ? 'default' : 'secondary'}>
            {Object.keys(answers).length}/{question.answer_config.popup_times?.length} hoàn thành
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.answer_config.popup_times?.map((popup, index) => (
            <div
              key={popup.id}
              className={`p-4 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md ${
                answers[index] ? 'bg-green-50 border-green-300 hover:bg-green-100' : 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
              }`}
              onClick={() => handleSeek(popup.time)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${answers[index] ? 'bg-green-500' : 'bg-yellow-500'}`}>{index + 1}</div>
                  <span className="font-medium text-sm">{formatTime(popup.time)}</span>
                </div>
                <Badge variant={answers[index] ? 'default' : 'secondary'} className="text-xs">
                  {answers[index] ? '✓ Đã trả lời' : '⏳ Chưa trả lời'}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mb-2">{popup.question}</p>
              {answers[index] && (
                <div className="text-sm">
                  <span className="text-green-700 font-medium">Đáp án: </span>
                  <span className="text-green-600">{answers[index].content?.text || ''}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoPopupQuestion;
