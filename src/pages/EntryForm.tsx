import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import useDataStore from '@/stores/use-data-store'
import { KPI_CATEGORIES, MONTH_NAMES } from '@/lib/kpi-definitions'
import { Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function EntryForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { months, saveMonth, role, kpis } = useDataStore()

  useEffect(() => {
    if (role !== 'Editor' && role !== 'Admin') {
      navigate('/')
      toast.error('Acesso negado. Apenas Editores e Admins podem lançar resultados.')
    }
  }, [role, navigate])

  const formSchema = useMemo(() => {
    const rawValuesSchema = z.object(
      kpis.reduce((acc, kpi) => {
        if (kpi.type === 'boolean') {
          acc[kpi.id] = z.boolean().default(false)
        } else if (kpi.type === 'treinamentos') {
          acc[kpi.id] = z.object({
            vendas: z.coerce.number().min(0).default(0),
            pos: z.coerce.number().min(0).default(0),
            tecnico: z.coerce.number().min(0).default(0),
          })
        } else if (kpi.type === 'propostaComercial') {
          acc[kpi.id] = z.object({
            alcancado: z.coerce.number().min(0).default(0),
            meta: z.coerce.number().min(0).default(0),
          })
        } else if (kpi.type === 'voc') {
          acc[kpi.id] = z.object({
            nps: z.coerce.number().min(0).max(200).default(0),
            failedSubIndicators: z.coerce.number().min(0).max(5).default(0),
          })
        } else {
          acc[kpi.id] = z.coerce.number().min(0).max(1000).default(0)
        }
        return acc
      }, {} as any),
    )

    return z.object({
      mes: z.string().min(1, 'Obrigatório'),
      ano: z.coerce.number().min(2020).max(2050),
      ranking: z.coerce.number().min(1),
      topDealerTotal: z.coerce.number().min(0).max(100),
      rawValues: rawValuesSchema,
    })
  }, [kpis])

  type FormValues = z.infer<typeof formSchema>

  const existingData = id ? months.find((m) => m.id === id) : null

  const defaultRawValues = useMemo(() => {
    return kpis.reduce((acc, kpi) => {
      const existing = existingData?.rawValues?.[kpi.id]
      if (kpi.type === 'boolean') {
        acc[kpi.id] = existing ?? false
      } else if (kpi.type === 'treinamentos') {
        acc[kpi.id] = existing ?? { vendas: 0, pos: 0, tecnico: 0 }
      } else if (kpi.type === 'propostaComercial') {
        acc[kpi.id] = existing ?? { alcancado: 0, meta: 0 }
      } else if (kpi.type === 'voc') {
        acc[kpi.id] = existing ?? { nps: 0, failedSubIndicators: 0 }
      } else {
        acc[kpi.id] = existing ?? 0
      }
      return acc
    }, {} as any)
  }, [kpis, existingData])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingData
      ? { ...existingData, rawValues: defaultRawValues }
      : {
          mes: '',
          ano: new Date().getFullYear(),
          ranking: 1,
          topDealerTotal: 100,
          rawValues: defaultRawValues,
        },
  })

  const onSubmit = (data: FormValues) => {
    if (!id && months.some((m) => m.mes === data.mes && m.ano === data.ano)) {
      toast.error(`Já existe um registro para ${data.mes}/${data.ano}`)
      return
    }
    saveMonth({ ...data, id })
    toast.success('Lançamento salvo com sucesso!')
    navigate('/history')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-display font-bold">
            {id ? 'Editar Lançamento' : 'Novo Lançamento Mensal'}
          </h2>
          <p className="text-muted-foreground text-sm">
            Insira os dados brutos de performance. O sistema calculará os pontos automaticamente.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="mes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mês</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MONTH_NAMES.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ano"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ranking"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição Ranking</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topDealerTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pontos Top Dealer</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Accordion
            type="multiple"
            defaultValue={KPI_CATEGORIES.map((c) => c)}
            className="space-y-4"
          >
            {KPI_CATEGORIES.map((category) => {
              const categoryKpis = kpis.filter((k) => k.category === category)
              if (categoryKpis.length === 0) return null

              return (
                <AccordionItem
                  key={category}
                  value={category}
                  className="border bg-card rounded-lg px-6 overflow-hidden"
                >
                  <AccordionTrigger className="hover:no-underline font-display text-lg py-6">
                    {category}
                    <span className="ml-auto mr-4 text-sm text-muted-foreground font-sans font-normal">
                      Máx: {categoryKpis.reduce((sum, k) => sum + k.maxPoints, 0)} pts
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-6">
                      {categoryKpis.map((kpi) => (
                        <FormField
                          key={kpi.id}
                          control={form.control}
                          name={`rawValues.${kpi.id}`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0 p-4 border rounded-md bg-background/50">
                              <div className="space-y-0.5 sm:max-w-[200px]">
                                <FormLabel className="text-sm font-medium leading-tight block">
                                  {kpi.name}
                                </FormLabel>
                                <span className="text-xs text-muted-foreground block">
                                  Máx: {kpi.maxPoints} pts
                                </span>
                              </div>
                              <FormControl>
                                {kpi.type === 'boolean' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase">
                                      {field.value ? 'Sim' : 'Não'}
                                    </span>
                                    <Switch
                                      checked={field.value as boolean}
                                      onCheckedChange={field.onChange}
                                    />
                                  </div>
                                ) : kpi.type === 'treinamentos' ? (
                                  <div className="flex gap-3 w-full sm:w-auto">
                                    <div className="space-y-1">
                                      <FormLabel className="text-[10px] uppercase text-muted-foreground">
                                        Vendas
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        className="w-full sm:w-16 h-8 text-center px-1"
                                        value={(field.value as any)?.vendas ?? ''}
                                        onChange={(e) =>
                                          field.onChange({
                                            ...(field.value as any),
                                            vendas: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <FormLabel className="text-[10px] uppercase text-muted-foreground">
                                        Pós
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        className="w-full sm:w-16 h-8 text-center px-1"
                                        value={(field.value as any)?.pos ?? ''}
                                        onChange={(e) =>
                                          field.onChange({
                                            ...(field.value as any),
                                            pos: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <FormLabel className="text-[10px] uppercase text-muted-foreground">
                                        Técnico
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        className="w-full sm:w-16 h-8 text-center px-1"
                                        value={(field.value as any)?.tecnico ?? ''}
                                        onChange={(e) =>
                                          field.onChange({
                                            ...(field.value as any),
                                            tecnico: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                ) : kpi.type === 'voc' ? (
                                  <div className="flex gap-3 w-full sm:w-auto">
                                    <div className="space-y-1">
                                      <FormLabel className="text-[10px] uppercase text-muted-foreground">
                                        NPS
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        step="0.1"
                                        className="w-full sm:w-20 h-8 px-2"
                                        value={(field.value as any)?.nps ?? ''}
                                        onChange={(e) =>
                                          field.onChange({
                                            ...(field.value as any),
                                            nps: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <FormLabel className="text-[10px] uppercase text-muted-foreground">
                                        Falhas (0-5)
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        min="0"
                                        max="5"
                                        className="w-full sm:w-20 h-8 px-2"
                                        value={(field.value as any)?.failedSubIndicators ?? ''}
                                        onChange={(e) =>
                                          field.onChange({
                                            ...(field.value as any),
                                            failedSubIndicators: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                ) : kpi.type === 'propostaComercial' ? (
                                  <div className="flex gap-3 w-full sm:w-auto">
                                    <div className="space-y-1">
                                      <FormLabel className="text-[10px] uppercase text-muted-foreground">
                                        Alcançado
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        className="w-full sm:w-24 h-8 px-2"
                                        value={(field.value as any)?.alcancado ?? ''}
                                        onChange={(e) =>
                                          field.onChange({
                                            ...(field.value as any),
                                            alcancado: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <FormLabel className="text-[10px] uppercase text-muted-foreground">
                                        Meta Trimestre
                                      </FormLabel>
                                      <Input
                                        type="number"
                                        className="w-full sm:w-24 h-8 px-2"
                                        value={(field.value as any)?.meta ?? ''}
                                        onChange={(e) =>
                                          field.onChange({
                                            ...(field.value as any),
                                            meta: Number(e.target.value),
                                          })
                                        }
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="relative w-full sm:w-28">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="pr-8 text-right font-mono"
                                      value={field.value as number}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                    {kpi.type === 'percentage' && (
                                      <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                                        %
                                      </span>
                                    )}
                                  </div>
                                )}
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" className="gap-2 w-full md:w-auto">
              <Save className="w-5 h-5" /> Salvar Lançamento
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
