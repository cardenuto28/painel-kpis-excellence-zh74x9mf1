import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'

export function PersistenceNotice() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-2.5 animate-fade-in">
      <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
      <p className="text-xs text-muted-foreground flex-1">
        <span className="text-orange-500 font-medium">Modo Local:</span> Os dados são salvos apenas
        neste navegador. Conecte um backend (Supabase ou Skip Cloud) para persistir e sincronizar
        entre dispositivos.
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
