import { BarChart3, Bell, BookOpen, Calendar, CalendarDays, ClipboardList, Database, GraduationCap, Home, Monitor, PenTool, Settings, Shield, ShieldUser, Trophy, Users } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import Logo from '../../../public/images/svg/logo.svg';
import LogoMini from '../../../public/images/svg/logo-mini.svg';

import useAppStore from '@/stores/appStore';
import path from '@/utils/path';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';

const AppSidebar = () => {
  const { openSidebar } = useAppStore();
  const location = useLocation();
  const { currentUser } = useAuthStore();

  const getMenuItems = () => {
    switch (currentUser?.role_code as string) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: Home, path: path.ADMIN.OVERVIEW },
          { id: 'users', label: 'Quản lý người dùng', icon: Users, path: path.ADMIN.USER },
          { id: 'subjects', label: 'Quản lý môn học', icon: BookOpen, path: path.ADMIN.SUBJECT },
          { id: 'semesters', label: 'Năm học & Học kỳ', icon: Calendar, path: path.ADMIN.YEAR_SEMESTER },
          { id: 'classes', label: 'Lớp học phần', icon: GraduationCap, path: path.ADMIN.STUDY_GROUP },
          { id: 'questions', label: 'Quản lý câu hỏi', icon: Database, path: path.ADMIN.QUESTION },
          // { id: "settings", label: "Cài đặt hệ thống", icon: Settings },
          { id: 'permission_role', label: 'Phân quyền vai trò', icon: Shield, path: path.ADMIN.PERMISSTION_ROLE },
          { id: 'permission_user', label: 'Phân quyền người dùng', icon: ShieldUser, path: path.ADMIN.PERMISSTION_USER },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: Home, path: path.TEACHER.OVERVIEW },
          { id: 'questions', label: 'Câu hỏi', icon: Database, path: path.TEACHER.QUESTION_BANK },
          { id: 'create-exam', label: 'Tạo đề thi', icon: PenTool, path: path.TEACHER.EXAM },
          { id: 'exams', label: 'Quản lý đề thi', icon: ClipboardList },
          { id: 'classes', label: 'Lớp học phần', icon: GraduationCap, path: path.TEACHER.STUDY_GROUP },
          // { id: "exam-rooms", label: "Phòng thi", icon: Monitor },
          { id: 'results', label: 'Kết quả & Báo cáo', icon: BarChart3 },
          // { id: "ai-exam", label: "Tạo đề thi AI", icon: Brain },
        ];
      case 'student':
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: Home, path: path.STUDENT.OVERVIEW },
          { id: 'classes', label: 'Lớp học phần', icon: GraduationCap, path: path.STUDENT.STUDY_GROUP },
          { id: 'exam-list', label: 'Danh sách bài thi', icon: ClipboardList, path: path.STUDENT.EXAM_LIST },
          { id: 'exam-results', label: 'Kết quả thi', icon: Trophy, path: path.STUDENT.EXAM_RESULTS },
          { id: 'exam-calendar', label: 'Lịch thi', icon: CalendarDays, path: path.STUDENT.EXAM_CALENDAR },
          { id: 'notification', label: 'Thông báo', icon: Bell, path: path.STUDENT.NOTIFICATION },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <Sidebar collapsible="icon" className="w-[255px] bg-white">
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1">
          {openSidebar ? <img src={Logo} alt="Logo" className="w-15 h-15 transition-all duration-500" /> : <img src={LogoMini} alt="Logo" className="w-10 h-10 transition-all duration-500" />}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Exam System</span>
            <span className="truncate text-xs text-muted-foreground">Hệ thống thi trắc nghiệm</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild className={`transition-all duration-200 ${isActive ? 'bg-gray-100 = font-semibold' : 'hover:bg-gray-100 hover:text-gray-900'}`}>
                      <Link to={item.path || ''}>
                        <Icon className={isActive ? 'text-blue-600' : ''} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
