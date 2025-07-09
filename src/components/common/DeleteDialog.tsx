import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface DeleteDialogProps {
  itemName: string;
  id: string;
  onDelete: (id: string) => void;
}

export default function DeleteDialog({ itemName, id, onDelete }: DeleteDialogProps) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
        <AlertDialogDescription>Bạn có chắc chắn muốn xóa {itemName} này? Hành động này không thể hoàn tác.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Hủy</AlertDialogCancel>
        <AlertDialogAction onClick={() => onDelete(id)}>Xóa</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
