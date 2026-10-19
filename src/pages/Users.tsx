import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import useDataStore from '@/stores/use-data-store'
import {
  getUsers,
  createUser,
  updateUserRole,
  deleteUser,
  resetUserPassword,
} from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Plus,
  Users as UsersIcon,
  Mail,
  Trash2,
  Info,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

const DEFAULT_PASSWORD = 'pgprime123'

export default function Users() {
  const { role } = useDataStore()
  const [users, setUsers] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const [selectedRole, setSelectedRole] = useState('Visualizador')
  const { register, handleSubmit, reset } = useForm()

  // State for password change modal
  const [passwordTarget, setPasswordTarget] = useState<{
    id: string
    label: string
    email: string
  } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await getUsers())
    } catch {
      toast.error('Erro ao carregar usuários.')
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useRealtime('users', () => {
    loadUsers()
  })

  if (role !== 'Admin') {
    return <div className="p-8 text-center text-muted-foreground">Acesso Negado</div>
  }

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    try {
      await createUser(data.email, DEFAULT_PASSWORD, data.name || '', selectedRole)
      toast.success('Usuário criado com sucesso.')
      setIsDialogOpen(false)
      reset()
      setSelectedRole('Visualizador')
      await loadUsers()
    } catch {
      toast.error('Erro ao criar usuário. Verifique se o email já não está cadastrado.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      toast.success('Role atualizada.')
    } catch {
      toast.error('Erro ao atualizar role.')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id)
      toast.success('Usuário excluído com sucesso.')
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
    } catch {
      toast.error('Erro ao excluir usuário.')
    }
    setDeleteTarget(null)
  }

  const handleOpenPasswordDialog = (u: any) => {
    setPasswordTarget({
      id: u.id,
      label: u.name || u.email,
      email: u.email,
    })
    setNewPassword('')
    setConfirmPassword('')
    setShowPassword(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordTarget) return

    if (!newPassword || newPassword.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não conferem.')
      return
    }

    setPasswordSubmitting(true)
    try {
      await resetUserPassword(passwordTarget.id, newPassword)
      toast.success(`Senha de ${passwordTarget.label} alterada com sucesso!`)
      setPasswordTarget(null)
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao alterar senha.')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleApplyDefaultPassword = () => {
    setNewPassword(DEFAULT_PASSWORD)
    setConfirmPassword(DEFAULT_PASSWORD)
    toast.info(`Preenchido com a senha padrão (${DEFAULT_PASSWORD})`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <UsersIcon className="w-6 h-6" /> Gerenciamento de Usuários
          </h2>
          <p className="text-muted-foreground mt-1">Gerencie acessos e permissões da equipe.</p>
        </div>
        <Button
          onClick={() => {
            reset()
            setSelectedRole('Visualizador')
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Usuário
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[180px]">Role</TableHead>
                <TableHead className="w-[120px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> {u.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Editor">Editor</SelectItem>
                          <SelectItem value="Visualizador">Visualizador</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/20 hover:text-primary"
                          title="Alterar senha"
                          onClick={() => handleOpenPasswordDialog(u)}
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                          title="Excluir usuário"
                          onClick={() =>
                            setDeleteTarget({
                              id: u.id,
                              label: u.name || u.email,
                            })
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome (opcional)</Label>
              <Input {...register('name')} placeholder="Nome do usuário" />
            </div>
            <div className="space-y-2">
              <Label>Email Corporativo</Label>
              <Input
                type="email"
                {...register('email', { required: true })}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Editor">Editor</SelectItem>
                  <SelectItem value="Visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                A senha padrão será{' '}
                <Badge variant="outline" className="ml-1 font-mono">
                  {DEFAULT_PASSWORD}
                </Badge>
                . O usuário deverá alterá-la no primeiro acesso.
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Alterar Senha de Usuário */}
      <Dialog open={!!passwordTarget} onOpenChange={(open) => !open && setPasswordTarget(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Alterar Senha
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2">
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <span className="text-muted-foreground">Usuário: </span>
              <strong className="text-foreground">{passwordTarget?.label}</strong>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                {passwordTarget?.email}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
                onClick={handleApplyDefaultPassword}
              >
                <RotateCcw className="w-3 h-3" /> Usar padrão ({DEFAULT_PASSWORD})
              </Button>
            </div>

            <div className="relative">
              <Input
                id="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>O usuário poderá efetuar login imediatamente com esta nova senha.</div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setPasswordTarget(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={passwordSubmitting}>
                {passwordSubmitting ? 'Salvando...' : 'Salvar Senha'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário {deleteTarget?.label}? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
