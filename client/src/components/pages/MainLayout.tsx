import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { Routes, Route } from 'react-router-dom'
import Dashboard from '@/components/pages/Dashboard'
import Navbar from '@/components/ui/nav-bar'
import { AppSidebar } from '@/components/ui/app-sidebar'
import SandboxEditor from '@/components/pages/Sandbox'
const MainLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
      <main className="flex flex-1 flex-col h-full overflow-hidden">
        <Navbar />
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sandbox" element={<SandboxEditor />} />
        </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default MainLayout