import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

interface ExamEvent {
  id: string;
  title: string;
  subject: string;
  date: Date;
  time: string;
  location: string;
  duration: string;
  type: 'midterm' | 'final' | 'quiz';
}

const mockExams: ExamEvent[] = [
  {
    id: '1',
    title: 'Kiểm tra giữa kỳ',
    subject: 'Lập trình Web',
    date: new Date(2025, 0, 15),
    time: '08:00 - 10:00',
    location: 'Phòng A101',
    duration: '120 phút',
    type: 'midterm',
  },
  {
    id: '2',
    title: 'Thi cuối kỳ',
    subject: 'Cơ sở dữ liệu',
    date: new Date(2025, 0, 20),
    time: '14:00 - 16:00',
    location: 'Phòng B205',
    duration: '120 phút',
    type: 'final',
  },
  {
    id: '3',
    title: 'Kiểm tra 15 phút',
    subject: 'Toán rời rạc',
    date: new Date(2025, 0, 25),
    time: '10:00 - 10:15',
    location: 'Phòng C301',
    duration: '15 phút',
    type: 'quiz',
  },
];

const ExamCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const hasExamOnDate = (date: Date) => {
    return mockExams.some((exam) => exam.date.getDate() === date.getDate() && exam.date.getMonth() === date.getMonth() && exam.date.getFullYear() === date.getFullYear());
  };

  const getExamsForDate = (date: Date) => {
    return mockExams.filter((exam) => exam.date.getDate() === date.getDate() && exam.date.getMonth() === date.getMonth() && exam.date.getFullYear() === date.getFullYear());
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const hasExam = hasExamOnDate(date);
      const isSelected = selectedDate && date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            h-10 w-10 rounded-md text-sm font-medium transition-colors
            ${isSelected ? 'bg-blue-600 text-white' : ''}
            ${hasExam && !isSelected ? 'bg-blue-100 text-blue-800 font-bold' : ''}
            ${isToday && !isSelected && !hasExam ? 'bg-gray-100' : ''}
            ${!isSelected && !hasExam && !isToday ? 'hover:bg-gray-50' : ''}
          `}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  const selectedExams = selectedDate ? getExamsForDate(selectedDate) : [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'final':
        return 'bg-red-100 text-red-800';
      case 'midterm':
        return 'bg-yellow-100 text-yellow-800';
      case 'quiz':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'final':
        return 'Cuối kỳ';
      case 'midterm':
        return 'Giữa kỳ';
      case 'quiz':
        return 'Kiểm tra';
      default:
        return 'Khác';
    }
  };

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lịch thi</CardTitle>
          <CardDescription>Chọn ngày để xem chi tiết các kỳ thi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Ngày được chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Có kỳ thi</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết ngày {selectedDate?.toLocaleDateString('vi-VN')}</CardTitle>
          <CardDescription>{selectedExams.length > 0 ? `Có ${selectedExams.length} kỳ thi trong ngày này` : 'Không có kỳ thi nào trong ngày này'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedExams.length > 0 ? (
            selectedExams.map((exam) => (
              <div key={exam.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{exam.title}</h3>
                  <Badge className={getTypeColor(exam.type)}>{getTypeLabel(exam.type)}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span>{exam.subject}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {exam.time} ({exam.duration})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{exam.location}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Không có kỳ thi nào trong ngày này</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamCalendar;
