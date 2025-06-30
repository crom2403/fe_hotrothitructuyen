import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { apiUpdateAvatar } from '@/services/auth';
import useAuthStore from '@/stores/authStore';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useState } from 'react';

const listAvatar = [
  {
    id: 1,
    image: 'https://cdn-icons-png.flaticon.com/512/3426/3426666.png',
    role: 'teacher',
  },
  {
    id: 2,
    image: 'https://cdn-icons-png.flaticon.com/512/3426/3426676.png',
    role: 'teacher',
  },
  {
    id: 3,
    image: 'https://cdn-icons-png.flaticon.com/128/195/195138.png',
    role: 'teacher',
  },
  {
    id: 4,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482102.png',
    role: 'teacher',
  },
  {
    id: 5,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482183.png',
    role: 'teacher',
  },
  {
    id: 6,
    image: 'https://cdn-icons-png.flaticon.com/128/13979/13979702.png',
    role: 'teacher',
  },
  {
    id: 6,
    image: 'https://cdn-icons-png.flaticon.com/128/13481/13481865.png',
    role: 'teacher',
  },
  {
    id: 7,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482201.png',
    role: 'teacher',
  },
  {
    id: 8,
    image: 'https://cdn-icons-png.flaticon.com/128/13481/13481876.png',
    role: 'teacher',
  },
  {
    id: 9,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482210.png',
    role: 'teacher',
  },
  {
    id: 10,
    image: 'https://cdn-icons-png.flaticon.com/128/13481/13481897.png',
    role: 'student',
  },
  {
    id: 11,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482193.png',
    role: 'student',
  },
  {
    id: 12,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482119.png',
    role: 'student',
  },
  {
    id: 13,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482227.png',
    role: 'student',
  },
  {
    id: 14,
    image: 'https://cdn-icons-png.flaticon.com/128/13481/13481986.png',
    role: 'student',
  },
  {
    id: 15,
    image: 'https://cdn-icons-png.flaticon.com/128/13481/13481934.png',
    role: 'student',
  },
  {
    id: 16,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482054.png',
    role: 'student',
  },
  {
    id: 17,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482013.png',
    role: 'student',
  },
  {
    id: 18,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482192.png',
    role: 'student',
  },
  {
    id: 19,
    image: 'https://cdn-icons-png.flaticon.com/128/13481/13481872.png',
    role: 'student',
  },
  {
    id: 20,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482027.png',
    role: 'student',
  },
  {
    id: 21,
    image: 'https://cdn-icons-png.flaticon.com/128/13482/13482173.png',
    role: 'student',
  },
  {
    id: 22,
    image: 'https://cdn-icons-png.flaticon.com/128/13481/13481854.png',
    role: 'student',
  },
];

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
  const [loading, setLoading] = useState(false);
  const handleUpdateAvatar = async (avatar: string) => {
    setIsLoadingUpdateAvatar(true);
    onOpenChange(false);
    const res = await apiUpdateAvatar({ avatar_url: avatar });
    updateAvatar(res.data.avatar_url);
    setIsLoadingUpdateAvatar(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-md min-h-lg">
        <DialogHeader>
          <DialogTitle>Chọn ảnh đại diện cho tài khoản của bạn</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-6">
          {filteredListAvatar.map((avatar) => (
            <AvatarItem key={avatar.id} avatar={avatar} handleUpdateAvatar={handleUpdateAvatar} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseAvatarDialog;
