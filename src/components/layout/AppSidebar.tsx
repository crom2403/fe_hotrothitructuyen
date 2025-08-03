import { BarChart3, BookOpen, Calendar, ClipboardList, Database, GraduationCap, Home, PenTool, Shield, ShieldUser, Trophy, Users, ChevronRight, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import Logo from '../../../public/images/svg/logo.svg';
import LogoMini from '../../../public/images/svg/logo-mini.svg';
import useAppStore from '@/stores/appStore';
import path from '@/utils/path';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { useState } from 'react';

interface SubMenuItem {
  id: string;
  label: string;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  items?: SubMenuItem[];
}

const AppSidebar = () => {
  const { openSidebar } = useAppStore();
  const location = useLocation();
  const { currentUser } = useAuthStore();
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  const getMenuItems = (): MenuItem[] => {
    switch (currentUser?.role_code as string) {
      case 'admin': {
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: Home, path: path.ADMIN.OVERVIEW },
          { id: 'users', label: 'Quản lý người dùng', icon: Users, path: path.ADMIN.USER },
          { id: 'subjects', label: 'Quản lý môn học', icon: BookOpen, path: path.ADMIN.SUBJECT },
          { id: 'assign-subject', label: 'Phân công giảng dạy', icon: User, path: path.ADMIN.ASSIGN_TEACHER },
          { id: 'semesters', label: 'Năm học & Học kỳ', icon: Calendar, path: path.ADMIN.YEAR_SEMESTER },
          { id: 'classes', label: 'Lớp học phần', icon: GraduationCap, path: path.ADMIN.STUDY_GROUP },
          { id: 'questions', label: 'Quản lý câu hỏi', icon: Database, path: path.ADMIN.QUESTION },
          { id: 'exams', label: 'Quản lý đề thi', icon: BarChart3, path: path.ADMIN.EXAM },
          { id: 'permission_role', label: 'Phân quyền vai trò', icon: Shield, path: path.ADMIN.PERMISSTION_ROLE },
          { id: 'permission_user', label: 'Phân quyền người dùng', icon: ShieldUser, path: path.ADMIN.PERMISSTION_USER },
        ];
      }
      case 'teacher': {
        const baseItems: MenuItem[] = [
          { id: 'dashboard', label: 'Tổng quan', icon: Home, path: path.TEACHER.OVERVIEW },
          { id: 'questions', label: 'Quản lý câu hỏi', icon: Database, path: path.TEACHER.QUESTION_BANK },
          { id: 'create-exam', label: 'Tạo đề thi', icon: PenTool, path: path.TEACHER.EXAM },
          { id: 'classes', label: 'Lớp học phần', icon: GraduationCap, path: path.TEACHER.STUDY_GROUP },
          { id: 'exam-list', label: 'Quản lý đề thi', icon: ClipboardList, path: path.TEACHER.EXAM_MANAGEMENT },
          { id: 'results', label: 'Thống kê & kết quả', icon: Trophy, path: path.TEACHER.EXAM_RESULT },
        ];

        const approvalItems: SubMenuItem[] = [];
        if (currentUser?.permissions?.includes('question.approve')) {
          approvalItems.push({ id: 'approve-questions', label: 'Duyệt câu hỏi', path: path.TEACHER.APPROVE_QUESTION });
        }
        // if (currentUser?.permissions?.includes('exam.approve')) {
        //   approvalItems.push({ id: 'approve-exams', label: 'Duyệt đề thi', path: path.TEACHER.APPROVE_EXAM });
        // }
        if (approvalItems.length > 0) {
          baseItems.splice(6, 0, { id: 'approval', label: 'Kiểm duyệt', icon: Shield, items: approvalItems });
        }

        return baseItems;
      }
      case 'student': {
        return [
          { id: 'dashboard', label: 'Tổng quan', icon: Home, path: path.STUDENT.OVERVIEW },
          { id: 'classes', label: 'Lớp học phần', icon: GraduationCap, path: path.STUDENT.STUDY_GROUP },
          { id: 'exam-list', label: 'Danh sách bài thi', icon: ClipboardList, path: path.STUDENT.EXAM_LIST },
          { id: 'exam-results', label: 'Kết quả', icon: Trophy, path: path.STUDENT.EXAM_RESULTS },
        ];
      }
      default: {
        return [];
      }
    }
  };

  const menuItems = getMenuItems();

  const isActive = (itemPath?: string) => (itemPath ? location.pathname === itemPath : false);
  const isSubItemActive = (items?: SubMenuItem[]) => items?.some((item) => isActive(item.path)) || false;

  const handleApprovalClick = () => {
    setIsApprovalOpen((prev) => !prev);
  };

  return (
    <Sidebar collapsible="icon" className="max-w-[255px] bg-white border-r border-gray-200">
      <SidebarHeader className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3 relative">
          {openSidebar ? (
            <img src={Logo} alt="Logo" className="size-8 transition-all duration-500" />
          ) : (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-7">
              <img src={LogoMini} alt="Logo" className="size-7 transition-all duration-500" />
            </div>
          )}
          <div className={openSidebar ? 'grid flex-1 text-left opacity-100' : 'grid flex-1 text-left opacity-0'}>
            <span className="truncate font-semibold text-gray-900 transition-all duration-500">Exam System</span>
            <span className="truncate text-xs text-gray-500 transition-all duration-500">Hệ thống thi trắc nghiệm</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-white py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isParentActive = isActive(item.path) || isSubItemActive(item.items);

                if (!item.items) {
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        className={`rounded-lg transition-all duration-200 ${isParentActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 hover:text-gray-900'}`}
                      >
                        <Link to={item.path || ''} className="flex items-center gap-3 px-3 py-2">
                          <Icon className={`w-5 h-5 ${isParentActive ? 'text-blue-600' : 'text-gray-500'}`} />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={handleApprovalClick}
                      className={`rounded-lg transition-all duration-200 ${isParentActive ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 hover:text-gray-900'}`}
                    >
                      <div className="flex items-center justify-between w-full ">
                        <div className={`flex items-center gap-3 ${openSidebar && 'px-0.5' }`}>
                          <Icon className={`w-5 h-5 ${isParentActive ? 'text-blue-600' : 'text-gray-500'} ${!openSidebar ? 'w-7 h-7' : ''}`} />
                          <span>{item.label}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isApprovalOpen || isParentActive ? 'rotate-90 text-blue-600' : 'text-gray-400'}`} />
                      </div>
                    </SidebarMenuButton>
                    {(isApprovalOpen || isParentActive) && item.items && (
                      <SidebarMenu className="mt-1">
                        {item.items.map((subItem) => (
                          <SidebarMenuItem key={subItem.id}>
                            <SidebarMenuButton
                              asChild
                              className={`pl-11 rounded-lg transition-all duration-200 ${isActive(subItem.path) ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                              <Link to={subItem.path} className="block py-2 px-3">
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    )}
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