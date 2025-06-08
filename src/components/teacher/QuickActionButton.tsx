import { Button } from "../ui/button"

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const QuickActionButton = ({ icon, label, onClick }: QuickActionButtonProps) => {
  return (
    <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-1"
      onClick={onClick}
    >
      <p className="w-6 h-6 text-primary">{icon}</p>
      <p className="text-sm font-medium">{label}</p>
    </Button>
  )
}

export default QuickActionButton