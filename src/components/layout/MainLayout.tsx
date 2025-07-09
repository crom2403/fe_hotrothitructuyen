import MainProvider from '../provider/MainProvider'
import AppSidebar from './AppSidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <MainProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-50 px-12 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </MainProvider>
  )
}

export default MainLayout