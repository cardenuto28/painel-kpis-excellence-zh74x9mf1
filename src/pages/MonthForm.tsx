import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-form-hook' // Standard react-hook-form
import { useForm as useRHForm } from 'react-hook-form'
import { useData } from '@/stores/main'
import { KPI_CATALOG, CATEGORIES, calculatePoints } from '@/lib/kpi-rules'
import { MonthRecord, KPIKey, CategoryKey } from '@/types'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'

interface FormValues {
  mes: string
  ano: number
  ranking: number
  topDealerTotal: number
  items: Record<KPIKey, number> // stores raw values
}

export default function MonthForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { months, addMonth, updateMonth, role } = useData()

  useEffect(() => {
    if (role !== 'editor') {
      toast.error('Acesso negado')
      navigate('/')
    }
  }, [role, navigate])

  const existing = id ? months.find((m) => m.id === id) : null

  const defaultItems = {} as Record<KPIKey, number>
  KPI_CATALOG.forEach((k) => {
    defaultItems[k.key] = existing ? existing.items[k.key]?.raw : 0
  })

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useRHForm<FormValues>({
    defaultValues: {
      mes: existing?.mes || 'Janeiro',
      ano: existing?.ano || new Date().getFullYear(),
      ranking: existing?.ranking || 1,
      topDealerTotal: existing?.topDealerTotal || 100,
      items: defaultItems,
    },
  })

  const onSubmit = (data: FormValues) => {
    // Check duplicates
    if (!existing) {
      const dup = months.find((m) => m.mes === data.mes && m.ano === Number(data.ano))
      if (dup) {
        toast.error('Já existe um lançamento para este mês/ano.')
        return
      }
    }

    const newItems = {} as Record<KPIKey, any>
    Object.keys(data.items).forEach((key) => {
      const k = key as KPIKey
      const raw = Number(data.items[k])
      newItems[k] = {
        raw,
        points: calculatePoints(k, raw),
      }
    })

    const record: MonthRecord = {
      id: existing?.id || Math.random().toString(36).substr(2, 9),
      mes: data.mes,
      ano: Number(data.ano),
      ranking: Number(data.ranking),
      topDealerTotal: Number(data.topDealerTotal),
      items: newItems,
      criadoPor: existing?.criadoPor || 'editor_atual',
      atualizadoEm: new Date().toISOString(),
    }

    if (existing) {
      updateMonth(record)
      toast.success('Mês atualizado com sucesso!')
    } else {
      addMonth(record)
      toast.success('Lançamento salvo com sucesso!')
    }
    navigate('/historico')
  }

  const getKPIField = (kpi: any) => {
    return (
      <div
        key={kpi.key}
        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/10 rounded-lg border border-border/50 gap-4"
      >
        <div className="flex-1">
          <Label className="text-base font-medium">{kpi.name}</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Máx: {kpi.maxPoints} pts | Tipo: {kpi.type}
          </p>
        </div>
        <div className="w-full sm:w-48">
          {kpi.type === 'boolean' ? (
            <Controller
              name={`items.${kpi.key}`}
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Sim (1)</SelectItem>
                    <SelectItem value="0">Não (0)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <div className="relative">
              <Input
                type="number"
                step={kpi.type === 'percent' ? '0.01' : '1'}
                {...register(`items.${kpi.key}` as const)}
                className="pr-8"
              />
              {kpi.type === 'percent' && (
                <span className="absolute right-3 top-2 text-muted-foreground">%</span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">
          {existing ? 'Editar Lançamento' : 'Novo Lançamento'}
        </h1>
        <p className="text-muted-foreground mt-2">
          Insira os dados brutos de performance. O sistema calculará os pontos automaticamente
          conforme as regras da BMW.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Info Box */}
        <div className="bg-card border border-border p-6 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Mês</Label>
            <Controller
              name="mes"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Janeiro',
                      'Fevereiro',
                      'Março',
                      'Abril',
                      'Maio',
                      'Junho',
                      'Julho',
                      'Agosto',
                      'Setembro',
                      'Outubro',
                      'Novembro',
                      'Dezembro',
                    ].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Ano</Label>
            <Input type="number" {...register('ano')} />
          </div>
          <div className="space-y-2">
            <Label>Ranking (Posição)</Label>
            <Input type="number" min="1" {...register('ranking')} />
          </div>
          <div className="space-y-2">
            <Label>Pontos do Top Dealer</Label>
            <Input type="number" step="0.01" max="100" {...register('topDealerTotal')} />
          </div>
        </div>

        {/* KPIs Accordions */}
        <Accordion type="multiple" defaultValue={['vendas']} className="space-y-4">
          {Object.entries(CATEGORIES).map(([catKey, catInfo]) => {
            const kpis = KPI_CATALOG.filter((k) => k.category === catKey)
            return (
              <AccordionItem
                key={catKey}
                value={catKey}
                className="bg-card border border-border rounded-xl overflow-hidden px-2"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <div className="flex justify-between items-center w-full pr-4">
                    <span className="text-lg font-display font-semibold">{catInfo.name}</span>
                    <span className="text-sm font-normal text-muted-foreground bg-muted/30 px-3 py-1 rounded-full">
                      Máximo: {catInfo.max} pts
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-6 space-y-3">
                  {kpis.map(getKPIField)}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" className="px-8">
            Salvar Lançamento
          </Button>
        </div>
      </form>
    </div>
  )
}
