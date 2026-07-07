import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Index from './pages/Index'
import History from './pages/History'
import ActionPlans from './pages/ActionPlans'
import EntryForm from './pages/EntryForm'
import KpiDetails from './pages/KpiDetails'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import useDataStore from './stores/use-data-store'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { role } = useDataStore()
  if (!role) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App = () => (
  <BrowserRouter>
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
          <Route path="/history" element={<History />} />
          <Route path="/action-plans" element={<ActionPlans />} />
          <Route path="/entry/:id?" element={<EntryForm />} />
          <Route path="/kpi-details" element={<KpiDetails />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
