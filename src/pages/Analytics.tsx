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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import useDataStore from '@/stores/use-data-store'
import { MONTH_NAMES, KPI_CATEGORIES } from '@/lib/kpi-definitions'
import { TrendingUp, BarChart3 } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
  Vendas: '#3b82f6',
  'Suporte ao Cliente': '#22c55e',
  'Desenvolvimento de Rede': '#f59e0b',
  CRM: '#a855f7',
  'Serviços Financeiros': '#ef4444',
}

export default function Analytics() {
  const { months } = useDataStore()

  const years = useMemo(() => {
    const set = new Set(months.map((m) => m.ano))
    return Array.from(set).sort((a, b) => b - a)
  }, [months])

  const [selectedYear, setSelectedYear] = useState<string>(
    String(years[0] || new Date().getFullYear()),
  )

  const filteredMonths = useMemo(() => {
    return months
      .filter((m) => String(m.ano) === selectedYear)
      .sort((a, b) => MONTH_NAMES.indexOf(a.mes) - MONTH_NAMES.indexOf(b.mes))
  }, [months, selectedYear])

  const lineData = useMemo(
    () =>
      filteredMonths.map((m) => ({
        month: m.mes.substring(0, 3),
        totalScore: m.totalScore,
        topDealer: m.topDealerTotal,
      })),
    [filteredMonths],
  )

  const barData = useMemo(
    () =>
      filteredMonths.map((m) => {
        const entry: Record<string, string | number> = { month: m.mes.substring(0, 3) }
        KPI_CATEGORIES.forEach((cat) => {
          entry[cat] = m.categoryScores?.[cat] || 0
        })
        return entry
      }),
    [filteredMonths],
  )

  const lineConfig: ChartConfig = {
    totalScore: { label: 'Score PG Prime', color: 'hsl(var(--primary))' },
    topDealer: { label: 'Top Dealer', color: 'hsl(var(--secondary))' },
  }

  const barConfig: ChartConfig = KPI_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = { label: cat, color: CATEGORY_COLORS[cat] }
    return acc
  }, {} as ChartConfig)

  const noData = filteredMonths.length === 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Analytics & Tendências</h2>
          <p className="text-muted-foreground mt-1">
            Evolução de performance mensal e por categoria.
          </p>
        </div>
        {years.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Ano:</span>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Evolução do Score Total
          </CardTitle>
          <CardDescription>Score PG Prime vs Top Dealer — {selectedYear}</CardDescription>
        </CardHeader>
        <CardContent>
          {noData ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Sem dados para o período selecionado.
            </div>
          ) : (
            <ChartContainer config={lineConfig} className="h-[300px] w-full">
              <LineChart data={lineData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalScore"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="topDealer"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-secondary" />
            Pontuação por Categoria
          </CardTitle>
          <CardDescription>Comparativo entre categorias — {selectedYear}</CardDescription>
        </CardHeader>
        <CardContent>
          {noData ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Sem dados para o período selecionado.
            </div>
          ) : (
            <ChartContainer config={barConfig} className="h-[350px] w-full">
              <BarChart data={barData} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                {KPI_CATEGORIES.map((cat) => (
                  <Bar key={cat} dataKey={cat} fill={CATEGORY_COLORS[cat]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
