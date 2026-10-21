import React, { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'

interface MarkdownRendererProps {
  content: string
}

// Renderiza inline com formatação de negrito, código, badges de nota/status
function renderInlineFormatting(text: string): React.ReactNode {
  // Dividir por negrito **...**
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2)
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {inner}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1)
      return (
        <code
          key={idx}
          className="bg-muted px-1.5 py-0.5 rounded text-[11px] font-mono text-primary border border-border"
        >
          {inner}
        </code>
      )
    }

    // Identificar badges visuais automáticos para notas e status no texto
    return renderWordBadges(part, idx)
  })
}

function renderWordBadges(text: string, parentIdx: number): React.ReactNode {
  // Substituir termos de status e notas se coincidirem exatamente
  const tokens = text.split(
    /(\b(?:Pendente|Em Tratamento|Resolvido|Concluído|Detrator|Neutro|Promotor)\b)/g,
  )
  if (tokens.length === 1) return text

  return tokens.map((token, tIdx) => {
    const key = `${parentIdx}-${tIdx}`
    if (token === 'Resolvido' || token === 'Concluído') {
      return (
        <Badge
          key={key}
          variant="outline"
          className="mx-1 h-5 px-1.5 text-[10px] border-emerald-500/40 text-emerald-500 bg-emerald-500/10 inline-flex items-center"
        >
          {token}
        </Badge>
      )
    }
    if (token === 'Em Tratamento' || token === 'Neutro') {
      return (
        <Badge
          key={key}
          variant="outline"
          className="mx-1 h-5 px-1.5 text-[10px] border-amber-500/40 text-amber-500 bg-amber-500/10 inline-flex items-center"
        >
          {token}
        </Badge>
      )
    }
    if (token === 'Pendente' || token === 'Detrator') {
      return (
        <Badge
          key={key}
          variant="outline"
          className="mx-1 h-5 px-1.5 text-[10px] border-destructive/40 text-destructive bg-destructive/10 inline-flex items-center"
        >
          {token}
        </Badge>
      )
    }
    if (token === 'Promotor') {
      return (
        <Badge
          key={key}
          variant="outline"
          className="mx-1 h-5 px-1.5 text-[10px] border-blue-500/40 text-blue-500 bg-blue-500/10 inline-flex items-center"
        >
          {token}
        </Badge>
      )
    }
    return token
  })
}

// Renderiza tabela Markdown completa
function renderMarkdownTable(tableLines: string[], tableKey: number) {
  if (tableLines.length < 2) return null

  // Linha 0 = headers, Linha 1 = divisor (|---|---|), Linha 2+ = rows
  const parseRow = (line: string) => {
    return line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim())
  }

  const headers = parseRow(tableLines[0])
  const dataRows = tableLines.slice(2).map(parseRow)

  return (
    <div
      key={`table-${tableKey}`}
      className="my-3 overflow-x-auto rounded-xl border border-border/80 bg-card/90 shadow-sm"
    >
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className="py-2 px-3 font-semibold whitespace-nowrap">
                {renderInlineFormatting(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-muted/40 transition-colors group">
              {row.map((cell, cIdx) => {
                // Verificar se é nota numérica (0 a 10)
                const isNumericGrade = /^\d{1,2}$/.test(cell)
                const gradeNum = isNumericGrade ? Number(cell) : null

                return (
                  <td key={cIdx} className="py-2.5 px-3 text-foreground align-middle">
                    {gradeNum !== null ? (
                      <span
                        className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-[11px] ${
                          gradeNum <= 6
                            ? 'bg-destructive/15 text-destructive border border-destructive/30'
                            : gradeNum <= 8
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        }`}
                      >
                        {gradeNum}
                      </span>
                    ) : (
                      renderInlineFormatting(cell)
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderedElements = useMemo(() => {
    if (!content) return null

    const lines = content.split('\n')
    const elements: React.ReactNode[] = []

    let currentTableLines: string[] = []
    let inTable = false

    const flushTable = (k: number) => {
      if (currentTableLines.length > 0) {
        elements.push(renderMarkdownTable(currentTableLines, k))
        currentTableLines = []
      }
      inTable = false
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Detecção de linha de tabela Markdown: começa e termina com | ou contém múltiplos |
      const isTableLine = trimmed.startsWith('|') && trimmed.includes('|')

      if (isTableLine) {
        inTable = true
        currentTableLines.push(trimmed)
        continue
      } else {
        if (inTable) {
          flushTable(i)
        }
      }

      // Linha vazia
      if (!trimmed) {
        elements.push(<div key={`empty-${i}`} className="h-2" />)
        continue
      }

      // Título H1 ou H2 (###, ##, #)
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4
            key={`h4-${i}`}
            className="text-xs sm:text-sm font-bold text-foreground mt-3 mb-1 flex items-center gap-1.5"
          >
            {renderInlineFormatting(trimmed.slice(4))}
          </h4>,
        )
        continue
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3
            key={`h3-${i}`}
            className="text-sm sm:text-base font-bold text-foreground mt-3.5 mb-1.5 pb-1 border-b border-border/60"
          >
            {renderInlineFormatting(trimmed.slice(3))}
          </h3>,
        )
        continue
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h2
            key={`h2-${i}`}
            className="text-base sm:text-lg font-bold text-primary mt-4 mb-2 pb-1 border-b border-primary/20"
          >
            {renderInlineFormatting(trimmed.slice(2))}
          </h2>,
        )
        continue
      }

      // Item de lista não-ordenada (- ou *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <div
            key={`list-item-${i}`}
            className="flex items-start gap-2 my-1 text-xs sm:text-sm leading-relaxed text-foreground pl-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1">{renderInlineFormatting(trimmed.slice(2))}</div>
          </div>,
        )
        continue
      }

      // Item de lista numerada (1. 2. 3.)
      const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/)
      if (numberedMatch) {
        const num = numberedMatch[1]
        const text = numberedMatch[2]
        elements.push(
          <div
            key={`num-item-${i}`}
            className="flex items-start gap-2 my-1 text-xs sm:text-sm leading-relaxed text-foreground pl-1"
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] shrink-0 mt-0.5">
              {num}
            </span>
            <div className="flex-1">{renderInlineFormatting(text)}</div>
          </div>,
        )
        continue
      }

      // Parágrafo comum
      elements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm leading-relaxed text-foreground my-1">
          {renderInlineFormatting(trimmed)}
        </p>,
      )
    }

    if (inTable) {
      flushTable(lines.length)
    }

    return elements
  }, [content])

  return <div className="space-y-0.5 text-xs sm:text-sm">{renderedElements}</div>
}
