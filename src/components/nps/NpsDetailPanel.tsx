import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/utils'
import {
  ShieldAlert,
  AlertTriangle,
  Target,
  ArrowRight,
  Car,
  Bike,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react'
import type { NpsCase } from '@/types/nps'

interface NpsDetailPanelProps {
  cases: NpsCase[]
  plansCountMap: Record<string, number>
  onOpenActionPlan: (npsCase: NpsCase) => void
  onViewAllInNpsModule?: () => void
}

export function NpsDetailPanel({
  cases,
  plansCountMap,
  onOpenActionPlan,
  onViewAllInNpsModule,
}: NpsDetailPanelProps) {
  const [filterMode, setFilterMode] = useState<'all_critical' | 'without_plans' | 'pending'>(
    'all_critical',
  )

  // Filtra casos críticos (detratores ≤ 6, neutros 7-8 ou com pendência)
  const criticalCases = cases.filter((c) => c.status !== 'Resolvido' || c.nota <= 8)

  const casesWithoutPlan = criticalCases.filter((c) => (plansCountMap[c.id] || 0) === 0)
  const pendingCases = criticalCases.filter((c) => c.status !== 'Resolvido')

  const displayedCases = criticalCases.filter((c) => {
    if (filterMode === 'without_plans') {
      return (plansCountMap[c.id] || 0) === 0
    }
    if (filterMode === 'pending') {
      return c.status !== 'Resolvido'
    }
    return true
  })

  return (
    <Card className="border-destructive/30 bg-card/60 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive via-amber-500 to-primary" />

      <CardHeader className="pb-3 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-display font-bold flex items-center gap-2 text-foreground">
              <ShieldAlert className="w-5 h-5 text-destructive shrink-0" />
              Painel de Casos Críticos NPS • Planos de Ação Obrigatórios
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Todo caso crítico é obrigado a ter plano de ação. Clique diretamente no caso para
              abrir o plano.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filtros rápidos do painel */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all_critical')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'all_critical'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos ({criticalCases.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('without_plans')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                  filterMode === 'without_plans'
                    ? 'bg-destructive text-destructive-foreground shadow-sm'
                    : 'text-destructive hover:bg-destructive/10'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Sem Plano ({casesWithoutPlan.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('pending')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'pending'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Pendentes ({pendingCases.length})
              </button>
            </div>

            {onViewAllInNpsModule && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewAllInNpsModule}
                className="h-8 text-xs gap-1 text-primary hover:bg-primary/10"
              >
                <span>Ver módulo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-1 pb-4">
        {/* Banner de aviso se houver casos sem plano */}
        {casesWithoutPlan.length > 0 && (
          <div className="mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/40 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-destructive font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>
                <strong>Atenção Gestor:</strong> Existem <strong>{casesWithoutPlan.length}</strong>{' '}
                caso(s) crítico(s) <strong>sem nenhum plano de ação</strong> cadastrado.
              </span>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs gap-1 shrink-0 shadow-sm"
              onClick={() => {
                if (casesWithoutPlan[0]) {
                  onOpenActionPlan(casesWithoutPlan[0])
                }
              }}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Criar Plano Agora
            </Button>
          </div>
        )}

        {displayedCases.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-lg text-xs text-muted-foreground bg-background/50">
            Nenhum caso crítico com os filtros selecionados.
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {displayedCases.map((c) => {
              const plansCount = plansCountMap[c.id] || 0
              const hasNoPlan = plansCount === 0
              const isDetractor = c.nota <= 6
              const VehicleIcon = c.marca === 'Motorrad' ? Bike : Car

              return (
                <div
                  key={c.id}
                  onClick={() => onOpenActionPlan(c)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    hasNoPlan
                      ? 'bg-destructive/5 border-destructive/40 hover:bg-destructive/10 hover:border-destructive shadow-sm'
                      : 'bg-background/80 border-border hover:border-primary/50 hover:bg-muted/40'
                  }`}
                  title="Clique para abrir imediatamente o Plano de Ação deste caso"
                >
                  {/* Coluna 1: Cliente, Marca, Veículo, Comentário */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {c.cliente}
                      </span>

                      <Badge
                        variant="outline"
                        className={`text-[10px] h-4 px-1.5 ${
                          c.marca === 'Motorrad'
                            ? 'border-orange-500/40 text-orange-400 bg-orange-500/10'
                            : 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                        }`}
                      >
                        <VehicleIcon className="w-2.5 h-2.5 mr-1 inline" />
                        {c.marca} • {c.departamento}
                      </Badge>

                      <Badge
                        variant="outline"
                        className={`text-[10px] h-4 px-1.5 ${
                          c.status === 'Resolvido'
                            ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                            : c.status === 'Em Tratamento'
                              ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                              : 'border-destructive/40 text-destructive bg-destructive/10'
                        }`}
                      >
                        {c.status}
                      </Badge>

                      {hasNoPlan ? (
                        <Badge
                          variant="destructive"
                          className="text-[10px] h-4 px-2 font-bold animate-pulse bg-destructive text-destructive-foreground"
                        >
                          Sem plano de ação
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1.5 border-emerald-500/40 text-emerald-400 bg-emerald-500/10 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {plansCount} plano(s)
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground truncate italic">
                      "{c.comentario || c.observacao_insatisfacao || 'Sem comentário registrado'}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Resp: {c.responsavel || 'Não atribuído'}</span>
                      {c.veiculo && <span>• Veículo: {c.veiculo}</span>}
                      <span>• Data: {formatDateBR(c.data)}</span>
                    </div>
                  </div>

                  {/* Coluna 2: Nota + Botão de Ação */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="text-right">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${
                          isDetractor
                            ? 'bg-destructive/20 text-destructive border border-destructive/50'
                            : 'bg-amber-500/20 text-amber-500 border border-amber-500/50'
                        }`}
                      >
                        {c.nota}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Nota</div>
                    </div>

                    <Button
                      size="sm"
                      variant={hasNoPlan ? 'destructive' : 'outline'}
                      className={`h-8 gap-1.5 text-xs ${
                        hasNoPlan
                          ? 'shadow-sm animate-pulse'
                          : 'border-primary/40 text-primary hover:bg-primary/10'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenActionPlan(c)
                      }}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>{hasNoPlan ? 'Criar Plano' : 'Ver Planos'}</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
