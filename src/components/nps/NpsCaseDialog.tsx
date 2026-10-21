import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createNpsCase, updateNpsCase } from '@/services/nps'
import { toast } from 'sonner'
import { ShieldAlert, Car } from 'lucide-react'
import type { NpsCase, NpsBrand, NpsDepartment, NpsCaseStatus } from '@/types/nps'

interface NpsCaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCase?: NpsCase | null
  onSaved: () => void
}

export function NpsCaseDialog({ open, onOpenChange, initialCase, onSaved }: NpsCaseDialogProps) {
  const [cliente, setCliente] = useState('')
  const [marca, setMarca] = useState<NpsBrand>('BMW')
  const [veiculo, setVeiculo] = useState('')
  const [data, setData] = useState('')
  const [departamento, setDepartamento] = useState<NpsDepartment>('Pós-Vendas')
  const [nota, setNota] = useState<number>(5)
  const [comentario, setComentario] = useState('')
  const [status, setStatus] = useState<NpsCaseStatus>('Pendente')
  const [responsavel, setResponsavel] = useState('')
  const [observacao, setObservacao] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initialCase) {
      setCliente(initialCase.cliente || '')
      setMarca(initialCase.marca || 'BMW')
      setVeiculo(initialCase.veiculo || '')
      setData(initialCase.data ? initialCase.data.slice(0, 10) : '')
      setDepartamento(initialCase.departamento || 'Pós-Vendas')
      setNota(initialCase.nota ?? 5)
      setComentario(initialCase.comentario || '')
      setStatus(initialCase.status || 'Pendente')
      setResponsavel(initialCase.responsavel || '')
      setObservacao(initialCase.observacao_insatisfacao || '')
    } else {
      setCliente('')
      setMarca('BMW')
      setVeiculo('')
      setData(new Date().toISOString().slice(0, 10))
      setDepartamento('Pós-Vendas')
      setNota(5)
      setComentario('')
      setStatus('Pendente')
      setResponsavel('')
      setObservacao('')
    }
  }, [initialCase, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cliente.trim()) {
      toast.error('O nome do cliente é obrigatório')
      return
    }
    if (!data) {
      toast.error('Informe a data do caso')
      return
    }

    setSubmitting(true)
    try {
      const payload: Partial<NpsCase> = {
        cliente: cliente.trim(),
        marca,
        veiculo: veiculo.trim(),
        data,
        departamento,
        nota: Number(nota),
        comentario: comentario.trim(),
        status,
        responsavel: responsavel.trim(),
        observacao_insatisfacao: observacao.trim(),
      }

      if (initialCase?.id) {
        await updateNpsCase(initialCase.id, payload)
        toast.success('Caso NPS atualizado com sucesso!')
      } else {
        await createNpsCase(payload)
        toast.success('Novo caso NPS cadastrado e vetorizado!')
      }
      onOpenChange(false)
      onSaved()
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar caso NPS')
    } finally {
      setSubmitting(false)
    }
  }

  const isDetractor = Number(nota) <= 6

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            {initialCase ? 'Editar Caso NPS Crítico' : 'Novo Caso NPS Crítico'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Nome do Cliente *</Label>
              <Input
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silveira"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="veiculo">Veículo / Modelo</Label>
              <Input
                id="veiculo"
                value={veiculo}
                onChange={(e) => setVeiculo(e.target.value)}
                placeholder="Ex: BMW 320i M Sport / R 1300 GS"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Marca *</Label>
              <Select value={marca} onValueChange={(v) => setMarca(v as NpsBrand)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BMW">BMW Auto</SelectItem>
                  <SelectItem value="Motorrad">BMW Motorrad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Departamento *</Label>
              <Select
                value={departamento}
                onValueChange={(v) => setDepartamento(v as NpsDepartment)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vendas">Vendas</SelectItem>
                  <SelectItem value="Pós-Vendas">Pós-Vendas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data do Feedback *</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nota" className="flex items-center justify-between">
                <span>Nota NPS *</span>
                {isDetractor && (
                  <span className="text-[10px] text-destructive flex items-center font-bold">
                    <ShieldAlert className="w-3 h-3 mr-0.5" /> Detrator
                  </span>
                )}
              </Label>
              <Input
                id="nota"
                type="number"
                min={0}
                max={10}
                value={nota}
                onChange={(e) => setNota(Number(e.target.value))}
                required
                className={isDetractor ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status do Caso *</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as NpsCaseStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Tratamento">Em Tratamento</SelectItem>
                  <SelectItem value="Resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável pelo Atendimento</Label>
              <Input
                id="responsavel"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Ex: Marcos Silva (Consultor)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentario">Comentário / Relato do Cliente</Label>
            <Textarea
              id="comentario"
              rows={3}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Descreva as palavras exatas ou resumo da insatisfação do cliente..."
            />
            <p className="text-[11px] text-muted-foreground">
              O backend gera automaticamente o embedding semântico deste comentário para cruzamento
              de padrões recorrentes e suporte do Analista IA.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao">Observação Interna de Insatisfação</Label>
            <Textarea
              id="observacao"
              rows={2}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Causa raiz identificada, falha operacional ou alinhamento com a diretoria..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : initialCase ? 'Atualizar Caso' : 'Criar Caso NPS'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
