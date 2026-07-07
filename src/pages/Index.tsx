import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import useDataStore from '@/stores/use-data-store'
import { KPI_CATEGORIES, KPI_DEFINITIONS, MONTH_NAMES } from '@/lib/kpi-definitions'
import { Gauge } from '@/components/dashboard/Gauge'
import { AlertCircle, Target, TrendingDown, TrendingUp } from 'lucide-react'

export default function Index() {
  const { months } = useDataStore()

  const sortedMonths = useMemo(() => {
    return [...months].sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano
      return MONTH_NAMES.indexOf(b.mes) - MONTH_NAMES.indexOf(a.mes)
    })
  }, [months])

  const [selectedId, setSelectedId] = useState(sortedMonths[0]?.id)

  const currentMonth = sortedMonths.find((m) => m.id === selectedId)
  const currentIndex = sortedMonths.findIndex((m) => m.id === selectedId)
  const prevMonth = sortedMonths[currentIndex + 1]

  const deltaScore = prevMonth ? (currentMonth?.totalScore || 0) - prevMonth.totalScore : 0
  const rankDelta = prevMonth ? (currentMonth?.ranking || 0) - prevMonth.ranking : 0 // negative is good

  const chartData = useMemo(() => {
    return [...sortedMonths].reverse().map((m) => ({
      name: `${m.mes.substring(0, 3)}/${m.ano.toString().slice(-2)}`,
      euroMotors: m.totalScore,
      topDealer: m.topDealerTotal,
      vendas: m.categoryScores['Vendas'],
      suporte: m.categoryScores['Suporte ao Cliente'],
      rede: m.categoryScores['Desenvolvimento de Rede'],
      crm: m.categoryScores['CRM'],
      sf: m.categoryScores['Serviços Financeiros'],
    }))
  }, [sortedMonths])

  // Insights Logic
  const insights = useMemo(() => {
    if (!currentMonth) return { critical: [], attention: [] }
    const allMonthsData = sortedMonths

    const critical = KPI_DEFINITIONS.filter(
      (kpi) => allMonthsData.length > 0 && allMonthsData.every((m) => m.points[kpi.id] === 0),
    )

    const attention = KPI_DEFINITIONS.filter((kpi) => {
      if (critical.includes(kpi)) return false
      const currentZero = currentMonth.points[kpi.id] === 0
      const wasScoring = allMonthsData.some((m) => m.id !== currentMonth.id && m.points[kpi.id] > 0)
      return currentZero && wasScoring
    })

    return { critical, attention }
  }, [currentMonth, sortedMonths])

  if (months.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Nenhum dado cadastrado. Use o botão "Novo Lançamento".
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Month Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {sortedMonths.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedId(m.id)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              selectedId === m.id
                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                : 'bg-card text-muted-foreground border-border hover:bg-secondary/10 hover:text-foreground'
            }`}
          >
            {m.mes} {m.ano}
          </button>
        ))}
      </div>

      {currentMonth && (
        <>
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1 border-border/50 bg-card/40 backdrop-blur-sm">
              <CardContent className="pt-6 pb-2">
                <Gauge value={currentMonth.totalScore} delta={deltaScore} />
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/40 backdrop-blur-sm flex flex-col justify-center relative overflow-hidden">
              <div className="absolute -right-6 -top-6 text-primary/5">
                <Target className="w-48 h-48" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
                  Ranking Nacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <span className="text-6xl font-display font-bold">{currentMonth.ranking}º</span>
                  {rankDelta !== 0 && (
                    <div
                      className={`flex items-center mb-2 font-bold ${rankDelta < 0 ? 'text-green-400' : 'text-destructive'}`}
                    >
                      {rankDelta < 0 ? (
                        <TrendingUp className="w-5 h-5 mr-1" />
                      ) : (
                        <TrendingDown className="w-5 h-5 mr-1" />
                      )}
                      {Math.abs(rankDelta)} posições
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/40 backdrop-blur-sm flex flex-col justify-center">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
                  Gap Top Dealer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <span className="text-5xl font-display font-bold text-secondary">
                    -{currentMonth.topDealerTotal - currentMonth.totalScore}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    pontos para o 1º lugar ({currentMonth.topDealerTotal} pts)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">Evolução de Pontuação</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ChartContainer
                    config={{
                      euroMotors: { label: 'Euro Motors', color: 'hsl(var(--primary))' },
                      topDealer: { label: 'Top Dealer', color: 'hsl(var(--secondary))' },
                    }}
                  >
                    <LineChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Line
                        type="monotone"
                        name="Euro Motors"
                        dataKey="euroMotors"
                        stroke="var(--color-euroMotors)"
                        strokeWidth={3}
                        dot={{ r: 4, fill: 'var(--color-euroMotors)' }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        name="Top Dealer"
                        dataKey="topDealer"
                        stroke="var(--color-topDealer)"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-display">Composição por Categoria</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ChartContainer
                    config={{
                      vendas: { label: 'Vendas', color: 'hsl(var(--chart-1))' },
                      suporte: { label: 'Suporte', color: 'hsl(var(--chart-2))' },
                      rede: { label: 'Rede', color: 'hsl(var(--chart-3))' },
                      crm: { label: 'CRM', color: 'hsl(var(--chart-4))' },
                      sf: { label: 'Serviços F.', color: 'hsl(var(--chart-5))' },
                    }}
                  >
                    <BarChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                        opacity={0.5}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar
                        name="Vendas"
                        dataKey="vendas"
                        stackId="a"
                        fill="var(--color-vendas)"
                        radius={[0, 0, 4, 4]}
                      />
                      <Bar
                        name="Suporte"
                        dataKey="suporte"
                        stackId="a"
                        fill="var(--color-suporte)"
                      />
                      <Bar name="Rede" dataKey="rede" stackId="a" fill="var(--color-rede)" />
                      <Bar name="CRM" dataKey="crm" stackId="a" fill="var(--color-crm)" />
                      <Bar
                        name="Serviços F."
                        dataKey="sf"
                        stackId="a"
                        fill="var(--color-sf)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-destructive/30 bg-destructive/5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/50"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-5 h-5" />
                  Crítico: Nunca Pontuamos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.critical.length > 0 ? (
                  <ul className="space-y-3">
                    {insights.critical.map((kpi) => (
                      <li
                        key={kpi.id}
                        className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border"
                      >
                        <span className="font-medium text-sm">{kpi.name}</span>
                        <Badge
                          variant="outline"
                          className="text-destructive border-destructive/50 bg-destructive/10"
                        >
                          0 / {kpi.maxPoints}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum KPI crítico encontrado.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-secondary/30 bg-secondary/5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/50"></div>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display flex items-center gap-2 text-secondary">
                  <AlertCircle className="w-5 h-5" />
                  Atenção: Zerou Neste Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.attention.length > 0 ? (
                  <ul className="space-y-3">
                    {insights.attention.map((kpi) => (
                      <li
                        key={kpi.id}
                        className="flex items-center justify-between p-3 rounded-md bg-background/50 border border-border"
                      >
                        <span className="font-medium text-sm">{kpi.name}</span>
                        <Badge
                          variant="outline"
                          className="text-secondary border-secondary/50 bg-secondary/10"
                        >
                          Queda para 0
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum KPI perdeu todos os pontos neste mês.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
