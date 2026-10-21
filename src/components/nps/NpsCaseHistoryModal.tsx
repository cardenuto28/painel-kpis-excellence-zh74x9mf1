import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDateBR } from '@/lib/utils'
import {
  AlertTriangle,
  History,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  Car,
  FileText,
} from 'lucide-react'
import type { NpsCase } from '@/types/nps'
import type { SimilarCaseResult } from '@/services/nps'

interface NpsCaseHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  savedCase: NpsCase | null
  similarCases: SimilarCaseResult[]
  isLoadingSimilar: boolean
  onOpenActionPlan?: (npsCase: NpsCase) => void
  isNewCase?: boolean
}

export function NpsCaseHistoryModal({
  open,
  onOpenChange,
  savedCase,
  similarCases,
  isLoadingSimilar,
  onOpenActionPlan,
  isNewCase = false,
}: NpsCaseHistoryModalProps) {
  if (!savedCase) return null

  const isDetractor = (savedCase.nota ?? 10) <= 6
  const isNeutral = (savedCase.nota ?? 10) >= 7 && (savedCase.nota ?? 10) <= 8
  const hasHistory = similarCases.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {hasHistory ? (
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            <div>
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                {hasHistory
                  ? 'Histórico de Reclamações Semelhantes Detectado'
                  : 'Caso Registrado no Banco de NPS'}
                <Badge
                  variant="outline"
                  className={
                    isDetractor
                      ? 'border-destructive/40 text-destructive bg-destructive/10 text-[10px]'
                      : 'border-amber-500/40 text-amber-500 bg-amber-500/10 text-[10px]'
                  }
                >
                  {isDetractor ? 'Detrator' : isNeutral ? 'Neutro' : 'Promotor'} • Nota{' '}
                  {savedCase.nota}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isNewCase ? 'Novo caso cadastrado' : 'Caso atualizado'} para{' '}
                <strong>{savedCase.cliente}</strong> ({savedCase.marca} • {savedCase.departamento})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Card do Caso Salvo */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/30 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> {savedCase.cliente}
              </span>
              <span>{formatDateBR(savedCase.data)}</span>
            </div>
            {savedCase.comentario && (
              <p className="italic text-foreground bg-background/80 p-2 rounded border border-border/70">
                "{savedCase.comentario}"
              </p>
            )}
            {savedCase.observacao_insatisfacao && (
              <p className="text-muted-foreground">
                <strong>Obs interna:</strong> {savedCase.observacao_insatisfacao}
              </p>
            )}
          </div>

          {/* Destaque Visual de Histórico / Padrão Recorrente */}
          {isLoadingSimilar ? (
            <div className="p-6 rounded-lg border border-border bg-card/60 text-center space-y-2">
              <Sparkles className="w-5 h-5 animate-spin mx-auto text-primary" />
              <p className="text-xs text-muted-foreground">
                Consultando histórico por similaridade semântica...
              </p>
            </div>
          ) : hasHistory ? (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs tracking-wide uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  Este caso tem histórico: {similarCases.length} caso(s) anterior(es) com reclamação
                  semelhante
                </div>
                <Badge
                  variant="outline"
                  className="border-amber-500/60 bg-amber-500/20 text-amber-500 text-[10px]"
                >
                  Padrão Recorrente (IA)
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                A IA de NPS identificou que a insatisfação deste cliente já ocorreu em outros
                atendimentos da PG Prime. Avalie a causa-raiz com a liderança para evitar
                reincidência:
              </p>

              <div className="space-y-2 pt-1">
                {similarCases.map((sim) => (
                  <div
                    key={sim.id}
                    className="p-3 rounded-lg bg-background/95 border border-border/80 text-xs space-y-1.5 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{sim.cliente}</span>
                        <span className="text-[11px] text-muted-foreground">
                          ({sim.marca || 'BMW'} • {sim.departamento || 'Geral'})
                        </span>
                        {sim.veiculo && (
                          <span className="text-[11px] text-muted-foreground">• {sim.veiculo}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {sim.data && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mr-1">
                            <Calendar className="w-3 h-3" /> {formatDateBR(sim.data)}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            (sim.nota ?? 10) <= 6
                              ? 'border-destructive/40 text-destructive bg-destructive/10 text-[10px]'
                              : 'border-amber-500/40 text-amber-500 bg-amber-500/10 text-[10px]'
                          }
                        >
                          Nota {sim.nota ?? '-'}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {sim.status || 'Pendente'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-foreground italic bg-muted/40 p-2 rounded text-[11px] leading-relaxed">
                      "{sim.comentario || sim.observacao_insatisfacao || 'Sem relato transcrito'}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs text-muted-foreground flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <strong className="text-foreground block text-xs">
                  Primeira ocorrência desta reclamação
                </strong>
                <span>
                  Não foram identificados outros casos no banco com relato ou causa-raiz semelhante
                  a este feedback.
                </span>
              </div>
            </div>
          )}

          {/* Ação recomendada */}
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Próximo Passo Obrigatório
              </span>
              <p className="text-muted-foreground text-[11px]">
                {isDetractor
                  ? 'Casos com nota ≤ 6 exigem formulação de plano de ação imediato pela PG Prime.'
                  : 'Recomenda-se registrar um plano preventivo para reverter o cliente neutro para promotor.'}
              </p>
            </div>

            {onOpenActionPlan && (
              <Button
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onOpenActionPlan(savedCase)
                }}
                className="gap-1.5 shrink-0 text-xs shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Abrir Plano de Ação</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
