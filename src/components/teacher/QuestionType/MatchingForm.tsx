import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import type { QuestionFormData, AnswerItem, MatchingConfig } from '@/types/questionFormTypes';
import Xarrow from 'react-xarrows';
import { useRef, useState, useEffect } from 'react';

interface MatchingFormProps {
  form: UseFormReturn<QuestionFormData>;
  addOption: () => void;
  removeOption: (index: number) => void;
  updateMatchContent: (index: number, left: string, right: string) => void;
}

const MAX_PAIRS = 7;

const MatchingForm = ({ form, addOption, removeOption, updateMatchContent }: MatchingFormProps) => {
  const answers = useWatch({
    control: form.control,
    name: 'answers',
    defaultValue: [],
  });

  const answerConfig = useWatch({
    control: form.control,
    name: 'answer_config',
    defaultValue: { kind: 'matching', correct: [], pairs: [] } as MatchingConfig,
  });

  const [connections, setConnections] = useState<Record<string, string>>({});
  const leftRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rightRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  // Chỉ cập nhật answer_config.correct dựa trên connections
  useEffect(() => {
    const correctPairs = Object.entries(connections).map(([leftId, rightId]) => {
      const leftAnswer: any = answers.find((a) => a.id === leftId);
      const rightAnswer: any = answers.find((a) => a.id === rightId);
      return {
        left: leftAnswer?.content.left || '',
        right: rightAnswer?.content.right || '',
      };
    });
    form.setValue('answer_config.correct', correctPairs, { shouldDirty: true });
  }, [connections, answers, form]);

  const handleLeftClick = (leftId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedLeft(selectedLeft === leftId ? null : leftId);
  };

  const handleRightClick = (rightId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedLeft && !connections[selectedLeft] && !Object.values(connections).includes(rightId)) {
      const newConnections = { ...connections, [selectedLeft]: rightId };
      setConnections(newConnections);
      // Không cập nhật answers trực tiếp, để người dùng nhập tay
      setSelectedLeft(null);
    }
  };

  const clearAllConnections = (e: React.MouseEvent) => {
    e.preventDefault();
    setConnections({});
    form.setValue('answer_config.correct', [], { shouldDirty: true });
  };

  const handleDeleteOption = (index: number, answerId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Xóa các kết nối liên quan đến cột này
    const newConnections = { ...connections };
    delete newConnections[answerId];

    // Xóa kết nối nếu cột này là đích của kết nối nào đó
    Object.keys(newConnections).forEach((leftId) => {
      if (newConnections[leftId] === answerId) {
        delete newConnections[leftId];
      }
    });

    setConnections(newConnections);

    // Reset selectedLeft nếu cột đang được chọn bị xóa
    if (selectedLeft === answerId) {
      setSelectedLeft(null);
    }

    // Gọi hàm removeOption từ props
    removeOption(index);
  };

  useEffect(() => {
    leftRefs.current = new Map();
    rightRefs.current = new Map();
  }, [answers]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.userSelect = 'none';
      container.style.webkitUserSelect = 'none';
    }
  }, []);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>Các cặp cần nối</FormLabel>
        <div className="flex gap-2">
          <div className="">
            {Object.keys(connections).length > 0 && (
              <Button onClick={clearAllConnections} variant="outline" size="sm" className="text-red-700 bg-red-100 hover:bg-red-200">
                Xóa tất cả nối
              </Button>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addOption} disabled={answers.length >= MAX_PAIRS}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm cặp
          </Button>
        </div>
      </div>

      <FormField
        control={form.control}
        name="answers"
        render={({ field }) => (
          <FormItem>
            <div className="relative flex justify-between gap-4">
              <div className="w-1/3 space-y-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Cột A</h5>
                {field.value?.map((answer: any, index: number) => (
                  <div
                    key={answer.id}
                    id={`left-${answer.id}`}
                    ref={(el) => el && (leftRefs.current.set(answer.id, el) as any)}
                    onClick={(e) => handleLeftClick(answer.id, e)}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all duration-200
                      flex items-center justify-between gap-2
                      ${selectedLeft === answer.id ? 'bg-blue-100 border-blue-500' : connections[answer.id] ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300 hover:bg-blue-50'}
                    `}
                  >
                    <FormControl>
                      <Input
                        value={answer.content?.left || ''}
                        onChange={(e) => updateMatchContent(index, e.target.value, answer.content?.right || '')}
                        placeholder={`Cột A - ${index + 1}`}
                        className="flex-1 bg-transparent border-none focus:ring-0"
                      />
                    </FormControl>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="ghost" size="sm" onClick={(e) => handleDeleteOption(index, answer.id, e)} className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <div
                        className={`
                          w-4 h-4 rounded-full border-2 border-white shadow
                          ${selectedLeft === answer.id ? 'bg-blue-600' : connections[answer.id] ? 'bg-green-500' : 'bg-gray-400'}
                        `}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-1/3 space-y-3">
                <h5 className="text-sm font-semibold text-gray-700 mb-2">Cột B</h5>
                {field.value.map((answer: any, index: number) => (
                  <div
                    key={answer.id}
                    id={`right-${answer.id}`}
                    ref={(el) => el && (rightRefs.current.set(answer.id, el) as any)}
                    onClick={(e) => handleRightClick(answer.id, e)}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all duration-200
                      flex items-center justify-between gap-2
                      ${Object.values(connections).includes(answer.id) ? 'bg-green-100 border-green-400' : 'bg-white border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`
                          w-4 h-4 rounded-full border-2 border-white shadow
                          ${Object.values(connections).includes(answer.id) ? 'bg-green-500' : 'bg-gray-400'}
                        `}
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={(e) => handleDeleteOption(index, answer.id, e)} className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        value={answer.content?.right || ''}
                        onChange={(e) => updateMatchContent(index, answer.content?.left || '', e.target.value)}
                        placeholder={`Cột B - ${index + 1}`}
                        className="flex-1 bg-transparent border-none focus:ring-0"
                      />
                    </FormControl>
                  </div>
                ))}
              </div>
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
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MatchingForm;
