import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Xarrow from 'react-xarrows';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, AlertTriangle, GripVertical, Play, Pause, Volume2 } from 'lucide-react';
import type { IExam } from '@/services/student/interfaces/exam.interface';
import { apiGetDetailExam } from '@/services/student/exam';

// Định nghĩa cấu trúc dữ liệu từ API
interface Answer {
  id: string;
  content: {
    text: string;
    value?: string;
    left?: string;
    right?: string;
  };
  order_index: number;
}

interface Question {
  id: string;
  content: string;
  answers: Answer[];
  question_type: {
    code: 'single_choice' | 'multiple_select' | 'drag_drop' | 'matching' | 'ordering' | 'video_popup';
  };
}

interface ExamData {
  id: string;
  name: string;
  subject: {
    name: string;
  };
  duration_minutes: number;
  exam_questions: Array<{
    id: string;
    question: Question;
  }>;
  settings: {
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    allowReview: boolean;
    maxTabSwitch: number;
  };
}

// Sortable Item Component for Ordering
function SortableItem({ id, content, index }: { id: string; content: string; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center gap-3 p-3 border rounded bg-white hover:bg-gray-50 cursor-grab active:cursor-grabbing">
      <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">{index + 1}</span>
      <GripVertical className="h-4 w-4 text-gray-400" />
      <span className="flex-1">{content}</span>
    </div>
  );
}

// Wire Connection Component for Matching
interface WireConnectionProps {
  leftItems: Array<{ id: string; content: string }>;
  rightItems: Array<{ id: string; content: string }>;
  connections: Record<string, string>;
  onConnect: (leftId: string, rightId: string) => void;
}

function WireConnection({ leftItems, rightItems, connections, onConnect }: WireConnectionProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rightRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleLeftClick = (leftId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedLeft(selectedLeft === leftId ? null : leftId);
  };

  const handleRightClick = (rightId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedLeft) {
      const newConnections = { ...connections };
      delete newConnections[selectedLeft];
      Object.keys(newConnections).forEach((key) => {
        if (newConnections[key] === rightId) {
          delete newConnections[key];
        }
      });
      newConnections[selectedLeft] = rightId;
      onConnect(selectedLeft, rightId);
      setSelectedLeft(null);
    }
  };

  const clearAllConnections = (e: React.MouseEvent) => {
    e.preventDefault();
    onConnect('', '');
    setSelectedLeft(null);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.userSelect = 'none';
      container.style.webkitUserSelect = 'none';
    }
  }, []);

  useEffect(() => {
    leftRefs.current = new Map();
    rightRefs.current = new Map();
  }, [leftItems, rightItems]);

  return (
    <div ref={containerRef} className="relative flex justify-between py-4 px-8">
      <div className="w-1/3 space-y-3">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Cột A</h5>
        {leftItems.map((item) => {
          const isConnected = connections[item.id];
          const isSelected = selectedLeft === item.id;

          return (
            <div
              key={item.id}
              id={`left-${item.id}`}
              ref={(el) => {
                if (el) leftRefs.current.set(item.id, el);
              }}
              onClick={(e) => handleLeftClick(item.id, e)}
              className={`
                p-3 border rounded-lg cursor-pointer transition-all duration-200
                flex items-center justify-between
                ${isSelected ? 'bg-blue-100 border-blue-500 shadow-md' : isConnected ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300 hover:bg-blue-50'}
              `}
            >
              <span className="flex-1 text-sm font-medium">{item.content}</span>
              <div
                className={`
                  w-4 h-4 rounded-full border-2 border-white shadow
                  ${isSelected ? 'bg-blue-600 animate-pulse' : isConnected ? 'bg-green-500' : 'bg-gray-400'}
                `}
              />
            </div>
          );
        })}
      </div>

      <div className="w-1/3 space-y-3">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Cột B</h5>
        {rightItems.map((item) => {
          const isConnected = Object.values(connections).includes(item.id);
          const canConnect = selectedLeft !== null;

          return (
            <div
              key={item.id}
              id={`right-${item.id}`}
              ref={(el) => {
                if (el) rightRefs.current.set(item.id, el);
              }}
              onClick={(e) => handleRightClick(item.id, e)}
              className={`
                p-3 border rounded-lg cursor-pointer transition-all duration-200
                flex items-center justify-between
                ${isConnected ? 'bg-green-100 border-green-400' : canConnect ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100' : 'bg-white border-gray-300 hover:bg-gray-50'}
              `}
            >
              <div
                className={`
                  w-4 h-4 rounded-full border-2 border-white shadow
                  ${isConnected ? 'bg-green-500' : canConnect ? 'bg-yellow-500' : 'bg-gray-400'}
                `}
              />
              <span className="flex-1 text-sm font-medium">{item.content}</span>
            </div>
          );
        })}
      </div>

      {Object.entries(connections).map(([leftId, rightId]) => (
        <Xarrow
          key={`${leftId}-${rightId}`}
          start={`left-${leftId}`}
          end={`right-${rightId}`}
          color="#10b981"
          strokeWidth={3}
          headSize={6}
          curveness={0.5}
          path="smooth"
          showHead
          startAnchor="right"
          endAnchor="left"
          zIndex={1}
        />
      ))}

      <div className="absolute -top-2 right-10">
        {Object.keys(connections).length > 0 && (
          <button onClick={clearAllConnections} className="px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors text-sm">
            Xóa tất cả
          </button>
        )}
      </div>
    </div>
  );
}

// Video Player Component
function VideoPlayerWithQuestions({
  videoUrl,
  popupTimes,
  onAnswerSubmit,
  answers,
}: {
  videoUrl: string;
  popupTimes: Array<{
    time: number;
    question: string;
    options: string[];
  }>;
  onAnswerSubmit: (timeIndex: number, answer: string) => void;
  answers: Record<number, string>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showQuestion, setShowQuestion] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      popupTimes.forEach((popup, index) => {
        if (Math.abs(video.currentTime - popup.time) < 0.5 && !answers[index] && showQuestion !== index) {
          video.pause();
          setIsPlaying(false);
          setShowQuestion(index);
        }
      });
    };

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
  }, [popupTimes, answers, showQuestion]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    handleSeek(newTime);
  };

  const handleQuestionAnswer = (answer: string) => {
    if (showQuestion !== null) {
      onAnswerSubmit(showQuestion, answer);
      setShowQuestion(null);
      const video = videoRef.current;
      if (video) {
        video.play();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src={videoUrl}
          poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
          onVolumeChange={(e) => setVolume((e.target as HTMLVideoElement).volume)}
        >
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

            {popupTimes.map((popup, index) => {
              const position = duration > 0 ? (popup.time / duration) * 100 : 0;
              const isAnswered = answers[index];
              const isNearQuestion = currentTime >= popup.time - 2 && currentTime <= popup.time + 2;

              return (
                <div key={index} className="absolute top-0 transform -translate-x-1/2 -translate-y-1 cursor-pointer group" style={{ left: `${position}%` }} onClick={() => handleSeek(popup.time)}>
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
                    <div className="text-xs text-gray-300">{formatTime(popup.time)}</div>
                    <div className="text-xs">{isAnswered ? '✅ Đã trả lời' : '⏳ Chưa trả lời'}</div>
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
                  step="0.1"
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
                <span className="text-gray-400">/{popupTimes.length}</span>
                <span className="text-xs ml-1">câu hỏi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showQuestion !== null} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{showQuestion !== null ? showQuestion + 1 : ''}</div>
              Câu hỏi video - {showQuestion !== null ? formatTime(popupTimes[showQuestion]?.time || 0) : ''}
            </DialogTitle>
            <DialogDescription>Trả lời câu hỏi để tiếp tục xem video</DialogDescription>
          </DialogHeader>
          {showQuestion !== null && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900">{popupTimes[showQuestion].question}</p>
              </div>
              <RadioGroup onValueChange={handleQuestionAnswer}>
                {popupTimes[showQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value={option} id={`video-q-${index}`} />
                    <Label htmlFor={`video-q-${index}`} className="cursor-pointer flex-1 font-medium">
                      {String.fromCharCode(65 + index)}. {option}
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
          <Badge variant={Object.keys(answers).length === popupTimes.length ? 'default' : 'secondary'}>
            {Object.keys(answers).length}/{popupTimes.length} hoàn thành
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {popupTimes.map((popup, index) => (
            <div
              key={index}
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
                  <span className="text-green-600">{answers[index]}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ExamTaking() {
  const [exam, setExam] = useState<IExam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [orderingItems, setOrderingItems] = useState<Array<{ id: string; content: string }>>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleGetExam = async () => {
    const exam = await apiGetDetailExam('34a353d4-580c-40ad-bd8c-9802e2d31d83');
    if (exam) {
      setExam(exam.data);
      setTimeLeft(exam?.data?.duration_minutes * 60);
    }
    console.log(exam);
  };

  // Fetch exam data
  useEffect(() => {
    // Giả lập API call
    const fetchExam = async () => {
      // const response = {
      //   id: '34a353d4-580c-40ad-bd8c-9802e2d31d83',
      //   name: 'Test tạo đề',
      //   subject: { name: 'Triết học Mác - Lênin' },
      //   duration_minutes: 60,
      //   exam_questions: [
      //     {
      //       id: '5eeee95a-dea7-4678-a87d-06d89df8162d',
      //       question: {
      //         id: 'fb97ccff-6095-4b62-811a-15df616acb79',
      //         content: 'Xem video Big Buck Bunny và trả lời các câu hỏi xuất hiện trên timeline:',
      //         answers: [
      //           { id: '2c2d4e66-7670-482b-958e-d58ac9f6b210', content: { text: 'Thỏ', value: 'Thỏ' }, order_index: 1 },
      //           { id: 'f1d93880-173f-4c86-a54f-ad278a6a7ad9', content: { text: 'Chó', value: 'Chó' }, order_index: 2 },
      //           { id: 'b2456f19-177e-4056-b705-52ec7ee79f7a', content: { text: 'Mèo', value: 'Mèo' }, order_index: 3 },
      //           { id: 'ce575f61-dafa-4430-9d07-3b2eecee7357', content: { text: 'Chuột', value: 'Chuột' }, order_index: 4 },
      //           { id: '53c372b8-065b-4a26-bb1c-816cf8a5f1f3', content: { text: 'Trắng', value: 'Trắng' }, order_index: 5 },
      //           { id: 'c2a829a8-506c-4808-8bac-527509710def', content: { text: 'Nâu', value: 'Nâu' }, order_index: 6 },
      //           { id: '6d6336bf-46c9-4f67-a622-53cac0cb14dc', content: { text: 'Xám', value: 'Xám' }, order_index: 7 },
      //           { id: '2bec8ef1-f98b-4bc6-8d1d-21db8f53d73a', content: { text: 'Đen', value: 'Đen' }, order_index: 8 },
      //         ],
      //         question_type: { code: 'video_popup' },
      //       },
      //     },
      //     {
      //       id: '44c42bb6-6c87-46b7-be2b-35d1c9f40507',
      //       question: {
      //         id: '342f54be-b18c-416f-a046-521b43326953',
      //         content: 'Sắp xếp các bước tạo một trang web theo thứ tự đúng:',
      //         answers: [
      //           { id: '3bd0f676-5e52-4c7b-8091-855924f1fd47', content: { text: 'Viết HTML structure' }, order_index: 1 },
      //           { id: '24f38b51-373c-4ee4-8f17-b03f68ab9907', content: { text: 'Thêm CSS styling' }, order_index: 2 },
      //           { id: 'bdbe63d2-296a-455f-83fe-3e748cb81197', content: { text: 'Thêm JavaScript functionality' }, order_index: 3 },
      //           { id: '2a191174-3ca9-4b08-9710-5a248255b81c', content: { text: 'Test và debug' }, order_index: 4 },
      //         ],
      //         question_type: { code: 'ordering' },
      //       },
      //     },
      //     {
      //       id: '44b74727-d7c2-461e-adbc-ab1c8ce0291a',
      //       question: {
      //         id: '4fcc361d-9157-4b01-8a7b-caeeab0c32fc',
      //         content: 'Nối các thuật ngữ HTML với định nghĩa tương ứng:',
      //         answers: [
      //           { id: '6f1fad32-57d3-4163-af23-b3f047d8e221', content: { left: 'DOCTYPE', right: 'Khai báo loại tài liệu' }, order_index: 1 },
      //           { id: '62c7c809-e1d7-41e5-bbc0-adde8b0f25fd', content: { left: 'Semantic HTML', right: 'HTML có ý nghĩa' }, order_index: 2 },
      //         ],
      //         question_type: { code: 'matching' },
      //       },
      //     },
      //     {
      //       id: '293b56ea-40f2-4a14-b16b-a6259b89d445',
      //       question: {
      //         id: 'e9047da2-dceb-4c3d-a8dc-5ca51013c957',
      //         content: 'Kéo các thuộc tính CSS vào đúng nhóm của chúng:',
      //         answers: [
      //           { id: '6b4dee32-ca09-40df-bf2d-0d39ddcc6258', content: { text: 'color' }, order_index: 1 },
      //           { id: '70fda4f0-f6d4-4c0e-acee-ae086d154e3b', content: { text: 'margin' }, order_index: 2 },
      //           { id: '7e99bca8-015f-4aa0-a5ef-d152d82dbc49', content: { text: 'font-size' }, order_index: 3 },
      //           { id: 'dcce8753-08e1-4028-bf0d-65b37498909b', content: { text: 'padding' }, order_index: 4 },
      //           { id: '33947401-6482-458f-9dcf-c3469c6e3ad7', content: { text: 'background' }, order_index: 5 },
      //         ],
      //         question_type: { code: 'drag_drop' },
      //       },
      //     },
      //     {
      //       id: '14e8916f-64cc-4c15-b6b7-fd781281e265',
      //       question: {
      //         id: '540d11d1-d3b4-454f-8abf-c9f88bc110d3',
      //         content: 'Những thẻ HTML nào sau đây là thẻ block-level?',
      //         answers: [
      //           { id: 'b57eb1dc-05f2-4190-9a9c-b35f65e8d84e', content: { text: '<div>', value: 'div' }, order_index: 1 },
      //           { id: '2e560982-b8bc-48a9-acb9-cd9ec32984e1', content: { text: '<span>', value: 'span' }, order_index: 2 },
      //           { id: '9ab56c08-1b51-4749-a1d6-d72699344b09', content: { text: '<p>', value: 'p' }, order_index: 3 },
      //           { id: '12732856-acfb-4037-8a48-a92f00c1739f', content: { text: '<h1>', value: 'h1' }, order_index: 4 },
      //           { id: 'b630fab2-0e72-40c1-a468-ac799f6757a1', content: { text: '<a>', value: 'a' }, order_index: 5 },
      //         ],
      //         question_type: { code: 'multiple_select' },
      //       },
      //     },
      //     {
      //       id: '06845386-e2aa-40ea-9bfb-5c34ed10a25a',
      //       question: {
      //         id: 'd1ddfdc1-0a57-47b7-b6f9-4836fcce7480',
      //         content: 'HTML là viết tắt của gì?',
      //         answers: [
      //           { id: '61fdaf0d-04dc-46d1-81ef-327f7c2d0a93', content: { text: 'HyperText Markup Language', value: 'A' }, order_index: 1 },
      //           { id: '85481d4c-7422-4324-a99e-56f8681fde98', content: { text: 'High Tech Modern Language', value: 'B' }, order_index: 2 },
      //           { id: '5e08d96b-b2b6-43ca-9c0e-f2456bdb1bca', content: { text: 'Home Tool Markup Language', value: 'C' }, order_index: 3 },
      //           { id: '1fe3f321-26aa-4335-b710-b192419084fc', content: { text: 'Hyperlink and Text Markup Language', value: 'D' }, order_index: 4 },
      //         ],
      //         question_type: { code: 'single_choice' },
      //       },
      //     },
      //   ],
      //   settings: {
      //     shuffleQuestions: true,
      //     shuffleAnswers: true,
      //     allowReview: true,
      //     maxTabSwitch: 3,
      //   },
      // } as ExamData;
      // setExam(response);
      // setTimeLeft(response.duration_minutes * 60);
      // setExam(response);
    };
    handleGetExam();
    // fetchExam();
  }, []);
  // Initialize ordering items
  useEffect(() => {
    if (!exam) return;
    // const currentQ = exam.exam_questions[currentQuestion]?.question;
    // if (currentQ?.question_type.code === 'ordering') {
    //   const shuffled = exam.settings.shuffleAnswers ? [...currentQ.answers].sort(() => Math.random() - 0.5) : [...currentQ.answers];
    //   setOrderingItems(shuffled.map((a) => ({ id: a.id, content: a.content.text })));
    // }
  }, [currentQuestion, exam]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted && exam) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= exam.max_tab_switch) {
            alert('Bạn đã chuyển tab quá nhiều lần. Bài thi sẽ được nộp tự động.');
            handleSubmit();
          }
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted, exam]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    console.log('Submitted answers:', answers);
    console.log('Tab switches:', tabSwitchCount);
  };

  const getProgress = () => {
    if (!exam) return 0;
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / exam.exam_questions.length) * 100;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (draggedItem && exam) {
      const currentQ = exam.exam_questions[currentQuestion].question;
      const currentAnswers = answers[currentQ.id] || {};
      handleAnswerChange(currentQ.id, {
        ...currentAnswers,
        [draggedItem]: zoneId,
      });
      setDraggedItem(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setOrderingItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        const orderMap = newItems.reduce((acc, item, index) => {
          acc[item.id] = index + 1;
          return acc;
        }, {} as Record<string, number>);
        if (exam) {
          handleAnswerChange(exam.exam_questions[currentQuestion].question.id, orderMap);
        }
        return newItems;
      });
    }
  };

  const handleWireConnect = (leftId: string, rightId: string) => {
    if (!exam) return;
    const currentQ = exam.exam_questions[currentQuestion].question;
    if (leftId === '' && rightId === '') {
      handleAnswerChange(currentQ.id, {});
      return;
    }
    const currentConnections = answers[currentQ.id] || {};
    const newConnections = { ...currentConnections };
    if (newConnections[leftId]) {
      delete newConnections[leftId];
    }
    Object.keys(newConnections).forEach((key) => {
      if (newConnections[key] === rightId) {
        delete newConnections[key];
      }
    });
    if (leftId && rightId) {
      newConnections[leftId] = rightId;
    }
    handleAnswerChange(currentQ.id, newConnections);
  };

  const handleVideoQuestionAnswer = (timeIndex: number, answer: string) => {
    if (!exam) return;
    const currentQ = exam.exam_questions[currentQuestion].question;
    const currentAnswers = answers[currentQ.id] || {};
    handleAnswerChange(currentQ.id, {
      ...currentAnswers,
      [timeIndex]: answer,
    });
  };

  if (!exam) {
    return <div>Loading...</div>;
  }

  const currentQ = exam.exam_questions[currentQuestion]?.question;
  if (!currentQ) {
    return <div>Không tìm thấy câu hỏi</div>;
  }

  // Mock drag_drop zones (API không cung cấp, giả định)
  const mockDragDropZones = [
    { id: 'zone1', name: 'Typography', accepts: ['color', 'font-size'] },
    { id: 'zone2', name: 'Box Model', accepts: ['margin', 'padding'] },
    { id: 'zone3', name: 'Visual', accepts: ['background'] },
  ];

  // Mock video_popup config (API không cung cấp, lấy từ JSON mẫu)
  const mockVideoPopupConfig = {
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    popup_times: [
      { time: 15, question: 'Nhân vật chính trong video này là gì?', options: ['Thỏ', 'Chó', 'Mèo', 'Chuột'] },
      { time: 45, question: 'Màu sắc chủ đạo của nhân vật chính là gì?', options: ['Trắng', 'Nâu', 'Xám', 'Đen'] },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{exam.name}</CardTitle>
              <CardDescription>{exam.subject.name}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                <span className={`font-mono text-lg ${timeLeft < 300 ? 'text-red-500' : 'text-gray-700'}`}>{formatTime(timeLeft)}</span>
              </div>
              {timeLeft < 300 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Sắp hết giờ
                </Badge>
              )}
              {tabSwitchCount > 0 && (
                <Badge variant="outline" className="text-orange-600">
                  Chuyển tab: {tabSwitchCount}/{exam.max_tab_switch}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tiến độ hoàn thành</span>
              <span>
                {Object.keys(answers).length}/{exam.exam_questions.length} câu
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Danh sách câu hỏi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
              {exam.exam_questions.map((q, index) => (
                <Button
                  key={q.id}
                  variant={currentQuestion === index ? 'default' : answers[q.question.id] ? 'secondary' : 'outline'}
                  size="sm"
                  className={`relative ${flaggedQuestions.has(q.question.id) ? 'ring-2 ring-yellow-400' : ''}`}
                  onClick={() => setCurrentQuestion(index)}
                >
                  {index + 1}
                  {flaggedQuestions.has(q.question.id) && <Flag className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />}
                </Button>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Câu hiện tại</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded"></div>
                <span>Đã trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-gray-300 rounded"></div>
                <span>Chưa trả lời</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-3 w-3 text-yellow-500" />
                <span>Đã đánh dấu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={'lg:col-span-4'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Câu {currentQuestion + 1}</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleFlag(currentQ.id)} className={flaggedQuestions.has(currentQ.id) ? 'bg-yellow-50 border-yellow-300' : ''}>
                <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQ.id) ? 'text-yellow-500' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{currentQ.content}</div>

            {/* Single Choice */}
            {currentQ.question_type.code === 'single_choice' && (
              <RadioGroup value={answers[currentQ.id] || ''} onValueChange={(value) => handleAnswerChange(currentQ.id, value)}>
                {currentQ.answers.map((answer: any, index) => (
                  <div key={answer.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={answer.content || answer.content} id={`${currentQ.id}-${answer.id}`} />
                    <Label htmlFor={`${currentQ.id}-${answer.id}`} className="cursor-pointer">
                      {answer.content}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Multiple Select */}
            {currentQ.question_type.code === 'multiple_select' && (
              <div className="space-y-3">
                {currentQ.answers.map((answer: any, index) => (
                  <div key={answer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${currentQ.id}-${answer.id}`}
                      checked={(answers[currentQ.id] || []).includes(answer.content || answer.content)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = answers[currentQ.id] || [];
                        if (checked) {
                          handleAnswerChange(currentQ.id, [...currentAnswers, answer.content.value || answer.content.text]);
                        } else {
                          handleAnswerChange(
                            currentQ.id,
                            currentAnswers.filter((a: string) => a !== (answer.content.value || answer.content.text)),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`${currentQ.id}-${answer.id}`} className="cursor-pointer">
                      {answer.content}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Drag and Drop */}
            {currentQ.question_type.code === 'drag_drop' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Kéo các item vào zone phù hợp:</h4>
                  <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    {currentQ.answers
                      .filter((answer) => !answers[currentQ.id]?.[answer.id])
                      .map((answer: any) => (
                        <div
                          key={answer.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, answer.id)}
                          className="px-3 py-2 bg-blue-100 border border-blue-300 rounded cursor-move hover:bg-blue-200 transition-colors"
                        >
                          <GripVertical className="h-4 w-4 inline mr-2" />
                          <p>{answer?.content || ''}</p>
                        </div>
                      ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockDragDropZones.map((zone) => (
                      <div key={zone.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, zone.id)} className="min-h-24 p-4 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50">
                        <h5 className="font-medium mb-2">{zone.name}</h5>
                        <div className="space-y-2">
                          {Object.entries(answers[currentQ.id] || {})
                            .filter(([_, zoneId]) => zoneId === zone.id)
                            .map(([itemId, _]) => {
                              const item = currentQ.answers.find((a) => a.id === itemId);
                              return item ? (
                                <div key={itemId} className="px-2 py-1 bg-green-100 border border-green-300 rounded text-sm">
                                  {item.content.text}
                                </div>
                              ) : null;
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Matching */}
            {currentQ.question_type.code === 'matching' && (
              <div className="space-y-4">
                <WireConnection
                  leftItems={currentQ.answers.map((answer) => ({ id: answer.id, content: answer.content.left || '' }))}
                  rightItems={currentQ.answers.map((answer) => ({ id: answer.id, content: answer.content.right || '' }))}
                  connections={answers[currentQ.id] || {}}
                  onConnect={handleWireConnect}
                />
              </div>
            )}

            {/* Ordering */}
            {currentQ.question_type.code === 'ordering' && orderingItems.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Kéo thả để sắp xếp theo thứ tự đúng:</h4>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={orderingItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {orderingItems.map((item, index) => (
                        <SortableItem key={item.id} id={item.id} content={item.content} index={index} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Video Popup */}
            {currentQ.question_type.code === 'video_popup' && (
              <div className="space-y-4">
                <VideoPlayerWithQuestions
                  videoUrl={mockVideoPopupConfig.url}
                  popupTimes={mockVideoPopupConfig.popup_times}
                  onAnswerSubmit={handleVideoQuestionAnswer}
                  answers={answers[currentQ.id] || {}}
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Câu trước
              </Button>
              <div className="flex gap-2">
                {currentQuestion === exam.exam_questions.length - 1 ? (
                  <AlertDialog>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Nộp bài
                    </Button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời.
                          <br />
                          <br />
                          Số câu đã trả lời: {Object.keys(answers).length}/{exam.exam_questions.length}
                          <br />
                          Thời gian còn lại: {formatTime(timeLeft)}
                          <br />
                          Số lần chuyển tab: {tabSwitchCount}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Nộp bài</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button onClick={() => setCurrentQuestion(Math.min(exam.exam_questions.length - 1, currentQuestion + 1))}>
                    Câu tiếp
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
