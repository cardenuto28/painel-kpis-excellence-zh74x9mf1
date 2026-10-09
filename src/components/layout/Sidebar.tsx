import { useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  History as HistoryIcon,
  Target,
  ListChecks,
  Upload,
  Settings,
  Users,
} from 'lucide-react'
import useDataStore from '@/stores/use-data-store'
import { cn } from '@/lib/utils'
import logo from '@/assets/image-f74b6.png'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/history', label: 'Histórico', icon: HistoryIcon },
  { to: '/action-plans', label: 'Planos de Ação', icon: Target },
  { to: '/kpi-details', label: 'Detalhes de KPIs', icon: ListChecks },
  { to: '/import', label: 'Importar Dados', icon: Upload },
]

const adminItems: NavItem[] = [
  { to: '/admin', label: 'Administração', icon: Settings },
  { to: '/admin/users', label: 'Usuários', icon: Users },
]

export function Sidebar() {
  const { role } = useDataStore()
  const location = useLocation()
  const isAdmin = role === 'Admin'

  const renderItem = (item: NavItem) => {
    const isActive =
      item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
    return (
      <Link
        key={item.to}
        to={item.to}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        {item.label}
      </Link>
    )
  }

  return (
    <aside className="flex flex-col w-64 border-r border-border bg-card h-full">
      <div className="h-20 flex items-center justify-center border-b border-border px-4 flex-shrink-0">
        <img
          src={logo}
          alt="PG Prime"
          className="h-9 max-w-[85%] object-contain invert brightness-200"
        />
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(renderItem)}
        {isAdmin && (
          <>
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Administração
            </div>
            {adminItems.map(renderItem)}
          </>
        )}
      </nav>
    </aside>
  )
}
