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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import useDataStore from '@/stores/use-data-store'
import { KPI_DEFINITIONS, MONTH_NAMES } from '@/lib/kpi-definitions'
import { Target, Plus, Edit, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'

export default function ActionPlans() {
  const { months, actionPlans, saveActionPlan, deleteActionPlan, role } = useDataStore()

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
    return KPI_DEFINITIONS.filter((kpi) => currentMonth.points[kpi.id] < kpi.maxPoints)
      .map((kpi) => ({
        kpi,
        points: currentMonth.points[kpi.id],
        gap: kpi.maxPoints - currentMonth.points[kpi.id],
        hasPlan: actionPlans.some((p) => p.monthId === currentMonth.id && p.kpiId === kpi.id),
      }))
      .sort((a, b) => b.gap - a.gap)
  }, [currentMonth, actionPlans])

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const { register, handleSubmit, reset, setValue } = useForm()

  const onSubmit = (data: any) => {
    saveActionPlan({
      id: editingPlanId || undefined,
      monthId: selectedMonthId,
      kpiId: selectedGapId,
      description: data.description,
      responsible: data.responsible,
      dueDate: data.dueDate,
      status: editingPlanId
        ? actionPlans.find((p) => p.id === editingPlanId)?.status || 'Pendente'
        : 'Pendente',
    })
    setIsDialogOpen(false)
    setEditingPlanId(null)
    reset()
  }

  const handleOpenDialog = (kpiId: string) => {
    setEditingPlanId(null)
    setSelectedGapId(kpiId)
    reset()
    setIsDialogOpen(true)
  }

  const handleEditPlan = (plan: any) => {
    setEditingPlanId(plan.id)
    setSelectedMonthId(plan.monthId)
    setSelectedGapId(plan.kpiId)
    setValue('description', plan.description)
    setValue('responsible', plan.responsible)
    setValue('dueDate', plan.dueDate)
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
        {/* Gaps Table */}
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
                            disabled={role !== 'Editor'}
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

        {/* Existing Plans */}
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
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Nenhum plano cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  actionPlans.map((p) => {
                    const m = months.find((x) => x.id === p.monthId)
                    const k = KPI_DEFINITIONS.find((x) => x.id === p.kpiId)
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{k?.name || p.kpiId}</div>
                          <div className="text-xs text-muted-foreground">
                            {m?.mes} {m?.ano}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{p.responsible}</TableCell>
                        <TableCell className="flex items-center justify-between">
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
                          {role === 'Editor' && (
                            <div className="flex gap-1 ml-4">
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
                                onClick={() => deleteActionPlan(p.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            </div>
                          )}
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
