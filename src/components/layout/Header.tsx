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

const Header = () => {
  const navigate = useNavigate()
  const getInitials = (name: string) => {
    return name
      .split(" ") 
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Xin chào, bạn</span>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                onClick={() => console.log("Avatar clicked")}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="AAA" />
                  <AvatarFallback>{getInitials("AAA")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 z-50" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">AAA</p>
                  <p className="text-xs leading-none text-muted-foreground">Giáo viên</p>
                  <p className="text-xs leading-none text-muted-foreground">aaa@gmail.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span onClick={() => navigate(path.PROFILE)}>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
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