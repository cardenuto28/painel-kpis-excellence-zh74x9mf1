import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useDataStore from '@/stores/use-data-store'
import { MONTH_NAMES, KpiDef } from '@/lib/kpi-definitions'
import { calculateKpiPoints } from '@/lib/kpi-calculator'
import { ArrowLeft, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

const KPI_ORDER = [
  'vendasRetail',
  'bev',
  'gkl',
  'mMpa',
  'bps',
  'vocVendas',
  'pecas',
  'videos',
  'clientesConectados',
  'serviceInclusive',
  'teleservice',
  'ticketMedio',
  'vocPos',
  'treinamentos',
  'retailStandards',
  'ferramentasDigitais',
  'propostaComercial',
  'sfPenetration',
]

function parseLine(text: string, kpis: KpiDef[]): Record<string, any> {
  const parts = text
    .trim()
    .split(/[\t,;\n]+/)
    .filter(Boolean)
  const result: Record<string, any> = {}
  KPI_ORDER.forEach((id, i) => {
    const kpi = kpis.find((k) => k.id === id)
    if (!kpi || !parts[i]) return
    const raw = parts[i].trim()
    if (kpi.type === 'boolean') result[id] = ['1', 'sim', 'yes', 'true'].includes(raw.toLowerCase())
    else if (kpi.type === 'voc')
      result[id] = { nps: Number(raw.replace(',', '.')) || 0, failedSubIndicators: 0 }
    else if (kpi.type === 'treinamentos')
      result[id] = { vendas: Number(raw) || 0, pos: 0, tecnico: 0 }
    else if (kpi.type === 'percentage') result[id] = Number(raw.replace(',', '.')) * 100
    else result[id] = Number(raw.replace(',', '.')) || 0
  })
  return result
}

export default function Import() {
  const navigate = useNavigate()
  const { kpis, saveMonth, role } = useDataStore()
  const [mes, setMes] = useState('')
  const [ano, setAno] = useState(new Date().getFullYear())
  const [ranking, setRanking] = useState(1)
  const [topDealerTotal, setTopDealerTotal] = useState(0)
  const [euroText, setEuroText] = useState('')
  const [topText, setTopText] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const euroValues = useMemo(
    () => (showPreview ? parseLine(euroText, kpis) : {}),
    [showPreview, euroText, kpis],
  )
  const previewRows = useMemo(() => {
    if (!showPreview) return []
    return KPI_ORDER.map((id) => {
      const kpi = kpis.find((k) => k.id === id)
      if (!kpi) return null
      const raw = euroValues[id]
      return { kpi, raw, pts: calculateKpiPoints(kpi, raw) }
    }).filter(Boolean) as { kpi: KpiDef; raw: any; pts: number }[]
  }, [showPreview, kpis, euroValues])
  const totalPoints = previewRows.reduce((sum, r) => sum + r.pts, 0)

  const handleSave = async () => {
    if (!mes || !ano) {
      toast.error('Selecione mês e ano')
      return
    }
    if (!euroText.trim()) {
      toast.error('Cole os valores da PG Prime')
      return
    }
    const rawValues = parseLine(euroText, kpis)
    const topDealerRawValues = topText.trim() ? parseLine(topText, kpis) : {}
    try {
      await saveMonth({ mes, ano, ranking, topDealerTotal, rawValues, topDealerRawValues })
      toast.success('Dados importados com sucesso!')
      navigate('/history')
    } catch {
      toast.error('Erro ao importar dados.')
    }
  }

  if (role !== 'Editor' && role !== 'Admin') {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Acesso restrito a Editores e Admins.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-display font-bold">Importar Dados Mensais</h2>
          <p className="text-muted-foreground text-sm">
            Cole os valores da planilha Excel para importar rapidamente.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Mês</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Mês</Label>
            <Select value={mes} onValueChange={setMes}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ano</Label>
            <Input type="number" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Ranking</Label>
            <Input
              type="number"
              value={ranking}
              onChange={(e) => setRanking(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>Pontos Top Dealer</Label>
            <Input
              type="number"
              step="0.1"
              value={topDealerTotal}
              onChange={(e) => setTopDealerTotal(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> PG Prime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={euroText}
              onChange={(e) => setEuroText(e.target.value)}
              placeholder="Cole a linha de valores (tab, vírgula ou ponto-e-vírgula). Valores percentuais como 1.1084 serão convertidos para 110.84%."
              className="min-h-[100px] font-mono text-sm"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Top Dealer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
              placeholder="Cole a linha de valores do Top Dealer (opcional)"
              className="min-h-[100px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShowPreview(true)}>
          Pré-visualizar
        </Button>
        <Button onClick={handleSave} className="gap-2">
          <CheckCircle2 className="w-4 h-4" /> Importar e Salvar
        </Button>
      </div>
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pré-visualização — Total: {totalPoints} pts</CardTitle>
          </CardHeader>
          <CardContent className="p-0 border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KPI</TableHead>
                  <TableHead className="text-center">Valor</TableHead>
                  <TableHead className="text-center">Pontos</TableHead>
                  <TableHead className="text-center">Máx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((r) => (
                  <TableRow key={r.kpi.id}>
                    <TableCell className="text-sm">{r.kpi.name}</TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {typeof r.raw === 'object' ? JSON.stringify(r.raw) : String(r.raw ?? '-')}
                    </TableCell>
                    <TableCell className="text-center font-mono">{r.pts}</TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">
                      {r.kpi.maxPoints}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
