import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateBR } from '@/lib/utils'
import { Target, Trash2, Edit3, MessageSquareWarning, Car, Bike } from 'lucide-react'
import type { NpsCase } from '@/types/nps'

interface NpsCaseTableProps {
  cases: NpsCase[]
  canManage: boolean
  onOpenPlans: (npsCase: NpsCase) => void
  onEditCase?: (npsCase: NpsCase) => void
  onDeleteCase?: (npsCase: NpsCase) => void
  plansByCaseId?: Record<string, number>
}

export function NpsCaseTable({
  cases,
  canManage,
  onOpenPlans,
  onEditCase,
  onDeleteCase,
  plansByCaseId = {},
}: NpsCaseTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (cases.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border border-dashed rounded-xl bg-card/30">
        Nenhum caso NPS encontrado para os filtros selecionados.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-[200px]">Cliente / Veículo</TableHead>
            <TableHead className="text-center">Marca</TableHead>
            <TableHead>Depto</TableHead>
            <TableHead className="text-center">Nota NPS</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((c) => {
            const isDetractor = c.nota <= 6
            const isExpanded = expandedId === c.id

            return (
              <>
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(c.id)}
                >
                  <TableCell className="font-medium">
                    <div className="text-foreground font-semibold">{c.cliente}</div>
                    {c.veiculo && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        {c.marca === 'Motorrad' ? (
                          <Bike className="w-3 h-3 text-primary inline" />
                        ) : (
                          <Car className="w-3 h-3 text-primary inline" />
                        )}
                        {c.veiculo}
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        c.marca === 'Motorrad'
                          ? 'border-orange-500/40 text-orange-400 bg-orange-500/10'
                          : 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                      }`}
                    >
                      {c.marca}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm font-medium">{c.departamento}</span>
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                        isDetractor
                          ? 'bg-destructive/20 text-destructive border border-destructive/50'
                          : 'bg-amber-500/20 text-amber-500 border border-amber-500/50'
                      }`}
                      title={
                        isDetractor ? 'Caso Detrator Crítico (≤ 6)' : 'Neutro / Promotor (> 6)'
                      }
                    >
                      {c.nota}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          c.status === 'Resolvido'
                            ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                            : c.status === 'Em Tratamento'
                              ? 'border-amber-500/50 text-amber-400 bg-amber-500/10'
                              : 'border-destructive/50 text-destructive bg-destructive/10'
                        }`}
                      >
                        {c.status}
                      </Badge>
                      {c.status !== 'Resolvido' && (plansByCaseId[c.id] ?? 0) === 0 && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] h-4 px-1.5 font-bold animate-pulse bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenPlans(c)
                          }}
                          title="Obrigatório plano de ação para casos críticos!"
                        >
                          Sem plano de ação
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {c.responsavel || 'Não atribuído'}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateBR(c.data)}
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant={(plansByCaseId[c.id] ?? 0) === 0 ? 'default' : 'outline'}
                        size="sm"
                        className={`h-8 gap-1 ${
                          (plansByCaseId[c.id] ?? 0) === 0
                            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm animate-pulse'
                            : 'border-primary/40 text-primary hover:bg-primary/10'
                        }`}
                        onClick={() => onOpenPlans(c)}
                        title="Abrir Planos de Ação e Análise IA"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {(plansByCaseId[c.id] ?? 0) === 0 ? 'Criar Plano' : 'Plano'}
                        </span>
                      </Button>

                      {canManage && onEditCase && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-muted"
                          onClick={() => onEditCase(c)}
                          title="Editar Caso"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      )}

                      {canManage && onDeleteCase && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteCase(c)}
                          title="Excluir Caso"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>

                {/* Linha expandida com comentários e observações */}
                {isExpanded && (
                  <TableRow className="bg-muted/15 border-b border-border/80">
                    <TableCell colSpan={8} className="py-3 px-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <MessageSquareWarning className="w-3.5 h-3.5 text-amber-500" />
                            Comentário do Cliente:
                          </span>
                          <p className="p-2.5 rounded-md bg-background/80 border border-border italic text-foreground">
                            {c.comentario || 'Nenhum comentário registrado.'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                            Observação de Insatisfação / Alinhamento Interno:
                          </span>
                          <p className="p-2.5 rounded-md bg-background/80 border border-border text-foreground">
                            {c.observacao_insatisfacao || 'Sem anotações complementares.'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
