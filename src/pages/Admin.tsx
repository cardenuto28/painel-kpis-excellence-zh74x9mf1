import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import useDataStore from '@/stores/use-data-store'
import { KPI_CATEGORIES, KpiDef } from '@/lib/kpi-definitions'
import { Plus, Edit, Trash2 } from 'lucide-react'

export default function Admin() {
  const { kpis, saveKpi, deleteKpi, role } = useDataStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { register, control, handleSubmit, reset, watch, setValue } = useForm<KpiDef>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tiers',
  })

  const typeWatch = watch('type')

  if (role !== 'Admin') {
    return <div className="p-8 text-center text-muted-foreground">Acesso Negado</div>
  }

  const handleOpenNew = () => {
    setEditingId(null)
    reset({
      id: crypto.randomUUID(),
      name: '',
      category: 'Vendas',
      maxPoints: 10,
      type: 'percentage',
      tiers: [],
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (kpi: KpiDef) => {
    setEditingId(kpi.id)
    reset({
      ...kpi,
      tiers: kpi.tiers || [],
    })
    setIsDialogOpen(true)
  }

  const onSubmit = (data: KpiDef) => {
    if (!data.id) data.id = crypto.randomUUID()
    if (
      data.type === 'boolean' ||
      data.type === 'treinamentos' ||
      data.type === 'propostaComercial'
    ) {
      data.tiers = []
    }
    // ensure numbers
    data.maxPoints = Number(data.maxPoints)
    data.tiers?.forEach((t) => {
      t.value = Number(t.value)
      t.points = Number(t.points)
    })
    saveKpi(data)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-display font-bold">Administração de KPIs</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie a régua de pontuação e cadastro de indicadores.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="gap-2">
          <Plus className="w-4 h-4" /> Novo KPI
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Máx Pts</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kpis.map((kpi) => (
                <TableRow key={kpi.id}>
                  <TableCell className="font-medium">{kpi.name}</TableCell>
                  <TableCell>{kpi.category}</TableCell>
                  <TableCell className="uppercase text-xs">{kpi.type}</TableCell>
                  <TableCell className="text-center font-mono">{kpi.maxPoints}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(kpi)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteKpi(kpi.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar KPI' : 'Novo KPI'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nome do Indicador</Label>
                <Input {...register('name', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label>ID Interno</Label>
                <Input
                  {...register('id', { required: true })}
                  disabled={!!editingId}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={watch('category')}
                  onValueChange={(v) => setValue('category', v as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KPI_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Dado</Label>
                <Select value={watch('type')} onValueChange={(v) => setValue('type', v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                    <SelectItem value="number">Número Absoluto</SelectItem>
                    <SelectItem value="boolean">Sim/Não</SelectItem>
                    <SelectItem value="treinamentos">Específico: Treinamentos</SelectItem>
                    <SelectItem value="propostaComercial">Específico: Proposta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Pontuação Máxima</Label>
                <Input type="number" {...register('maxPoints', { required: true })} />
              </div>
            </div>

            {(typeWatch === 'percentage' || typeWatch === 'number') && (
              <div className="space-y-4 border-t pt-4 border-border/50">
                <div className="flex justify-between items-center">
                  <Label>Régua de Pontos (Tiers)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ id: crypto.randomUUID(), operator: '>=', value: 0, points: 0 })
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Regra
                  </Button>
                </div>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <Select
                        value={watch(`tiers.${index}.operator`)}
                        onValueChange={(v) => setValue(`tiers.${index}.operator`, v as any)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<">{'<'}</SelectItem>
                          <SelectItem value="<=">{'<='}</SelectItem>
                          <SelectItem value="==">{'=='}</SelectItem>
                          <SelectItem value=">=">{'>='}</SelectItem>
                          <SelectItem value=">">{'>'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        step="0.1"
                        {...register(`tiers.${index}.value`, { required: true })}
                        placeholder="Valor"
                        className="w-[120px]"
                      />
                      <span className="text-muted-foreground text-sm">➜</span>
                      <Input
                        type="number"
                        step="0.1"
                        {...register(`tiers.${index}.points`, { required: true })}
                        placeholder="Pontos"
                        className="w-[100px]"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma regra definida. A pontuação será 0.
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  As regras são avaliadas em ordem. A primeira que for verdadeira será aplicada.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar KPI</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
