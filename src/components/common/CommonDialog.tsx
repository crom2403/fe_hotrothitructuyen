import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface CommonDialogProps {
  title: string;
  itemName: string;
  id: string;
  onDelete: (id: string) => void;
}

export default function CommonDialog({ title, itemName, id, onDelete }: CommonDialogProps) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Xác nhận {title}</AlertDialogTitle>
        <AlertDialogDescription>Bạn có chắc chắn muốn {title} {itemName} này? Hành động này không thể hoàn tác.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Hủy</AlertDialogCancel>
        <AlertDialogAction onClick={() => onDelete(id)}>{title.toUpperCase()}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
