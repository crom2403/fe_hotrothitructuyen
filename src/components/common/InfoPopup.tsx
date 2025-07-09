import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Info } from 'lucide-react';

interface InfoPopupProps {
  text: string;
  _open?: boolean; // Optional and prefixed with _ to indicate unused
  _setOpen?: (open: boolean) => void; // Optional and prefixed with _
}

export default function InfoPopup({ text }: InfoPopupProps) {
  return (
    <Popover>
      <PopoverTrigger>
        <Info className="h-4 w-4 text-gray-500" />
      </PopoverTrigger>
      <PopoverContent>{text}</PopoverContent>
    </Popover>
  );
}
