import { useData } from '@/stores/main'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function Settings() {
  const { role, setRole } = useData()

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Configurações (Mock)</h1>
        <p className="text-muted-foreground mt-2">Controles temporários para testar a aplicação.</p>
      </div>

      <div className="bg-card border border-border p-6 rounded-xl space-y-6">
        <h2 className="text-xl font-semibold border-b border-border pb-4">
          Simulação de Permissões
        </h2>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Modo Editor</Label>
            <p className="text-sm text-muted-foreground">
              Habilita a criação, edição e exclusão de meses e planos de ação.
            </p>
          </div>
          <Switch
            checked={role === 'editor'}
            onCheckedChange={(checked) => setRole(checked ? 'editor' : 'viewer')}
          />
        </div>
      </div>
    </div>
  )
}
