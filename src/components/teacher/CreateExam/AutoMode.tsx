import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useExamStore from '@/stores/examStore';

interface AutoModeProps {
  examMode: string;
  isLoading: boolean;
}

const AutoMode = ({ examMode }: AutoModeProps) => {
  const { tab2Data, setDifficulty } = useExamStore();

  // Khởi tạo difficulty nếu undefined
  const difficulty = tab2Data.difficulty ?? { easy: 0, medium: 0, hard: 0 };

  const handleDifficultyChange = (key: keyof typeof difficulty, value: string) => {
    const newValue = parseInt(value) || 0;
    setDifficulty({ ...difficulty, [key]: newValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{examMode === 'auto' ? 'Tạo đề thi tự động' : 'Tạo đề thi AI'}</CardTitle>
        <CardDescription>{examMode === 'auto' ? 'Hệ thống sẽ tự động chọn câu hỏi dựa trên tiêu chí' : 'AI sẽ tự động tạo câu hỏi dựa trên tiêu chí'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Số lượng câu dễ</Label>
            <Input type="number" value={difficulty.easy} onChange={(e) => handleDifficultyChange('easy', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Số lượng câu trung bình</Label>
            <Input type="number" value={difficulty.medium} onChange={(e) => handleDifficultyChange('medium', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Số lượng câu khó</Label>
            <Input type="number" value={difficulty.hard} onChange={(e) => handleDifficultyChange('hard', e.target.value)} />
          </div>
        </div>
        {/* <Button onClick={generateAutoExam} disabled={isLoading} className="w-full bg-black hover:bg-black/80">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo đề...
            </>
          ) : (
            <>
              <Shuffle className="mr-2 h-4 w-4" />
              Tạo đề tự động
            </>
          )}
        </Button> */}
      </CardContent>
    </Card>
  );
};

export default AutoMode;
