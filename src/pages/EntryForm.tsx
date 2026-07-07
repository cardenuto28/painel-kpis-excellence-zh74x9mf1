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
import { buildRawValuesSchema, getDefaultRawValues } from '@/lib/entry-form-schema'
import { KpiInput } from '@/components/entry/KpiInput'
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
    const rawValuesSchema = buildRawValuesSchema(kpis)
    return z.object({
      mes: z.string().min(1, 'Obrigatório'),
      ano: z.coerce.number().min(2020).max(2050),
      ranking: z.coerce.number().min(1),
      topDealerTotal: z.coerce.number().min(0).max(100),
      rawValues: rawValuesSchema,
      topDealerRawValues: rawValuesSchema,
    })
  }, [kpis])

  type FormValues = z.infer<typeof formSchema>

  const existingData = id ? months.find((m) => m.id === id) : null

  const defaultRawValues = useMemo(
    () => getDefaultRawValues(kpis, existingData?.rawValues),
    [kpis, existingData],
  )
  const defaultTopDealerRawValues = useMemo(
    () => getDefaultRawValues(kpis, existingData?.topDealerRawValues),
    [kpis, existingData],
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingData
      ? {
          ...existingData,
          rawValues: defaultRawValues,
          topDealerRawValues: defaultTopDealerRawValues,
        }
      : {
          mes: '',
          ano: new Date().getFullYear(),
          ranking: 1,
          topDealerTotal: 100,
          rawValues: defaultRawValues,
          topDealerRawValues: defaultTopDealerRawValues,
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

  const renderKpiFields = (prefix: 'rawValues' | 'topDealerRawValues') =>
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
            {prefix === 'topDealerRawValues' ? 'Top Dealer · ' : ''}
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
                  name={`${prefix}.${kpi.id}`}
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
                        <KpiInput kpi={kpi} value={field.value} onChange={field.onChange} />
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
            defaultValue={KPI_CATEGORIES.map((c) => `rawValues-${c}`)}
            className="space-y-4"
          >
            {renderKpiFields('rawValues')}
          </Accordion>

          <Accordion type="multiple" className="space-y-4">
            <AccordionItem
              value="top-dealer-section"
              className="border border-secondary/30 bg-secondary/5 rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline font-display text-lg py-6 px-6 text-secondary">
                Top Dealer — Valores de Referência
                <span className="ml-auto mr-4 text-sm text-muted-foreground font-sans font-normal">
                  Benchmark
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6 space-y-4">
                {renderKpiFields('topDealerRawValues')}
              </AccordionContent>
            </AccordionItem>
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
