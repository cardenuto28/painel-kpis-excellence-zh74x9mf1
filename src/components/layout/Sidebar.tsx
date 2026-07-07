import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, History, Target, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import useDataStore from '@/stores/use-data-store'
import logoUrl from '@/assets/bmw-euro-motors-jundiai-branco-04826.pdf'

export function Sidebar() {
  const { pathname } = useLocation()
  const { role } = useDataStore()

  const links = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/history', label: 'Histórico', icon: History },
    { href: '/action-plans', label: 'Planos de Ação', icon: Target },
  ]

  return (
    <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col z-20 shadow-elevation">
      <div className="h-28 flex flex-col justify-center items-center px-6 border-b border-border/50 bg-black pt-4">
        <embed
          src={`${logoUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          type="application/pdf"
          className="w-full h-12 pointer-events-none"
        />
        <div className="text-[10px] text-white uppercase tracking-[0.2em] mt-3 font-display font-medium">
          Excellence Club
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            to={l.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              pathname === l.href
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-secondary/10 hover:text-foreground',
            )}
          >
            <l.icon className="w-5 h-5" />
            <span>{l.label}</span>
          </Link>
        ))}

        {role === 'Editor' && (
          <div className="pt-6 mt-6 border-t border-border/50">
            <Link
              to="/entry"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                pathname.startsWith('/entry')
                  ? 'bg-primary text-primary-foreground font-medium shadow-md'
                  : 'text-primary hover:bg-primary/10 font-medium',
              )}
            >
              <PlusCircle className="w-5 h-5" />
              <span>Novo Lançamento</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  )
}
