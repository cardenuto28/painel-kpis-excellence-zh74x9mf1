import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useDataStore from '@/stores/use-data-store'
import logoUrl from '@/assets/bmweuromotorsjundiaibranco1-af726.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const { setRole } = useDataStore()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const lower = email.toLowerCase()
    if (lower.includes('admin')) {
      setRole('Admin')
    } else if (lower.includes('editor')) {
      setRole('Editor')
    } else {
      setRole('Visualizador')
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md border-border/50 bg-card/40 backdrop-blur-sm shadow-elevation">
        <CardHeader className="space-y-6 items-center">
          <div className="w-full h-24 bg-black rounded-lg p-4 flex flex-col items-center justify-center">
            <img
              src={logoUrl}
              alt="Euro Motors"
              className="w-full h-auto object-contain max-h-12 pointer-events-none"
            />
            <div className="text-[10px] text-white uppercase tracking-[0.2em] mt-2 font-display font-medium">
              Excellence Club
            </div>
          </div>
          <CardTitle className="text-2xl font-display text-center">Acesso ao Painel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label>Email Corporativo</Label>
              <Input
                type="email"
                placeholder="Ex: editor@euromotors.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use "admin" para gerenciar KPIs, "editor" para lançamentos, e qualquer outro para
                visualizar.
              </p>
            </div>
            <Button type="submit" className="w-full h-11 text-base">
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
