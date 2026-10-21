import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { saveWeeklyStat } from '@/services/nps'
import { formatDateBR } from '@/lib/utils'
import { toast } from 'sonner'
import { Car, Bike, Edit2, TrendingUp, CheckCircle, ExternalLink } from 'lucide-react'
import type { NpsWeeklyStat, NpsWeeklyBrand, NpsDepartment } from '@/types/nps'

interface SegmentConfig {
  brand: NpsWeeklyBrand
  department: NpsDepartment
  title: string
  icon: typeof Car
}

const SEGMENTS: SegmentConfig[] = [
  { brand: 'BMW Auto', department: 'Vendas', title: 'BMW Auto • Vendas', icon: Car },
  { brand: 'BMW Auto', department: 'Pós-Vendas', title: 'BMW Auto • Pós-Vendas', icon: Car },
  { brand: 'BMW Motorrad', department: 'Vendas', title: 'BMW Motorrad • Vendas', icon: Bike },
  {
    brand: 'BMW Motorrad',
    department: 'Pós-Vendas',
    title: 'BMW Motorrad • Pós-Vendas',
    icon: Bike,
  },
]

interface NpsWeeklyCardsProps {
  stats: Record<string, NpsWeeklyStat>
  canEdit?: boolean
  onSegmentClick?: (brand: 'BMW' | 'Motorrad', department: NpsDepartment) => void
  onStatsUpdated?: () => void
}

export function NpsWeeklyCards({
  stats,
  canEdit = false,
  onSegmentClick,
  onStatsUpdated,
}: NpsWeeklyCardsProps) {
  const [editingSegment, setEditingSegment] = useState<SegmentConfig | null>(null)
  const [editScore, setEditScore] = useState<string>('')
  const [editRate, setEditRate] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const handleOpenEdit = (e: React.MouseEvent, seg: SegmentConfig) => {
    e.stopPropagation()
    const current = stats[`${seg.brand}::${seg.department}`]
    setEditingSegment(seg)
    setEditScore(current ? String(current.nps_score) : '80')
    setEditRate(current ? String(current.response_rate) : '40')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSegment) return

    const nps_score = Number(editScore)
    const response_rate = Number(editRate)

    if (isNaN(nps_score) || isNaN(response_rate)) {
      toast.error('Informe valores numéricos válidos')
      return
    }

    setSaving(true)
    try {
      await saveWeeklyStat({
        brand: editingSegment.brand,
        department: editingSegment.department,
        nps_score,
        response_rate,
      })
      toast.success(`Estatísticas de ${editingSegment.title} atualizadas!`)
      setEditingSegment(null)
      onStatsUpdated?.()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar estatísticas')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SEGMENTS.map((seg) => {
          const key = `${seg.brand}::${seg.department}`
          const stat = stats[key]
          const score = stat ? stat.nps_score : 0
          const rate = stat ? stat.response_rate : 0
          const updateDate = stat?.update_date ? formatDateBR(stat.update_date) : 'Nunca'
          const brandFilter: 'BMW' | 'Motorrad' = seg.brand.includes('Motorrad')
            ? 'Motorrad'
            : 'BMW'

          const Icon = seg.icon
          const isHighNps = score >= 80

          return (
            <Card
              key={key}
              onClick={() => onSegmentClick?.(brandFilter, seg.department)}
              className="relative overflow-hidden cursor-pointer transition-all hover:border-primary/60 hover:shadow-md bg-card/60 backdrop-blur-sm group"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  isHighNps ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-destructive'
                }`}
              />
              <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold tracking-tight">
                      {seg.title}
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      PG Prime BMW Jundiaí
                    </span>
                  </div>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-70 group-hover:opacity-100 hover:bg-primary/20 hover:text-primary"
                    onClick={(e) => handleOpenEdit(e, seg)}
                    title="Editar Score e Taxa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-1 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-3xl font-display font-bold tracking-tight">
                      {score}
                      <span className="text-xs font-normal text-muted-foreground ml-1">pts</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Score NPS</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-display font-semibold text-foreground/90">
                      {rate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Taxa Resposta</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Atualizado: {updateDate}</span>
                  <span className="flex items-center gap-0.5 text-primary group-hover:underline">
                    Ver casos <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog de edição semanal de segmento */}
      <Dialog open={!!editingSegment} onOpenChange={(open) => !open && setEditingSegment(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Atualizar Performance NPS — {editingSegment?.title}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Cada atualização gera um novo registro semanal no histórico, preservando a evolução ao
              longo do tempo.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">NPS Score (Pontos de 0 a 100)</label>
              <Input
                type="number"
                step="0.1"
                value={editScore}
                onChange={(e) => setEditScore(e.target.value)}
                required
                placeholder="Ex: 85"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Taxa de Resposta (%)</label>
              <Input
                type="number"
                step="0.1"
                value={editRate}
                onChange={(e) => setEditRate(e.target.value)}
                required
                placeholder="Ex: 48"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingSegment(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Registro Semanal'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
