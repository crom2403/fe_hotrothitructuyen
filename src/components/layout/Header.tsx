import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { useNavigate } from "react-router-dom";
import path from "@/utils/path";
import useAuthStore from "@/stores/authStore";

const Header = () => {
  const { currentUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout()
    navigate(path.LOGIN)
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Xin chào, {currentUser?.full_name}</span>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.full_name || "AAA"} />
                  <AvatarFallback>{getInitials(currentUser?.full_name || "AAA")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser?.role_code}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(path.PROFILE)}>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => navigate(path.SETTINGS)}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;