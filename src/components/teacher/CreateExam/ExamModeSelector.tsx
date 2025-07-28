import { Button } from '@/components/ui/button';
import useExamStore from '@/stores/examStore';
import useUpdateExamStore from '@/stores/updateExamStore';
import { FileText, Shuffle } from 'lucide-react';

interface ExamModeSelectorProps {
  examMode: 'manual' | 'auto';
  setExamMode: (mode: 'manual' | 'auto') => void;
  mode: 'create' | 'update';
}

const ExamModeSelector = ({ examMode, setExamMode, mode }: ExamModeSelectorProps) => {
  const store = mode === 'create' ? useExamStore : useUpdateExamStore;
  const { setExamType } = store();

  const handleModeChange = (mode: 'manual' | 'auto') => {
    setExamMode(mode);
    setExamType(mode === 'manual' ? 'manual' : mode === 'auto' ? 'auto' : 'auto');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
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
        className={`h-20 flex-col ${examMode === 'auto' ? 'cursor-pointer bg-primary text-white hover:bg-primary/90 hover:text-white' : ''}`}
      >
        <Shuffle className="h-6 w-6 mb-2" />
        Tự động
      </Button>
    </div>
  );
};

export default ExamModeSelector;
