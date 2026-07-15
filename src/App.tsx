import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import History from './pages/History'
import ActionPlans from './pages/ActionPlans'
import EntryForm from './pages/EntryForm'
import KpiDetails from './pages/KpiDetails'
import Admin from './pages/Admin'
import Users from './pages/Users'
import Import from './pages/Import'
import Analytics from './pages/Analytics'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { DataProvider } from '@/stores/use-data-store'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <DataProvider>{children}</DataProvider>
}

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner theme="dark" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Index />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/action-plans" element={<ActionPlans />} />
            <Route path="/entry/:id?" element={<EntryForm />} />
            <Route path="/kpi-details" element={<KpiDetails />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/import" element={<Import />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
