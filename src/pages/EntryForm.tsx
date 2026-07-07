import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
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
import { KPI_CATEGORIES, KPI_DEFINITIONS, MONTH_NAMES } from '@/lib/kpi-definitions'
import { Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

// Create zod schema dynamically based on KPIs
const rawValuesSchema = z.object(
  KPI_DEFINITIONS.reduce((acc, kpi) => {
    if (kpi.type === 'boolean') {
      acc[kpi.id] = z.boolean().default(false)
    } else {
      acc[kpi.id] = z.coerce.number().min(0).max(1000)
    }
    return acc
  }, {} as any),
)

const formSchema = z.object({
  mes: z.string().min(1, 'Obrigatório'),
  ano: z.coerce.number().min(2020).max(2050),
  ranking: z.coerce.number().min(1),
  topDealerTotal: z.coerce.number().min(0).max(100),
  rawValues: rawValuesSchema,
})

type FormValues = z.infer<typeof formSchema>

export default function EntryForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { months, saveMonth, role } = useDataStore()

  useEffect(() => {
    if (role !== 'Editor') {
      navigate('/')
      toast.error('Acesso negado. Apenas Editores podem lançar resultados.')
    }
  }, [role, navigate])

  const existingData = id ? months.find((m) => m.id === id) : null

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingData || {
      mes: '',
      ano: new Date().getFullYear(),
      ranking: 1,
      topDealerTotal: 100,
      rawValues: KPI_DEFINITIONS.reduce((acc, kpi) => {
        acc[kpi.id] = kpi.type === 'boolean' ? false : 0
        return acc
      }, {} as any),
    },
  })

  const onSubmit = (data: FormValues) => {
    // Check for duplicates
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
            {KPI_CATEGORIES.map((category) => (
              <AccordionItem
                key={category}
                value={category}
                className="border bg-card rounded-lg px-6 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline font-display text-lg py-6">
                  {category}
                  <span className="ml-auto mr-4 text-sm text-muted-foreground font-sans font-normal">
                    Máx:{' '}
                    {KPI_DEFINITIONS.filter((k) => k.category === category).reduce(
                      (sum, k) => sum + k.maxPoints,
                      0,
                    )}{' '}
                    pts
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {KPI_DEFINITIONS.filter((k) => k.category === category).map((kpi) => (
                      <FormField
                        key={kpi.id}
                        control={form.control}
                        name={`rawValues.${kpi.id}`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 p-3 border rounded-md bg-background/50">
                            <div className="space-y-0.5 max-w-[200px]">
                              <FormLabel className="text-sm font-medium leading-tight block">
                                {kpi.name}
                              </FormLabel>
                              <span className="text-xs text-muted-foreground">
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
                              ) : (
                                <div className="relative w-24">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    className="pr-8 text-right font-mono"
                                    {...field}
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
            ))}
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
