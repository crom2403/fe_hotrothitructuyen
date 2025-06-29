import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import Xarrow from 'react-xarrows';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, ChevronLeft, ChevronRight, Flag, Send, AlertTriangle, Move, GripVertical, Play, Pause, Volume2 } from 'lucide-react';

interface QuestionConfig {
  drag_drop_zones?: Array<{
    id: string;
    name: string;
    accepts: string[];
  }>;
  drag_items?: Array<{
    id: string;
    content: string;
    zone: string;
  }>;
  matching_pairs?: Array<{
    id: string;
    left: string;
    right: string;
    correct_match: string;
  }>;
  ordering_items?: Array<{
    id: string;
    content: string;
    correct_order: number;
  }>;
  fill_blanks?: Array<{
    id: string;
    position: number;
    correct_answers: string[];
    case_sensitive: boolean;
  }>;
  video_config?: {
    url: string;
    popup_times: Array<{
      time: number;
      question: string;
      options: string[];
      correct: number;
    }>;
  };
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'multiple_select' | 'essay' | 'fill_blank' | 'drag_drop' | 'matching' | 'ordering' | 'video_popup';
  question: string;
  options?: string[];
  correctAnswer?: string | string[] | number;
  points: number;
  config?: QuestionConfig;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ExamData {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  questions: Question[];
  settings: {
    shuffleQuestions: boolean;
    shuffleAnswers: boolean;
    questionsPerPage: number;
    showQuestionNav: boolean;
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

interface WireConnectionProps {
  leftItems: Array<{ id: string; content: string }>;
  rightItems: Array<{ id: string; content: string }>;
  connections: Record<string, string>;
  onConnect: (leftId: string, rightId: string) => void;
}

export function WireConnection({ leftItems, rightItems, connections, onConnect }: WireConnectionProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rightRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Xử lý khi nhấp vào mục ở cột A
  const handleLeftClick = (leftId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedLeft(selectedLeft === leftId ? null : leftId);
  };

  // Xử lý khi nhấp vào mục ở cột B
  const handleRightClick = (rightId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedLeft) {
      // Xóa kết nối hiện tại của leftId nếu có
      const newConnections = { ...connections };
      delete newConnections[selectedLeft];

      // Xóa kết nối hiện tại của rightId nếu có
      Object.keys(newConnections).forEach((key) => {
        if (newConnections[key] === rightId) {
          delete newConnections[key];
        }
      });

      // Thêm kết nối mới
      newConnections[selectedLeft] = rightId;
      onConnect(selectedLeft, rightId);
      setSelectedLeft(null);
    }
  };

  // Xóa tất cả kết nối
  const clearAllConnections = (e: React.MouseEvent) => {
    e.preventDefault();
    onConnect('', '');
    setSelectedLeft(null);
  };

  // Chặn sự kiện chọn văn bản
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.userSelect = 'none';
      container.style.webkitUserSelect = 'none';
    }
  }, []);

  // Cập nhật refs khi component render
  useEffect(() => {
    leftRefs.current = new Map();
    rightRefs.current = new Map();
  }, [leftItems, rightItems]);

  return (
    <div ref={containerRef} className="relative flex justify-between py-4 px-8">
      {/* Cột A - Bên trái */}
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

      {/* Cột B - Bên phải */}
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

      {/* Các đường dây kết nối bằng react-xarrows */}
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

      {/* Nút xóa tất cả kết nối */}
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

// Custom Video Player with Timeline Questions - Updated
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
    correct: number;
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

      // Check if we should show a question
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
      // Resume video
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
      {/* Video Element */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
          onVolumeChange={(e) => setVolume((e.target as HTMLVideoElement).volume)}
        >
          Your browser does not support the video tag.
        </video>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Đang tải video...</p>
            </div>
          </div>
        )}

        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
          {/* Progress Bar with Question Markers */}
          <div className="relative mb-4">
            <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden cursor-pointer hover:h-4 transition-all duration-200" onClick={handleProgressClick}>
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-100 relative" style={{ width: `${getProgressPercentage()}%` }}>
                {/* Current time indicator */}
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500"></div>
              </div>
            </div>

            {/* Question Markers on Timeline */}
            {popupTimes.map((popup, index) => {
              const position = duration > 0 ? (popup.time / duration) * 100 : 0;
              const isAnswered = answers[index];
              const isNearQuestion = currentTime >= popup.time - 2 && currentTime <= popup.time + 2;

              return (
                <div key={index} className="absolute top-0 transform -translate-x-1/2 -translate-y-1 cursor-pointer group" style={{ left: `${position}%` }} onClick={() => handleSeek(popup.time)}>
                  {/* Question Marker - Removed flickering animations */}
                  <div
                    className={`
                      w-5 h-5 rounded-full border-3 border-white shadow-lg transition-all duration-300 group-hover:scale-125
                      ${isAnswered ? 'bg-green-500' : isNearQuestion ? 'bg-red-500 ring-2 ring-red-300' : 'bg-yellow-500'}
                    `}
                  >
                    {/* Inner dot */}
                    <div className="absolute inset-1 bg-white rounded-full opacity-60"></div>

                    {/* Question number */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-bold text-gray-800 shadow-md">{index + 1}</div>
                  </div>

                  {/* Tooltip - Improved positioning */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                    <div className="font-medium">Câu hỏi {index + 1}</div>
                    <div className="text-xs text-gray-300">{formatTime(popup.time)}</div>
                    <div className="text-xs">{isAnswered ? '✅ Đã trả lời' : '⏳ Chưa trả lời'}</div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>

                  {/* Time label - Improved */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white text-xs font-medium bg-gray-800 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {formatTime(popup.time)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Control Buttons */}
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

              {/* Question Progress */}
              <div className="text-sm bg-black/50 px-3 py-1 rounded-full">
                <span className="text-green-400">{Object.keys(answers).length}</span>
                <span className="text-gray-400">/{popupTimes.length}</span>
                <span className="text-xs ml-1">câu hỏi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Popup Dialog */}
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

      {/* Question Summary */}
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

const mockExam: ExamData = {
  id: '1',
  title: 'Kiểm tra đa dạng loại câu hỏi',
  subject: 'Lập trình Web',
  duration: 90,
  totalQuestions: 8,
  settings: {
    shuffleQuestions: false,
    shuffleAnswers: false,
    questionsPerPage: 1,
    showQuestionNav: true,
    allowReview: true,
    maxTabSwitch: 3,
  },
  questions: [
    {
      id: 'q1',
      type: 'multiple_choice',
      question: 'HTML là viết tắt của gì?',
      options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
      correctAnswer: 'HyperText Markup Language',
      points: 1,
      difficulty: 'easy',
    },
    {
      id: 'q2',
      type: 'multiple_select',
      question: 'Những thẻ HTML nào sau đây là thẻ block-level?',
      options: ['<div>', '<span>', '<p>', '<h1>', '<a>'],
      correctAnswer: ['<div>', '<p>', '<h1>'],
      points: 2,
      difficulty: 'medium',
    },
    {
      id: 'q3',
      type: 'fill_blank',
      question: 'Hoàn thành đoạn code CSS sau: .container { ___: flex; ___-direction: column; }',
      points: 2,
      difficulty: 'medium',
      config: {
        fill_blanks: [
          { id: 'blank1', position: 1, correct_answers: ['display'], case_sensitive: false },
          { id: 'blank2', position: 2, correct_answers: ['flex'], case_sensitive: false },
        ],
      },
    },
    {
      id: 'q4',
      type: 'drag_drop',
      question: 'Kéo các thuộc tính CSS vào đúng nhóm của chúng:',
      points: 3,
      difficulty: 'medium',
      config: {
        drag_items: [
          { id: 'item1', content: 'color', zone: '' },
          { id: 'item2', content: 'margin', zone: '' },
          { id: 'item3', content: 'font-size', zone: '' },
          { id: 'item4', content: 'padding', zone: '' },
          { id: 'item5', content: 'background', zone: '' },
          { id: 'item6', content: 'border', zone: '' },
        ],
        drag_drop_zones: [
          { id: 'zone1', name: 'Typography', accepts: ['item1', 'item3'] },
          { id: 'zone2', name: 'Box Model', accepts: ['item2', 'item4', 'item6'] },
          { id: 'zone3', name: 'Visual', accepts: ['item5'] },
        ],
      },
    },
    {
      id: 'q5',
      type: 'matching',
      question: 'Nối các thuật ngữ HTML với định nghĩa tương ứng bằng cách vẽ đường:',
      points: 3,
      difficulty: 'medium',
      config: {
        matching_pairs: [
          {
            id: 'pair1',
            left: 'DOCTYPE',
            right: 'Khai báo loại tài liệu',
            correct_match: 'DOCTYPE-Khai báo loại tài liệu',
          },
          {
            id: 'pair2',
            left: 'Semantic HTML',
            right: 'HTML có ý nghĩa',
            correct_match: 'Semantic HTML-HTML có ý nghĩa',
          },
          {
            id: 'pair3',
            left: 'Attribute',
            right: 'Thuộc tính của thẻ',
            correct_match: 'Attribute-Thuộc tính của thẻ',
          },
          {
            id: 'pair4',
            left: 'Element',
            right: 'Phần tử HTML',
            correct_match: 'Element-Phần tử HTML',
          },
        ],
      },
    },
    {
      id: 'q6',
      type: 'ordering',
      question: 'Kéo thả để sắp xếp các bước tạo một trang web theo thứ tự đúng:',
      points: 2,
      difficulty: 'easy',
      config: {
        ordering_items: [
          { id: 'step1', content: 'Viết HTML structure', correct_order: 1 },
          { id: 'step2', content: 'Thêm CSS styling', correct_order: 2 },
          { id: 'step3', content: 'Thêm JavaScript functionality', correct_order: 3 },
          { id: 'step4', content: 'Test và debug', correct_order: 4 },
        ],
      },
    },
    {
      id: 'q7',
      type: 'video_popup',
      question: 'Xem video Big Buck Bunny và trả lời các câu hỏi xuất hiện trên timeline:',
      points: 4,
      difficulty: 'hard',
      config: {
        video_config: {
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          popup_times: [
            {
              time: 15,
              question: 'Nhân vật chính trong video này là gì?',
              options: ['Thỏ', 'Chó', 'Mèo', 'Chuột'],
              correct: 0,
            },
            {
              time: 45,
              question: 'Màu sắc chủ đạo của nhân vật chính là gì?',
              options: ['Trắng', 'Nâu', 'Xám', 'Đen'],
              correct: 1,
            },
            {
              time: 75,
              question: 'Video này thuộc thể loại gì?',
              options: ['Hoạt hình 3D', 'Phim tài liệu', 'Phim hành động', 'Phim kinh dị'],
              correct: 0,
            },
            {
              time: 120,
              question: 'Chất lượng video này là bao nhiêu?',
              options: ['720p', '1080p', '4K', '480p'],
              correct: 1,
            },
          ],
        },
      },
    },
    {
      id: 'q8',
      type: 'essay',
      question: 'Giải thích sự khác biệt giữa CSS Grid và Flexbox. Khi nào nên sử dụng từng loại? Cho ví dụ minh họa.',
      points: 5,
      difficulty: 'hard',
    },
  ],
};

export default function ExamTaking() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(mockExam.duration * 60);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [orderingItems, setOrderingItems] = useState<Array<{ id: string; content: string }>>([]);

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted]);

  // Initialize ordering items for ordering questions
  useEffect(() => {
    const currentQ = mockExam.questions[currentQuestion];
    if (currentQ.type === 'ordering' && currentQ.config?.ordering_items) {
      const shuffled = [...currentQ.config.ordering_items].sort(() => Math.random() - 0.5);
      setOrderingItems(shuffled);
    }
  }, [currentQuestion]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isSubmitted) {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= mockExam.settings.maxTabSwitch) {
            alert('Bạn đã chuyển tab quá nhiều lần. Bài thi sẽ được nộp tự động.');
            handleSubmit();
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSubmitted]);

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
    const answeredQuestions = Object.keys(answers).length;
    return (answeredQuestions / mockExam.questions.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Dễ';
      case 'medium':
        return 'Trung bình';
      case 'hard':
        return 'Khó';
      default:
        return 'Không xác định';
    }
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
    if (draggedItem) {
      const currentAnswers = answers[currentQ.id] || {};
      handleAnswerChange(currentQ.id, {
        ...currentAnswers,
        [draggedItem]: zoneId,
      });
      setDraggedItem(null);
    }
  };

  // Ordering drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOrderingItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Save the new order to answers
        const orderMap = newItems.reduce((acc, item, index) => {
          acc[item.id] = index + 1;
          return acc;
        }, {} as Record<string, number>);

        handleAnswerChange(currentQ.id, orderMap);

        return newItems;
      });
    }
  };

  // Wire connection handler for matching
  const handleWireConnect = (leftId: string, rightId: string) => {
    if (leftId === '' && rightId === '') {
      // Clear all connections
      handleAnswerChange(currentQ.id, {});
      return;
    }

    const currentConnections = answers[currentQ.id] || {};
    const newConnections = { ...currentConnections };

    // Remove existing connection from this left item
    if (newConnections[leftId]) {
      delete newConnections[leftId];
    }

    // Remove any existing connection to this right item
    Object.keys(newConnections).forEach((key) => {
      if (newConnections[key] === rightId) {
        delete newConnections[key];
      }
    });

    // Add new connection
    if (leftId && rightId) {
      newConnections[leftId] = rightId;
    }

    handleAnswerChange(currentQ.id, newConnections);
  };

  // Video question handler
  const handleVideoQuestionAnswer = (timeIndex: number, answer: string) => {
    const currentAnswers = answers[currentQ.id] || {};
    handleAnswerChange(currentQ.id, {
      ...currentAnswers,
      [timeIndex]: answer,
    });
  };

  const currentQ = mockExam.questions[currentQuestion];

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Bài thi đã được nộp!</h2>
            <p className="text-gray-600">Cảm ơn bạn đã hoàn thành bài thi. Kết quả sẽ được công bố sớm.</p>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Thời gian hoàn thành: {formatTime(mockExam.duration * 60 - timeLeft)}</p>
            <p>
              Số câu đã trả lời: {Object.keys(answers).length}/{mockExam.questions.length}
            </p>
            <p>Số lần chuyển tab: {tabSwitchCount}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{mockExam.title}</CardTitle>
              <CardDescription>{mockExam.subject}</CardDescription>
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
                  Chuyển tab: {tabSwitchCount}/{mockExam.settings.maxTabSwitch}
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
                {Object.keys(answers).length}/{mockExam.questions.length} câu
              </span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigation */}
        {mockExam.settings.showQuestionNav && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Danh sách câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 lg:grid-cols-3 gap-2">
                {mockExam.questions.map((q, index) => (
                  <Button
                    key={q.id}
                    variant={currentQuestion === index ? 'default' : answers[q.id] ? 'secondary' : 'outline'}
                    size="sm"
                    className={`relative ${flaggedQuestions.has(q.id) ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    {index + 1}
                    {flaggedQuestions.has(q.id) && <Flag className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />}
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
        )}

        {/* Question Content */}
        <Card className={mockExam.settings.showQuestionNav ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Câu {currentQuestion + 1}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <CardDescription>{currentQ.points}</CardDescription>
                  <Badge className={getDifficultyColor(currentQ.difficulty)}>{getDifficultyLabel(currentQ.difficulty)}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toggleFlag(currentQ.id)} className={flaggedQuestions.has(currentQ.id) ? 'bg-yellow-50 border-yellow-300' : ''}>
                <Flag className={`h-4 w-4 ${flaggedQuestions.has(currentQ.id) ? 'text-yellow-500' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{currentQ.question}</div>

            {/* Multiple Choice */}
            {currentQ.type === 'multiple_choice' && currentQ.options && (
              <RadioGroup value={answers[currentQ.id] || ''} onValueChange={(value) => handleAnswerChange(currentQ.id, value)}>
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${currentQ.id}-${index}`} />
                    <Label htmlFor={`${currentQ.id}-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* Multiple Select */}
            {currentQ.type === 'multiple_select' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${currentQ.id}-${index}`}
                      checked={(answers[currentQ.id] || []).includes(option)}
                      onCheckedChange={(checked) => {
                        const currentAnswers = answers[currentQ.id] || [];
                        if (checked) {
                          handleAnswerChange(currentQ.id, [...currentAnswers, option]);
                        } else {
                          handleAnswerChange(
                            currentQ.id,
                            currentAnswers.filter((a: string) => a !== option),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`${currentQ.id}-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Fill in the Blanks */}
            {currentQ.type === 'fill_blank' && currentQ.config?.fill_blanks && (
              <div className="space-y-4">
                {currentQ.config.fill_blanks.map((blank, index) => (
                  <div key={blank.id} className="space-y-2">
                    <Label>Chỗ trống {blank.position}:</Label>
                    <Input
                      placeholder={`Điền vào chỗ trống ${blank.position}`}
                      value={answers[currentQ.id]?.[blank.id] || ''}
                      onChange={(e) => {
                        const currentAnswers = answers[currentQ.id] || {};
                        handleAnswerChange(currentQ.id, {
                          ...currentAnswers,
                          [blank.id]: e.target.value,
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Drag and Drop */}
            {currentQ.type === 'drag_drop' && currentQ.config?.drag_items && currentQ.config?.drag_drop_zones && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Kéo các item vào zone phù hợp:</h4>

                  {/* Drag Items */}
                  <div className="flex flex-wrap gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                    {currentQ.config.drag_items
                      .filter((item) => !answers[currentQ.id]?.[item.id])
                      .map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          className="px-3 py-2 bg-blue-100 border border-blue-300 rounded cursor-move hover:bg-blue-200 transition-colors"
                        >
                          <Move className="h-4 w-4 inline mr-2" />
                          {item.content}
                        </div>
                      ))}
                  </div>

                  {/* Drop Zones */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentQ.config.drag_drop_zones.map((zone) => (
                      <div key={zone.id} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, zone.id)} className="min-h-24 p-4 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50">
                        <h5 className="font-medium mb-2">{zone.name}</h5>
                        <div className="space-y-2">
                          {Object.entries(answers[currentQ.id] || {})
                            .filter(([_, zoneId]) => zoneId === zone.id)
                            .map(([itemId, _]) => {
                              const item = currentQ.config?.drag_items?.find((i) => i.id === itemId);
                              return item ? (
                                <div key={itemId} className="px-2 py-1 bg-green-100 border border-green-300 rounded text-sm">
                                  {item.content}
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

            {/* Wire Matching */}
            {currentQ.type === 'matching' && currentQ.config?.matching_pairs && (
              <div className="space-y-4">
                <WireConnection
                  leftItems={currentQ.config.matching_pairs.map((pair) => ({ id: pair.id, content: pair.left }))}
                  rightItems={currentQ.config.matching_pairs.map((pair) => ({ id: pair.id, content: pair.right }))}
                  connections={answers[currentQ.id] || {}}
                  onConnect={handleWireConnect}
                />
              </div>
            )}

            {/* Drag & Drop Ordering */}
            {currentQ.type === 'ordering' && orderingItems.length > 0 && (
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

            {/* Video with Timeline Questions */}
            {currentQ.type === 'video_popup' && currentQ.config?.video_config && (
              <div className="space-y-4">
                <VideoPlayerWithQuestions
                  videoUrl={currentQ.config.video_config.url}
                  popupTimes={currentQ.config.video_config.popup_times}
                  onAnswerSubmit={handleVideoQuestionAnswer}
                  answers={answers[currentQ.id] || {}}
                />
              </div>
            )}

            {/* Essay */}
            {currentQ.type === 'essay' && (
              <Textarea placeholder="Nhập câu trả lời của bạn..." value={answers[currentQ.id] || ''} onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)} className="min-h-32" />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button variant="outline" onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Câu trước
              </Button>

              <div className="flex gap-2">
                {currentQuestion === mockExam.questions.length - 1 ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>
                        <Send className="h-4 w-4 mr-2" />
                        Nộp bài
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận nộp bài</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể thay đổi câu trả lời.
                          <br />
                          <br />
                          Số câu đã trả lời: {Object.keys(answers).length}/{mockExam.questions.length}
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
                  <Button onClick={() => setCurrentQuestion(Math.min(mockExam.questions.length - 1, currentQuestion + 1))}>
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
