import { useRef, useState } from 'react';
import type { Question } from '@/services/student/interfaces/exam.interface';
import Xarrow from 'react-xarrows';
import { useEffect } from 'react';

// Component cho câu hỏi Matching
function MatchingQuestion({ question, connections, onConnect }: { question: Question; connections: Record<string, string>; onConnect: (leftId: string, rightId: string) => void }) {
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
      if (selectedLeft && rightId) {
        newConnections[selectedLeft] = rightId;
      }
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
  }, [question.answers]);

  return (
    <div ref={containerRef} className="relative flex justify-between py-4 px-8">
      <div className="w-1/3 space-y-3">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Cột A</h5>
        {question.answers.map((answer) => (
          <div
            key={answer.id}
            id={`left-${answer.id}`}
            ref={(el) => {
              if (el) leftRefs.current.set(answer.id, el);
            }}
            onClick={(e) => handleLeftClick(answer.id, e)}
            className={`
                p-3 border rounded-lg cursor-pointer transition-all duration-200
                flex items-center justify-between
                ${selectedLeft === answer.id ? 'bg-blue-100 border-blue-500 shadow-md' : connections[answer.id] ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300 hover:bg-blue-50'}
              `}
          >
            <span className="flex-1 text-sm font-medium">{answer.content.left || 'Không có nội dung'}</span>
            <div
              className={`
                  w-4 h-4 rounded-full border-2 border-white shadow
                  ${selectedLeft === answer.id ? 'bg-blue-600 animate-pulse' : connections[answer.id] ? 'bg-green-500' : 'bg-gray-400'}
                `}
            />
          </div>
        ))}
      </div>

      <div className="w-1/3 space-y-3">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">Cột B</h5>
        {question.answers.map((answer) => (
          <div
            key={answer.id}
            id={`right-${answer.id}`}
            ref={(el) => {
              if (el) rightRefs.current.set(answer.id, el);
            }}
            onClick={(e) => handleRightClick(answer.id, e)}
            className={`
                p-3 border rounded-lg cursor-pointer transition-all duration-200
                flex items-center justify-between
                ${
                  Object.values(connections).includes(answer.id)
                    ? 'bg-green-100 border-green-400'
                    : selectedLeft
                    ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }
              `}
          >
            <div
              className={`
                  w-4 h-4 rounded-full border-2 border-white shadow
                  ${Object.values(connections).includes(answer.id) ? 'bg-green-500' : selectedLeft ? 'bg-yellow-500' : 'bg-gray-400'}
                `}
            />
            <span className="flex-1 text-sm font-medium">{answer.content.right || 'Không có nội dung'}</span>
          </div>
        ))}
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

export default MatchingQuestion;
