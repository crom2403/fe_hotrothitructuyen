import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface CommonDialogProps {
  title: string;
  itemName: string;
  id: string;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CommonDialog({ title, itemName, id, onDelete, isLoading }: CommonDialogProps) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Xác nhận {title}</AlertDialogTitle>
        <AlertDialogDescription>
          Bạn có chắc chắn muốn {title} {itemName} này? Hành động này không thể hoàn tác.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
        <AlertDialogAction
          onClick={async (e) => {
            e.preventDefault();
            await onDelete(id);
          }}
          className="bg-red-500 hover:bg-red-600 flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            title.toUpperCase()
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}