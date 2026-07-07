import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts'
import { MonthRecord } from '@/types'
import { getTotalPoints, getCategoryPoints } from '@/lib/kpi-rules'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface DashboardChartsProps {
  months: MonthRecord[]
}

export function DashboardCharts({ months }: DashboardChartsProps) {
  const sortedMonths = [...months].sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano
    const m = [
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
    ]
    return m.indexOf(a.mes) - m.indexOf(b.mes)
  })

  const evolutionData = sortedMonths.map((m) => ({
    name: `${m.mes.substring(0, 3)}/${m.ano.toString().substring(2)}`,
    'Euro Motors': getTotalPoints(m),
    'Top Dealer': m.topDealerTotal,
  }))

  const compositionData = sortedMonths.map((m) => ({
    name: `${m.mes.substring(0, 3)}/${m.ano.toString().substring(2)}`,
    Vendas: getCategoryPoints(m, 'vendas'),
    'Suporte ao Cliente': getCategoryPoints(m, 'suporte'),
    Rede: getCategoryPoints(m, 'rede'),
    CRM: getCategoryPoints(m, 'crm'),
    'Serv. Financeiros': getCategoryPoints(m, 'financeiro'),
  }))

  const evolutionConfig = {
    'Euro Motors': { label: 'Euro Motors', color: 'hsl(var(--primary))' },
    'Top Dealer': { label: 'Top Dealer', color: 'hsl(var(--secondary))' },
  }

  const compositionConfig = {
    Vendas: { label: 'Vendas', color: 'hsl(var(--chart-1))' },
    'Suporte ao Cliente': { label: 'Suporte', color: 'hsl(var(--chart-2))' },
    Rede: { label: 'Rede', color: 'hsl(var(--chart-3))' },
    CRM: { label: 'CRM', color: 'hsl(var(--chart-4))' },
    'Serv. Financeiros': { label: 'Financeiro', color: 'hsl(var(--chart-5))' },
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="bg-card border border-border rounded-xl p-6 shadow-elevation">
        <h3 className="text-lg font-display font-semibold mb-6">Evolução Mensal (Total)</h3>
        <div className="h-[300px]">
          <ChartContainer config={evolutionConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolutionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="Top Dealer"
                  stroke="var(--secondary)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Euro Motors"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-elevation">
        <h3 className="text-lg font-display font-semibold mb-6">Composição por Categoria</h3>
        <div className="h-[300px]">
          <ChartContainer config={compositionConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compositionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Vendas" stackId="a" fill="var(--chart-1)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Suporte ao Cliente" stackId="a" fill="var(--chart-2)" />
                <Bar dataKey="Rede" stackId="a" fill="var(--chart-3)" />
                <Bar dataKey="CRM" stackId="a" fill="var(--chart-4)" />
                <Bar
                  dataKey="Serv. Financeiros"
                  stackId="a"
                  fill="var(--chart-5)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
