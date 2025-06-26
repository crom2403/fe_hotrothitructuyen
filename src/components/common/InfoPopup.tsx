import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Info } from "lucide-react";

interface InfoPopupProps {
  text: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const InfoPopup = ({ text, open, setOpen }: InfoPopupProps) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Info className="h-4 w-4 cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        className="text-sm max-w-xs p-3 bg-white rounded-md shadow-xl border z-50"
      >
        <p className="text-gray-700">{text}</p>
      </PopoverContent>
    </Popover>
  )
}

export default InfoPopup