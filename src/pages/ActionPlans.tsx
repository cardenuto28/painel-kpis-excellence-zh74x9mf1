import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import useDataStore from '@/stores/use-data-store'
import { MONTH_NAMES } from '@/lib/kpi-definitions'
import { Target, Edit, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export default function ActionPlans() {
  const { months, actionPlans, saveActionPlan, deleteActionPlan, role, kpis } = useDataStore()

  const sortedMonths = useMemo(() => {
    return [...months].sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano
      return MONTH_NAMES.indexOf(b.mes) - MONTH_NAMES.indexOf(a.mes)
    })
  }, [months])

  const [selectedMonthId, setSelectedMonthId] = useState(sortedMonths[0]?.id || '')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedGapId, setSelectedGapId] = useState('')

  const currentMonth = sortedMonths.find((m) => m.id === selectedMonthId)

  const gaps = useMemo(() => {
    if (!currentMonth) return []
    return kpis
      .filter((kpi) => (currentMonth.points[kpi.id] || 0) < kpi.maxPoints)
      .map((kpi) => ({
        kpi,
        points: currentMonth.points[kpi.id] || 0,
        gap: kpi.maxPoints - (currentMonth.points[kpi.id] || 0),
        hasPlan: actionPlans.some((p) => p.monthId === currentMonth.id && p.kpiId === kpi.id),
      }))
      .sort((a, b) => b.gap - a.gap)
  }, [currentMonth, actionPlans, kpis])

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const { register, handleSubmit, reset, setValue, watch } = useForm()
  const statusWatch = watch('status')

  const onSubmit = async (data: any) => {
    try {
      await saveActionPlan({
        id: editingPlanId || undefined,
        monthId: selectedMonthId,
        kpiId: selectedGapId,
        description: data.description,
        responsible: data.responsible,
        dueDate: data.dueDate,
        status: data.status || 'Pendente',
      })
      setIsDialogOpen(false)
      setEditingPlanId(null)
      reset()
    } catch {
      toast.error('Erro ao salvar plano de ação.')
    }
  }

  const handleOpenDialog = (kpiId: string) => {
    setEditingPlanId(null)
    setSelectedGapId(kpiId)
    reset()
    setValue('status', 'Pendente')
    setIsDialogOpen(true)
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlanId(plan.id)
    setSelectedMonthId(plan.monthId)
    setSelectedGapId(plan.kpiId)
    setValue('description', plan.description)
    setValue('responsible', plan.responsible)
    setValue('dueDate', plan.dueDate)
    setValue('status', plan.status)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Planos de Ação</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie estratégias para recuperar pontos perdidos.
          </p>
        </div>

        {sortedMonths.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Analisar Gaps de:</span>
            <Select value={selectedMonthId} onValueChange={setSelectedMonthId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {sortedMonths.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.mes} {m.ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Target className="w-5 h-5 text-secondary" />
              Oportunidades ({currentMonth?.mes})
            </CardTitle>
            <CardDescription>KPIs com pontuação abaixo do máximo.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/50 max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0">
                <TableRow>
                  <TableHead>Indicador</TableHead>
                  <TableHead className="text-center">Pontos</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gaps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Nenhum gap encontrado ou selecione um mês.
                    </TableCell>
                  </TableRow>
                ) : (
                  gaps.map((g) => (
                    <TableRow key={g.kpi.id}>
                      <TableCell>
                        <div className="font-medium text-sm">{g.kpi.name}</div>
                        <div className="text-xs text-muted-foreground">{g.kpi.category}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-card text-destructive font-mono">
                          {g.points} / {g.kpi.maxPoints}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {g.hasPlan ? (
                          <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 font-normal">
                            Plano Criado
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs"
                            disabled={role !== 'Editor' && role !== 'Admin'}
                            onClick={() => handleOpenDialog(g.kpi.id)}
                          >
                            Criar Plano
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display">Planos Ativos</CardTitle>
            <CardDescription>Acompanhamento de todas as ações.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 border-t border-border/50 max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0">
                <TableRow>
                  <TableHead>KPI / Mês</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Nenhum plano cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  actionPlans.map((p) => {
                    const m = months.find((x) => x.id === p.monthId)
                    const k = kpis.find((x) => x.id === p.kpiId)

                    const dueDate = new Date(p.dueDate + 'T00:00:00')
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const isOverdue = p.status !== 'Concluído' && dueDate < today
                    const isUpcoming =
                      p.status !== 'Concluído' &&
                      !isOverdue &&
                      dueDate.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000

                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{k?.name || p.kpiId}</div>
                          <div className="text-xs text-muted-foreground">
                            {m?.mes} {m?.ano}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{p.responsible}</TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col gap-1 items-start">
                            <span>{dueDate.toLocaleDateString('pt-BR')}</span>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                                Atrasado
                              </Badge>
                            )}
                            {isUpcoming && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 px-1.5 border-orange-500 text-orange-500 bg-orange-500/10"
                              >
                                Próximo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={
                                p.status === 'Concluído'
                                  ? 'border-green-500 text-green-500'
                                  : p.status === 'Em Andamento'
                                    ? 'border-primary text-primary'
                                    : ''
                              }
                            >
                              {p.status}
                            </Badge>
                            {(role === 'Editor' || role === 'Admin') && (
                              <div className="flex gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditPlan(p)}
                                >
                                  <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    deleteActionPlan(p.id).catch(() =>
                                      toast.error('Erro ao excluir plano.'),
                                    )
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Novo Plano de Ação</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>O que será feito? (Estratégia)</Label>
              <Textarea
                {...register('description', { required: true })}
                placeholder="Descreva a ação detalhadamente..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Input {...register('responsible', { required: true })} placeholder="Nome" />
              </div>
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="date" {...register('dueDate', { required: true })} className="flex" />
              </div>
            </div>
            {editingPlanId && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={statusWatch || 'Pendente'}
                  onValueChange={(val) => setValue('status', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Plano</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
