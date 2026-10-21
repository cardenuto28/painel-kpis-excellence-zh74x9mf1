import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getNpsActionPlans,
  createNpsActionPlan,
  updateNpsActionPlan,
  deleteNpsActionPlan,
  suggestActionPlan,
  getSimilarCases,
  updateNpsCase,
  type SimilarCaseResult,
} from '@/services/nps'
import { formatDateBR } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Sparkles,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Calendar,
  MessageSquare,
} from 'lucide-react'
import type { NpsCase, NpsActionPlan, NpsCaseStatus } from '@/types/nps'

interface NpsActionPlanDialogProps {
  npsCase: NpsCase | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canManage: boolean
  onCaseUpdated?: () => void
}

export function NpsActionPlanDialog({
  npsCase,
  open,
  onOpenChange,
  canManage,
  onCaseUpdated,
}: NpsActionPlanDialogProps) {
  const [plans, setPlans] = useState<NpsActionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [caseStatus, setCaseStatus] = useState<NpsCaseStatus>('Pendente')

  // Form novo plano
  const [newDescricao, setNewDescricao] = useState('')
  const [newPrazo, setNewPrazo] = useState('')
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false)
  const [addingPlan, setAddingPlan] = useState(false)

  // Pattern alert (Casos similares)
  const [similarCases, setSimilarCases] = useState<SimilarCaseResult[]>([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)

  const loadData = useCallback(async () => {
    if (!npsCase) return
    setLoading(true)
    try {
      const records = await getNpsActionPlans(npsCase.id)
      setPlans(records)
      setCaseStatus(npsCase.status)

      // Carregar casos similares (Pattern alert por embedding)
      const textToSearch =
        `${npsCase.comentario || ''} ${npsCase.observacao_insatisfacao || ''}`.trim()
      if (textToSearch) {
        setLoadingSimilar(true)
        getSimilarCases({
          caseId: npsCase.id,
          text: textToSearch,
          departamento: npsCase.departamento,
        })
          .then((items) => setSimilarCases(items))
          .catch(() => setSimilarCases([]))
          .finally(() => setLoadingSimilar(false))
      } else {
        setSimilarCases([])
      }
    } catch (err: any) {
      toast.error('Erro ao carregar planos de ação')
    } finally {
      setLoading(false)
    }
  }, [npsCase])

  useEffect(() => {
    if (open && npsCase) {
      loadData()
      setNewDescricao('')
      // Prazo padrão: +3 dias
      const d = new Date()
      d.setDate(d.getDate() + 3)
      setNewPrazo(d.toISOString().slice(0, 10))
    }
  }, [open, npsCase, loadData])

  // IA: Sugerir descrição da ação
  const handleGenerateSuggestion = async () => {
    if (!npsCase) return
    setGeneratingSuggestion(true)
    try {
      const suggestion = await suggestActionPlan({
        cliente: npsCase.cliente,
        marca: npsCase.marca,
        veiculo: npsCase.veiculo,
        departamento: npsCase.departamento,
        nota: npsCase.nota,
        comentario: npsCase.comentario,
        observacao: npsCase.observacao_insatisfacao,
      })
      if (suggestion) {
        setNewDescricao(suggestion)
        toast.success('Sugestão gerada pela IA!')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Falha ao sugerir plano com IA')
    } finally {
      setGeneratingSuggestion(false)
    }
  }

  // Criar novo plano de ação
  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!npsCase || !newDescricao.trim() || !newPrazo) {
      toast.error('Preencha descrição e prazo da ação')
      return
    }

    setAddingPlan(true)
    try {
      await createNpsActionPlan({
        nps_case_id: npsCase.id,
        descricao: newDescricao.trim(),
        prazo: newPrazo,
        status: 'Pendente',
      })
      toast.success('Plano de ação adicionado')
      setNewDescricao('')
      await loadData()
      onCaseUpdated?.()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao criar plano')
    } finally {
      setAddingPlan(false)
    }
  }

  // Alternar status do plano (Pendente <-> Concluído)
  const handleTogglePlanStatus = async (plan: NpsActionPlan) => {
    if (!npsCase) return
    const nextStatus = plan.status === 'Concluído' ? 'Pendente' : 'Concluído'
    try {
      await updateNpsActionPlan(plan.id, { status: nextStatus })

      // Verificar se agora todos os planos estão concluídos
      const updatedPlans = plans.map((p) => (p.id === plan.id ? { ...p, status: nextStatus } : p))
      const allCompleted =
        updatedPlans.length > 0 && updatedPlans.every((p) => p.status === 'Concluído')

      if (allCompleted && caseStatus !== 'Resolvido') {
        setCaseStatus('Resolvido')
        toast.success(
          'Todos os planos concluídos! Caso NPS marcado automaticamente como Resolvido.',
        )
      } else {
        toast.success(`Plano marcado como ${nextStatus}`)
      }

      await loadData()
      onCaseUpdated?.()
    } catch (err: any) {
      toast.error('Erro ao atualizar plano')
    }
  }

  // Excluir plano
  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteNpsActionPlan(planId)
      toast.success('Plano de ação removido')
      await loadData()
      onCaseUpdated?.()
    } catch (err: any) {
      toast.error('Erro ao excluir plano')
    }
  }

  // Alteração manual de status do caso
  const handleCaseStatusChange = async (newStatus: NpsCaseStatus) => {
    if (!npsCase) return
    try {
      await updateNpsCase(npsCase.id, { status: newStatus })
      setCaseStatus(newStatus)
      toast.success(`Status do caso atualizado para ${newStatus}`)
      onCaseUpdated?.()
    } catch (err: any) {
      toast.error('Erro ao atualizar status do caso')
    }
  }

  if (!npsCase) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-6">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                Planos de Ação NPS • {npsCase.cliente}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {npsCase.marca} • {npsCase.departamento} • Nota{' '}
                <strong className={npsCase.nota <= 6 ? 'text-destructive' : 'text-amber-500'}>
                  {npsCase.nota}/10
                </strong>{' '}
                • {formatDateBR(npsCase.data)}
              </p>
            </div>

            {/* Status do Caso */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-muted-foreground">Status do Caso:</span>
              {canManage ? (
                <Select
                  value={caseStatus}
                  onValueChange={(v) => handleCaseStatusChange(v as NpsCaseStatus)}
                >
                  <SelectTrigger className="h-8 text-xs w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em Tratamento">Em Tratamento</SelectItem>
                    <SelectItem value="Resolvido">Resolvido</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline">{caseStatus}</Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Detalhe do relato */}
          <div className="rounded-lg bg-muted/40 p-3.5 border border-border/60 text-xs space-y-2">
            <div>
              <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Relato do Cliente:
              </span>
              <p className="italic text-foreground bg-background/80 p-2.5 rounded border border-border/80">
                "{npsCase.comentario || 'Nenhum comentário registrado.'}"
              </p>
            </div>
            {npsCase.observacao_insatisfacao && (
              <div>
                <span className="font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Observações Internas:
                </span>
                <p className="text-foreground">{npsCase.observacao_insatisfacao}</p>
              </div>
            )}
          </div>

          {/* ALERTA DE PADRÃO RECORRENTE (IA Pattern Alert) */}
          {similarCases.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs tracking-wide uppercase">
                  <AlertTriangle className="w-4 h-4" />
                  Alerta de Padrão Recorrente (IA)
                </div>
                <Badge variant="outline" className="border-amber-500/50 text-amber-500 text-[10px]">
                  {similarCases.length} caso(s) parecido(s)
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Casos com queixas semelhantes já foram reportados neste departamento da PG Prime:
              </p>
              <div className="space-y-1.5 pt-1">
                {similarCases.map((sim) => (
                  <div
                    key={sim.id}
                    className="p-2 rounded bg-background/90 border border-border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-foreground">{sim.cliente}</span>
                      <span className="text-muted-foreground ml-1.5">
                        ({sim.marca} - {sim.departamento})
                      </span>
                      <p className="text-muted-foreground italic truncate mt-0.5">
                        "{sim.comentario || 'Sem comentário'}"
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[10px] self-start sm:self-auto"
                    >
                      Nota {sim.nota} • {sim.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LISTA DE PLANOS DE AÇÃO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Planos de Ação Cadastrados ({plans.length})
              </h4>
              <span className="text-xs text-muted-foreground">
                Auto-resolução: conclua todos os planos para finalizar o caso
              </span>
            </div>

            {loading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Carregando planos...
              </div>
            ) : plans.length === 0 ? (
              <div className="p-6 border border-dashed rounded-lg text-center text-xs text-muted-foreground">
                Nenhum plano de ação registrado ainda para este caso.
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((plan) => {
                  const isDone = plan.status === 'Concluído'
                  return (
                    <div
                      key={plan.id}
                      className={`p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-500/5 border-emerald-500/30 text-muted-foreground'
                          : 'bg-card border-border hover:border-border/80'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleTogglePlanStatus(plan)}
                            className="mt-0.5 text-muted-foreground hover:text-primary transition-colors shrink-0"
                            title={isDone ? 'Reabrir plano' : 'Marcar como concluído'}
                          >
                            {isDone ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/60 hover:border-primary" />
                            )}
                          </button>
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <p
                            className={`text-sm ${
                              isDone
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground font-medium'
                            }`}
                          >
                            {plan.descricao}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Prazo: {formatDateBR(plan.prazo)}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] h-4 px-1.5 ${
                                isDone
                                  ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10'
                                  : 'border-amber-500/50 text-amber-500 bg-amber-500/10'
                              }`}
                            >
                              {plan.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => handleDeletePlan(plan.id)}
                          title="Remover plano"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* FORMULÁRIO DE NOVO PLANO DE AÇÃO (com IA) */}
          {canManage && (
            <form
              onSubmit={handleAddPlan}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Novo Plano de Ação
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSuggestion}
                  disabled={generatingSuggestion}
                  className="h-7 gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generatingSuggestion ? 'Gerando sugestão...' : 'Sugerir com IA'}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-desc" className="text-xs">
                  Descrição da Ação Proposta *
                </Label>
                <Input
                  id="plan-desc"
                  placeholder="Ex: Contato da gerência para retratação e concessão de serviço de higienização"
                  value={newDescricao}
                  onChange={(e) => setNewDescricao(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
                <div className="space-y-1.5 w-full sm:w-48">
                  <Label htmlFor="plan-prazo" className="text-xs">
                    Prazo Limite *
                  </Label>
                  <Input
                    id="plan-prazo"
                    type="date"
                    value={newPrazo}
                    onChange={(e) => setNewPrazo(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" size="sm" disabled={addingPlan} className="gap-1.5 self-end">
                  <Plus className="w-4 h-4" />
                  {addingPlan ? 'Adicionando...' : 'Adicionar Ação'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
