import { Button } from '@/components/ui/button';
import useExamStore from '@/stores/examStore';
import { FileText, Settings, Shuffle } from 'lucide-react';

interface ExamModeSelectorProps {
  examMode: 'manual' | 'auto' | 'ai';
  setExamMode: (mode: 'manual' | 'auto' | 'ai') => void;
}

const ExamModeSelector = ({ examMode, setExamMode }: ExamModeSelectorProps) => {
  const { setExamType, tab2Data } = useExamStore();

  const handleModeChange = (mode: 'manual' | 'auto' | 'ai') => {
    setExamMode(mode);
    setExamType(mode === 'manual' ? 'manual' : mode === 'auto' ? 'auto' : 'ai');
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <Button
        variant="outline"
        onClick={() => handleModeChange('manual')}
        className={`h-20 flex-col ${examMode === 'manual' ? 'cursor-pointer bg-primary text-white hover:bg-primary/90 hover:text-white' : ''}`}
      >
        <FileText className="h-6 w-6 mb-2" />
        Thủ công
      </Button>
      <Button
        variant="outline"
        onClick={() => handleModeChange('auto')}
        className={`h-20 flex-col ${examMode === 'auto' ? 'cursor-pointer bg-green-500 text-white hover:bg-green-500/90 hover:text-white' : ''}`}
      >
        <Shuffle className="h-6 w-6 mb-2" />
        Tự động
      </Button>
      <Button
        variant="outline"
        onClick={() => handleModeChange('ai')}
        className={`h-20 flex-col ${examMode === 'ai' ? 'cursor-pointer bg-orange-500 text-white hover:bg-orange-500 hover:text-white' : ''}`}
      >
        <Settings className="h-6 w-6 mb-2" />
        <p> AI hỗ trợ</p>
      </Button>
    </div>
  );
};

export default ExamModeSelector;
