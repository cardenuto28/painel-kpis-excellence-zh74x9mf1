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
import { buildPointsSchema, getDefaultPoints } from '@/lib/entry-form-schema'
import { Save, ArrowLeft, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

  const pointsSchema = useMemo(() => buildPointsSchema(kpis), [kpis])
  const formSchema = useMemo(
    () =>
      z
        .object({
          mes: z.string().min(1, 'Obrigatório'),
          ano: z.coerce.number().min(2020).max(2050),
          ranking: z.coerce.number().min(1),
          topDealerTotal: z.coerce.number().min(0).max(100),
          totalScore: z.coerce.number().min(0).max(100),
          points: pointsSchema,
          topDealerPoints: pointsSchema,
        })
        .refine(
          (data) => {
            const sum = Object.values(data.points).reduce(
              (a: number, b: any) => a + (Number(b) || 0),
              0,
            )
            return sum === data.totalScore
          },
          {
            message: 'A soma dos pontos dos KPIs deve ser igual ao total informado.',
            path: ['totalScore'],
          },
        ),
    [pointsSchema],
  )

  type FormValues = z.infer<typeof formSchema>

  const existingData = id ? months.find((m) => m.id === id) : null

  const defaultPoints = useMemo(
    () => getDefaultPoints(kpis, existingData?.points),
    [kpis, existingData],
  )
  const defaultTopDealerPoints = useMemo(
    () => getDefaultPoints(kpis, existingData?.topDealerRawValues),
    [kpis, existingData],
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: existingData
      ? {
          ...existingData,
          points: defaultPoints,
          topDealerPoints: defaultTopDealerPoints,
        }
      : {
          mes: '',
          ano: new Date().getFullYear(),
          ranking: 1,
          topDealerTotal: 100,
          totalScore: 0,
          points: defaultPoints,
          topDealerPoints: defaultTopDealerPoints,
        },
  })

  const watchedPoints = form.watch('points')
  const watchedTotalScore = form.watch('totalScore')
  const computedSum = useMemo(
    () => Object.values(watchedPoints || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0),
    [watchedPoints],
  )
  const sumMismatch = computedSum !== watchedTotalScore

  const onSubmit = async (data: FormValues) => {
    if (!id && months.some((m) => m.mes === data.mes && m.ano === data.ano)) {
      toast.error(`Já existe um registro para ${data.mes}/${data.ano}`)
      return
    }
    try {
      await saveMonth({ ...data, id })
      toast.success('Lançamento salvo com sucesso!')
      navigate('/history')
    } catch {
      toast.error('Erro ao salvar lançamento.')
    }
  }

  const renderKpiFields = (prefix: 'points' | 'topDealerPoints') =>
    KPI_CATEGORIES.map((category) => {
      const categoryKpis = kpis.filter((k) => k.category === category)
      if (categoryKpis.length === 0) return null
      return (
        <AccordionItem
          key={`${prefix}-${category}`}
          value={`${prefix}-${category}`}
          className="border bg-card rounded-lg px-6 overflow-hidden"
        >
          <AccordionTrigger className="hover:no-underline font-display text-lg py-6">
            {prefix === 'topDealerPoints' ? 'Top Dealer · ' : ''}
            {category}
            <span className="ml-auto mr-4 text-sm text-muted-foreground font-sans font-normal">
              Máx: {categoryKpis.reduce((sum, k) => sum + k.maxPoints, 0)} pts
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-4">
              {categoryKpis.map((kpi) => (
                <FormField
                  key={kpi.id}
                  control={form.control}
                  name={`${prefix}.${kpi.id}` as any}
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
                        <Input
                          type="number"
                          min={0}
                          max={kpi.maxPoints}
                          step="0.1"
                          className="w-full sm:w-24 text-right font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      )
    })

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
            Insira os pontos conquistados em cada KPI diretamente.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
              <FormField
                control={form.control}
                name="totalScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total de Pontos</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        className={cn(sumMismatch && 'border-destructive')}
                        {...field}
                      />
                    </FormControl>
                    {sumMismatch ? (
                      <p className="text-xs text-destructive font-medium">
                        Soma dos KPIs: {Number(computedSum)} pts — divergente!
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Soma dos KPIs: {Number(computedSum)} pts
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Accordion
            type="multiple"
            defaultValue={KPI_CATEGORIES.map((c) => `points-${c}`)}
            className="space-y-4"
          >
            {renderKpiFields('points')}
          </Accordion>

          <Accordion type="multiple" className="space-y-4">
            <AccordionItem
              value="top-dealer-section"
              className="border border-secondary/30 bg-secondary/5 rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline font-display text-lg py-6 px-6 text-secondary">
                Top Dealer — Pontuação de Referência
                <span className="ml-auto mr-4 text-sm text-muted-foreground font-sans font-normal">
                  Benchmark
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6 space-y-4">
                {renderKpiFields('topDealerPoints')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col items-end gap-2 pt-4">
            {sumMismatch && (
              <p className="text-sm text-destructive font-medium flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Corrija a divergência para habilitar o salvamento.
              </p>
            )}
            <Button
              type="submit"
              size="lg"
              className="gap-2 w-full md:w-auto"
              disabled={sumMismatch}
            >
              <Save className="w-5 h-5" /> Salvar Lançamento
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
