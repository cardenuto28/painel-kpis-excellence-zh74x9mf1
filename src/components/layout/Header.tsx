import { useState } from 'react'
import { User, Menu, LogOut, KeyRound, Eye, EyeOff } from 'lucide-react'
import useDataStore from '@/stores/use-data-store'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { AlertsDropdown } from '@/components/dashboard/AlertsDropdown'
import { resetUserPassword } from '@/services/users'
import { toast } from 'sonner'

export function Header() {
  const { role } = useDataStore()
  const { user, signOut } = useAuth()

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('Usuário não identificado.')
      return
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setSubmitting(true)
    try {
      await resetUserPassword(user.id, newPassword)
      toast.success('Sua senha foi alterada com sucesso!')
      setIsProfileModalOpen(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao alterar a senha.')
    } finally {
      setSubmitting(false)
    }
  }

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
        <AlertsDropdown />
        <div className="flex items-center gap-3 bg-card px-4 py-1.5 rounded-full border border-border">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{role}</span>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 hover:bg-primary/20 hover:text-primary"
            onClick={() => {
              setNewPassword('')
              setConfirmPassword('')
              setShowPassword(false)
              setIsProfileModalOpen(true)
            }}
            title="Alterar minha senha"
          >
            <KeyRound className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 hover:bg-destructive/20 hover:text-destructive"
            onClick={() => signOut()}
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal de alteração da própria senha */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Alterar Minha Senha
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Logado como: </span>
              <strong className="text-foreground">{user?.name || user?.email}</strong>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">{user?.email}</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="my-new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="my-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="my-confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="my-confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a nova senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar Nova Senha'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}
