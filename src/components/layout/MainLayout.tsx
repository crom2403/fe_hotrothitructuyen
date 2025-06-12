import MainProvider from '../provider/MainProvider'
import AppSidebar from './AppSidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <MainProvider>
      <div className="w-full">
        <div className="flex h-full">
          <div>
            <AppSidebar />
          </div>
          <div className="flex-1 bg-gray-50">
            <div className="w-full h-16 bg-white">
              <Header />
            </div>
            <div className="w-full py-8 px-12">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </MainProvider>
  )
}

export default MainLayout