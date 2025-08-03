import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { apiUpdateAvatar } from '@/services/auth';
import useAuthStore from '@/stores/authStore';
import { DialogTitle } from '@radix-ui/react-dialog';
import { listAvatar } from '@/utils/avatar';

const AvatarItem = ({ avatar, handleUpdateAvatar }: { avatar: (typeof listAvatar)[number]; handleUpdateAvatar: (avatar: string) => void }) => {
  const uploadAvatar = (avatar: string) => {
    handleUpdateAvatar(avatar);
  };
  return (
    <Avatar onClick={() => uploadAvatar(avatar.image)} className="w-18 h-18 bg-white hover:bg-transparent cursor-pointer hover:opacity-80 transition-opacity duration-300 border border-gray-200">
      <AvatarImage src={avatar.image} />
      <AvatarFallback className="text-lg">{avatar.role.charAt(0)}</AvatarFallback>
    </Avatar>
  );
};

const ChooseAvatarDialog = ({ open, onOpenChange, setIsLoadingUpdateAvatar }: { open: boolean; onOpenChange: (open: boolean) => void; setIsLoadingUpdateAvatar: (loading: boolean) => void }) => {
  const { currentUser, updateAvatar } = useAuthStore();
  const filteredListAvatar = listAvatar.filter((avatar) => avatar.role === currentUser?.role_code || currentUser?.role_code === 'admin');
  const handleUpdateAvatar = async (avatar: string) => {
    setIsLoadingUpdateAvatar(true);
    onOpenChange(false);
    const res = await apiUpdateAvatar({ avatar_url: avatar });
    updateAvatar(res.data.avatar_url);
    setIsLoadingUpdateAvatar(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-md md:min-h-lg">
        <DialogHeader>
          <DialogTitle>Chọn ảnh đại diện cho tài khoản của bạn</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-5 grid-cols-4 gap-6">
          {filteredListAvatar.map((avatar) => (
            <AvatarItem key={avatar.id} avatar={avatar} handleUpdateAvatar={handleUpdateAvatar} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseAvatarDialog;
