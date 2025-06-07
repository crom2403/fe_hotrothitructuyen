import React from 'react'
import { SidebarProvider } from '../ui/sidebar';
import useAppStore from '@/stores/appStore';

interface MainProviderProps {
  children: React.ReactNode;
}

const MainProvider = ({ children }: MainProviderProps) => {
  const { openSidebar, setOpenSidebar } = useAppStore()

  return (
    <SidebarProvider open={openSidebar} onOpenChange={setOpenSidebar}>
      {children}
    </SidebarProvider>
  )
}

export default MainProvider