import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface DeleteDialogProps {
  itemName: string;
  id: string;
  onDelete: (id: string) => void;
}

const DeleteDialog = ({ itemName, id, onDelete }: DeleteDialogProps) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Bạn có chắc chắn muốn xóa {itemName} này không?</AlertDialogTitle>
        <AlertDialogDescription>
          Bạn sẽ không thể khôi phục lại sau khi xóa.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Hủy</AlertDialogCancel>
        <AlertDialogAction onClick={() => onDelete(id)}>Xóa</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}

export default DeleteDialog