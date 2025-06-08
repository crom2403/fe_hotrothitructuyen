import { BarChart3, BookOpen, Brain, Calendar, CalendarDays, ClipboardList, Database, GraduationCap, Home, Monitor, PenTool, Settings, Trophy, Users } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import Logo from '../../../public/images/svg/logo.svg'
import LogoMini from '../../../public/images/svg/logo-mini.svg'

import useAppStore from '@/stores/appStore';

const AppSidebar = () => {
  const { openSidebar } = useAppStore()

  const getMenuItems = () => {
    switch ("teacher" as String) {
      case "admin":
        return [
          { id: "dashboard", label: "Tổng quan", icon: Home },
          { id: "users", label: "Quản lý người dùng", icon: Users },
          { id: "subjects", label: "Quản lý môn học", icon: BookOpen },
          { id: "semesters", label: "Năm học & Học kỳ", icon: Calendar },
          { id: "classes", label: "Lớp học phần", icon: GraduationCap },
          { id: "settings", label: "Cài đặt hệ thống", icon: Settings },
        ]
      case "teacher":
        return [
          { id: "dashboard", label: "Tổng quan", icon: Home },
          { id: "questions", label: "Ngân hàng câu hỏi", icon: Database },
          { id: "create-exam", label: "Tạo đề thi", icon: PenTool },
          { id: "exams", label: "Quản lý đề thi", icon: ClipboardList },
          { id: "exam-rooms", label: "Phòng thi", icon: Monitor },
          { id: "results", label: "Kết quả & Báo cáo", icon: BarChart3 },
          { id: "ai-exam", label: "Tạo đề thi AI", icon: Brain },
        ]
      case "student":
        return [
          { id: "dashboard", label: "Tổng quan", icon: Home },
          { id: "exam-schedule", label: "Lịch thi", icon: CalendarDays },
          { id: "exams", label: "Danh sách bài thi", icon: ClipboardList },
          { id: "results", label: "Kết quả thi", icon: Trophy },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <Sidebar collapsible="icon" className='w-[255px]'>
      <SidebarHeader>
        <div className='flex items-center gap-2 py-1'>
          {
            openSidebar ? (
              <img src={Logo} alt="Logo" className='w-15 h-15 transition-all duration-500' />
            ) : (
              <img src={LogoMini} alt="Logo" className='w-10 h-10 transition-all duration-500' />
            )
          }
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Exam System</span>
            <span className="truncate text-xs text-muted-foreground">Hệ thống thi trắc nghiệm</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton>
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar