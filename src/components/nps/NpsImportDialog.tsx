import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createNpsCase } from '@/services/nps'
import { toast } from 'sonner'
import { Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { NpsBrand, NpsDepartment, NpsCaseStatus } from '@/types/nps'

interface NpsImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportCompleted: () => void
}

interface ParsedNpsRow {
  cliente: string
  marca: NpsBrand
  veiculo: string
  data: string
  departamento: NpsDepartment
  nota: number
  comentario: string
  status: NpsCaseStatus
  responsavel: string
  observacao_insatisfacao: string
  isValid: boolean
  errors: string[]
  rawLine: string
}

export function NpsImportDialog({ open, onOpenChange, onImportCompleted }: NpsImportDialogProps) {
  const [inputText, setInputText] = useState('')
  const [parsedRows, setParsedRows] = useState<ParsedNpsRow[]>([])
  const [hasPreview, setHasPreview] = useState(false)
  const [importing, setImporting] = useState(false)

  // Modelo de colunas:
  // Cliente | Marca (BMW/Motorrad) | Veiculo | Data (YYYY-MM-DD ou DD/MM/YYYY) | Depto (Vendas/Pós-Vendas) | Nota (0-10) | Comentario | Status | Responsavel | Observacao
  const parseLines = (text: string): ParsedNpsRow[] => {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    return lines.map((line) => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(';')
      const errors: string[] = []

      const cliente = parts[0]?.trim() || ''
      const rawMarca = parts[1]?.trim() || 'BMW'
      const marca: NpsBrand =
        rawMarca.toLowerCase().includes('motorrad') || rawMarca.toLowerCase().includes('moto')
          ? 'Motorrad'
          : 'BMW'

      const veiculo = parts[2]?.trim() || ''
      let rawData = parts[3]?.trim() || ''
      let data = ''

      // Validação de data: aceita DD/MM/YYYY ou YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawData)) {
        data = rawData
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawData)) {
        const [d, m, y] = rawData.split('/')
        data = `${y}-${m}-${d}`
      } else {
        data = new Date().toISOString().slice(0, 10)
      }

      const rawDepto = parts[4]?.trim() || 'Pós-Vendas'
      const departamento: NpsDepartment = rawDepto.toLowerCase().includes('venda')
        ? rawDepto.toLowerCase().includes('pós')
          ? 'Pós-Vendas'
          : 'Vendas'
        : 'Pós-Vendas'

      const rawNota = Number(parts[5]?.trim()?.replace(',', '.'))
      const nota = isNaN(rawNota) ? 5 : Math.max(0, Math.min(10, rawNota))

      const comentario = parts[6]?.trim() || ''
      const rawStatus = parts[7]?.trim() || 'Pendente'
      let status: NpsCaseStatus = 'Pendente'
      if (rawStatus.toLowerCase().includes('resolv')) status = 'Resolvido'
      else if (
        rawStatus.toLowerCase().includes('tratam') ||
        rawStatus.toLowerCase().includes('andamento')
      )
        status = 'Em Tratamento'

      const responsavel = parts[8]?.trim() || ''
      const observacao_insatisfacao = parts[9]?.trim() || ''

      if (!cliente) errors.push('Nome do cliente ausente')
      if (isNaN(rawNota)) errors.push('Nota numérica inválida')

      return {
        cliente,
        marca,
        veiculo,
        data,
        departamento,
        nota,
        comentario,
        status,
        responsavel,
        observacao_insatisfacao,
        isValid: errors.length === 0,
        errors,
        rawLine: line,
      }
    })
  }

  const handlePreview = () => {
    if (!inputText.trim()) {
      toast.error('Cole os dados no campo de texto')
      return
    }
    const rows = parseLines(inputText)
    setParsedRows(rows)
    setHasPreview(true)
  }

  const handleImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid)
    if (validRows.length === 0) {
      toast.error('Nenhuma linha válida para importar')
      return
    }

    setImporting(true)
    let importedCount = 0
    let failedCount = 0

    try {
      for (const row of validRows) {
        try {
          await createNpsCase({
            cliente: row.cliente,
            marca: row.marca,
            veiculo: row.veiculo,
            data: row.data,
            departamento: row.departamento,
            nota: row.nota,
            comentario: row.comentario,
            status: row.status,
            responsavel: row.responsavel,
            observacao_insatisfacao: row.observacao_insatisfacao,
          })
          importedCount++
        } catch (_) {
          failedCount++
        }
      }

      toast.success(`${importedCount} casos NPS importados com sucesso!`)
      if (failedCount > 0) {
        toast.warning(`${failedCount} casos falharam durante a inserção.`)
      }
      onOpenChange(false)
      onImportCompleted()
      setInputText('')
      setParsedRows([])
      setHasPreview(false)
    } catch (err: any) {
      toast.error('Erro na importação em lote')
    } finally {
      setImporting(false)
    }
  }

  // Exportar relatório de erros em CSV
  const handleExportErrorsCSV = () => {
    const invalidRows = parsedRows.filter((r) => !r.isValid)
    if (invalidRows.length === 0) {
      toast.info('Não há erros para exportar')
      return
    }

    const header = 'Linha Original,Erros Encontrados\n'
    const content = invalidRows
      .map((r) => `"${r.rawLine.replace(/"/g, '""')}","${r.errors.join('; ')}"`)
      .join('\n')

    const blob = new Blob([header + content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'erros-importacao-nps.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Arquivo erros-importacao-nps.csv baixado com sucesso!')
  }

  const validCount = parsedRows.filter((r) => r.isValid).length
  const invalidCount = parsedRows.filter((r) => !r.isValid).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Importar Histórico de Casos NPS
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-muted/40 p-3 rounded-lg border border-border text-xs space-y-1.5">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-primary" /> Formato das Colunas (separadas
              por TAB ou ponto-e-vírgula):
            </span>
            <p className="font-mono text-muted-foreground text-[11px] overflow-x-auto pb-1">
              Cliente [TAB] Marca (BMW/Motorrad) [TAB] Veículo [TAB] Data (YYYY-MM-DD ou DD/MM/AAAA)
              [TAB] Depto (Vendas/Pós-Vendas) [TAB] Nota (0-10) [TAB] Comentário [TAB] Status [TAB]
              Responsável [TAB] Observação
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Cole as linhas da planilha Excel / CSV:</label>
            <Textarea
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Exemplo:&#10;Carlos Silveira	BMW	320i M Sport	2025-01-15	Pós-Vendas	4	Demora na revisão	Em Tratamento	Marcos	Revisão atrasou"
              className="font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              Validar e Pré-visualizar Linhas
            </Button>

            {hasPreview && invalidCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleExportErrorsCSV}
                className="gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar erros-importacao-nps.csv ({invalidCount})
              </Button>
            )}
          </div>

          {hasPreview && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Total de linhas lidas: <strong>{parsedRows.length}</strong>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} válidas
                  </span>
                  {invalidCount > 0 && (
                    <span className="text-destructive flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> {invalidCount} com erro
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border rounded-lg text-xs">
                {parsedRows.slice(0, 20).map((r, i) => (
                  <div
                    key={i}
                    className={`p-2 border-b last:border-b-0 flex items-center justify-between ${
                      r.isValid ? 'bg-background' : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    <span className="truncate flex-1 font-mono">
                      {r.cliente || 'Sem nome'} • {r.marca} • {r.departamento} • Nota {r.nota} •{' '}
                      {r.data}
                    </span>
                    {!r.isValid && (
                      <span className="text-[11px] font-semibold ml-2 shrink-0">
                        {r.errors.join(', ')}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing || validCount === 0}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {importing ? 'Importando casos...' : `Importar ${validCount} Casos Válidos`}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
