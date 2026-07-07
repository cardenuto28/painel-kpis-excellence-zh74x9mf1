import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useDataStore from '@/stores/use-data-store'
import logoUrl from '@/assets/bmw-euro-motors-jundiai-branco-04826.pdf'

export default function Login() {
  const [email, setEmail] = useState('')
  const { setRole } = useDataStore()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.toLowerCase().includes('editor')) {
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
            <embed
              src={`${logoUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              className="w-full h-12 pointer-events-none"
            />
            <div className="text-[10px] text-white uppercase tracking-[0.2em] mt-2 font-display">
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
                Para ter permissão total, use um email que contenha a palavra "editor".
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
