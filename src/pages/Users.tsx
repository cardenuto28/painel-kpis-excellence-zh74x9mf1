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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import useDataStore from '@/stores/use-data-store'
import { getUsers, createUser, updateUserRole } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus, Users as UsersIcon, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

export default function Users() {
  const { role } = useDataStore()
  const [users, setUsers] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, reset } = useForm()

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
      await createUser(data.email, data.password, data.name || '', 'Visualizador')
      toast.success('Usuário criado com sucesso.')
      setIsDialogOpen(false)
      reset()
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
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
              <Label>Senha Temporária</Label>
              <Input
                type="password"
                {...register('password', { required: true, minLength: 8 })}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
              O usuário será criado com role{' '}
              <Badge variant="outline" className="ml-1">
                Visualizador
              </Badge>{' '}
              por padrão.
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
    </div>
  )
}
