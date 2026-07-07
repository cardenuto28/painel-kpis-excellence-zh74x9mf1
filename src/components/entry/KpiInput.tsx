import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { KpiDef } from '@/lib/kpi-definitions'

interface KpiInputProps {
  kpi: KpiDef
  value: any
  onChange: (value: any) => void
}

export function KpiInput({ kpi, value, onChange }: KpiInputProps) {
  if (kpi.type === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase">{value ? 'Sim' : 'Não'}</span>
        <Switch checked={!!value} onCheckedChange={onChange} />
      </div>
    )
  }

  if (kpi.type === 'treinamentos') {
    const v = value || { vendas: 0, pos: 0, tecnico: 0 }
    const fields: [string, string][] = [
      ['vendas', 'Vendas'],
      ['pos', 'Pós'],
      ['tecnico', 'Técnico'],
    ]
    return (
      <div className="flex gap-3 w-full sm:w-auto">
        {fields.map(([key, label]) => (
          <div key={key} className="space-y-1">
            <Label className="text-[10px] uppercase text-muted-foreground">{label}</Label>
            <Input
              type="number"
              className="w-full sm:w-16 h-8 text-center px-1"
              value={v[key] ?? ''}
              onChange={(e) => onChange({ ...v, [key]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>
    )
  }

  if (kpi.type === 'voc') {
    const v = value || { nps: 0, failedSubIndicators: 0 }
    return (
      <div className="flex gap-3 w-full sm:w-auto">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">NPS</Label>
          <Input
            type="number"
            step="0.1"
            className="w-full sm:w-20 h-8 px-2"
            value={v.nps ?? ''}
            onChange={(e) => onChange({ ...v, nps: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">Falhas (0-5)</Label>
          <Input
            type="number"
            min="0"
            max="5"
            className="w-full sm:w-20 h-8 px-2"
            value={v.failedSubIndicators ?? ''}
            onChange={(e) => onChange({ ...v, failedSubIndicators: Number(e.target.value) })}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full sm:w-28">
      <Input
        type="number"
        step="0.01"
        className="pr-8 text-right font-mono"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {kpi.type === 'percentage' && (
        <span className="absolute right-3 top-2.5 text-muted-foreground text-sm">%</span>
      )}
    </div>
  )
}
