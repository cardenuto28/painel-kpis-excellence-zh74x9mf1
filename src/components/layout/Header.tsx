import { User, Menu, LogOut } from 'lucide-react'
import useDataStore from '@/stores/use-data-store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'

export function Header() {
  const { role, setRole } = useDataStore()

  return (
    <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-card border-r-border">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-display font-semibold hidden sm:block">
          Painel de Performance
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-card px-4 py-1.5 rounded-full border border-border">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{role}</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 ml-2 hover:bg-destructive/20 hover:text-destructive"
            onClick={() => setRole(null)}
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
