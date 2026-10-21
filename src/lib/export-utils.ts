import { KpiDef, MONTH_NAMES, KPI_CATEGORIES } from '@/lib/kpi-definitions'

export function exportMonthRecordsCSV(months: any[], kpis: KpiDef[]): void {
  const headers = [
    'Mês',
    'Ano',
    'Ranking',
    'Score PG Prime',
    'Score Top Dealer',
    'Gap',
    ...kpis.map((k) => k.name),
  ]

  const sortedMonths = [...months].sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano
    return MONTH_NAMES.indexOf(b.mes) - MONTH_NAMES.indexOf(a.mes)
  })

  const rows = sortedMonths.map((m) => {
    const gap = m.topDealerTotal - m.totalScore
    const kpiValues = kpis.map((k) => m.points?.[k.id] ?? 0)
    return [m.mes, m.ano, m.ranking, m.totalScore, m.topDealerTotal, gap, ...kpiValues]
  })

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `historico-kpis-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportMonthPDF(month: any, kpis: KpiDef[]): void {
  const gap = month.topDealerTotal - month.totalScore
  const categories: Record<string, { kpis: KpiDef[]; total: number; max: number }> = {}

  kpis.forEach((kpi) => {
    if (!categories[kpi.category]) {
      categories[kpi.category] = { kpis: [], total: 0, max: 0 }
    }
    categories[kpi.category].kpis.push(kpi)
    categories[kpi.category].total += month.points?.[kpi.id] ?? 0
    categories[kpi.category].max += kpi.maxPoints
  })

  const categoryRows = Object.entries(categories)
    .map(
      ([cat, data]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${cat}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-family:monospace;">${data.total} / ${data.max}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">
          <div style="background:#f3f4f6;border-radius:4px;height:8px;width:120px;overflow:hidden;display:inline-block;">
            <div style="background:${data.total >= data.max * 0.8 ? '#22c55e' : data.total >= data.max * 0.5 ? '#f59e0b' : '#ef4444'};height:100%;width:${(data.total / data.max) * 100}%;border-radius:4px;"></div>
          </div>
        </td>
      </tr>`,
    )
    .join('')

  const kpiRows = kpis
    .map((kpi) => {
      const pts = month.points?.[kpi.id] ?? 0
      const kpiGap = kpi.maxPoints - pts
      const color = pts >= kpi.maxPoints ? '#22c55e' : pts === 0 ? '#ef4444' : '#3b82f6'
      return `
      <tr>
        <td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;">${kpi.name}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;font-size:11px;color:#6b7280;text-transform:uppercase;">${kpi.category}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-family:monospace;font-weight:600;color:${color};">${pts} / ${kpi.maxPoints}</td>
        <td style="padding:6px 12px;border-bottom:1px solid #f3f4f6;text-align:right;font-family:monospace;color:${kpiGap > 0 ? '#ef4444' : '#6b7280'};">${kpiGap > 0 ? `-${kpiGap}` : '-'}</td>
      </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Mensal - ${month.mes} ${month.ano}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1f2937; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div style="margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #1f2937;padding-bottom:16px;">
      <div>
        <h1 style="font-size:24px;font-weight:700;">PG Prime</h1>
        <p style="font-size:14px;color:#6b7280;margin-top:4px;">Excellence Club BMW · Relatório de Performance</p>
      </div>
      <div style="text-align:right;">
        <p style="font-size:20px;font-weight:700;">${month.mes} ${month.ano}</p>
        <p style="font-size:12px;color:#6b7280;">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:32px;">
    <div style="background:#f9fafb;border-radius:12px;padding:20px;border:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Score PG Prime</p>
      <p style="font-size:36px;font-weight:700;color:#3b82f6;">${month.totalScore}</p>
    </div>
    <div style="background:#f9fafb;border-radius:12px;padding:20px;border:1px solid #e5e7eb;">
      <p style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Top Dealer</p>
      <p style="font-size:36px;font-weight:700;color:#6b7280;">${month.topDealerTotal}</p>
    </div>
    <div style="background:#fef3c7;border-radius:12px;padding:20px;border:1px solid #fcd34d;">
      <p style="font-size:12px;color:#92400e;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Gap para 1º Lugar</p>
      <p style="font-size:36px;font-weight:700;color:#d97706;">-${gap}</p>
    </div>
  </div>

  <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:32px;border:1px solid #e5e7eb;">
    <p style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Ranking Nacional</p>
    <p style="font-size:28px;font-weight:700;">${month.ranking}º lugar</p>
  </div>

  <h2 style="font-size:16px;font-weight:600;margin-bottom:12px;">Pontuação por Categoria</h2>
  <table style="width:100%;border-collapse:collapse;margin-bottom:32px;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="padding:8px 12px;text-align:left;font-size:13px;">Categoria</th>
        <th style="padding:8px 12px;text-align:right;font-size:13px;">Pontos</th>
        <th style="padding:8px 12px;text-align:right;font-size:13px;">Progresso</th>
      </tr>
    </thead>
    <tbody>${categoryRows}</tbody>
  </table>

  <h2 style="font-size:16px;font-weight:600;margin-bottom:12px;">Detalhamento por KPI</h2>
  <table style="width:100%;border-collapse:collapse;">
    <thead>
      <tr style="background:#f3f4f6;">
        <th style="padding:8px 12px;text-align:left;font-size:13px;">Indicador</th>
        <th style="padding:8px 12px;text-align:left;font-size:13px;">Categoria</th>
        <th style="padding:8px 12px;text-align:right;font-size:13px;">Pontos</th>
        <th style="padding:8px 12px;text-align:right;font-size:13px;">Gap</th>
      </tr>
    </thead>
    <tbody>${kpiRows}</tbody>
  </table>

  <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e5e7eb;">
    <p style="font-size:11px;color:#9ca3af;text-align:center;">
      PG Prime · Excellence Club BMW · Documento gerado automaticamente
    </p>
  </div>
</body>
</html>`

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}

export function exportMonthReportCSV(month: any, kpis: KpiDef[], actionPlans: any[]): void {
  const lines: string[] = []
  const gap = month.topDealerTotal - month.totalScore

  lines.push('RELATÓRIO MENSAL DE KPIs')
  lines.push('')
  lines.push('Mês,Ano,Ranking,Score Total,Top Dealer,Gap')
  lines.push(
    `${month.mes},${month.ano},${month.ranking},${month.totalScore},${month.topDealerTotal},${gap}`,
  )
  lines.push('')

  lines.push('PONTUAÇÃO POR CATEGORIA')
  lines.push('')
  lines.push('Categoria,Pontos')
  KPI_CATEGORIES.forEach((cat) => {
    lines.push(`"${cat}",${month.categoryScores?.[cat] ?? 0}`)
  })
  lines.push('')

  lines.push('DETALHAMENTO DE KPIs')
  lines.push('')
  lines.push('KPI,Categoria,Pontos,Máximo,Gap,Valor Realizado')
  kpis.forEach((kpi) => {
    const pts = month.points?.[kpi.id] ?? 0
    const kpiGap = kpi.maxPoints - pts
    const rawVal = month.rawValues?.[kpi.id] ?? ''
    const rawStr = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal)
    lines.push(`"${kpi.name}","${kpi.category}",${pts},${kpi.maxPoints},${kpiGap},"${rawStr}"`)
  })
  lines.push('')

  const monthPlans = actionPlans.filter((p: any) => p.monthId === month.id)
  lines.push('PLANOS DE AÇÃO')
  lines.push('')
  if (monthPlans.length === 0) {
    lines.push('Nenhum plano de ação cadastrado para este mês.')
  } else {
    lines.push('KPI,Descrição,Responsável,Prazo,Status')
    monthPlans.forEach((p: any) => {
      const kpi = kpis.find((k) => k.id === p.kpiId)
      lines.push(
        `"${kpi?.name || p.kpiId}","${String(p.description).replace(/"/g, '""')}","${p.responsible}","${p.dueDate || ''}","${p.status}"`,
      )
    })
  }

  const csvContent = lines.join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Relatorio_KPI_${month.mes}_${month.ano}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
