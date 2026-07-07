import { Outlet } from 'react-router-dom'
import { Sidebar } from './layout/Sidebar'
import { Header } from './layout/Header'
import { PersistenceNotice } from './PersistenceNotice'

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <PersistenceNotice />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
