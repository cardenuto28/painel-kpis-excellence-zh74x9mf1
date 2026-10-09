import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import logoUrl from '@/assets/image-f74b6.png'
import { toast } from 'sonner'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const { signIn, signUp, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password)
    if (error) {
      toast.error(
        isSignUp
          ? 'Erro ao cadastrar. Tente novamente.'
          : 'Credenciais inválidas. Verifique seu email e senha.',
      )
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <Card className="w-full max-w-md border-border/50 bg-card/40 backdrop-blur-sm shadow-elevation">
        <CardHeader className="space-y-6 items-center">
          <div className="w-full h-24 bg-black rounded-lg p-4 flex flex-col items-center justify-center">
            <img
              src={logoUrl}
              alt="PGPrime"
              className="w-full h-auto object-contain max-h-10 pointer-events-none invert brightness-200"
            />
            <div className="text-[10px] text-white uppercase tracking-[0.2em] mt-2 font-display font-medium">
              Excellence Club
            </div>
          </div>
          <CardTitle className="text-2xl font-display text-center">
            {isSignUp ? 'Criar Conta' : 'Acesso ao Painel'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label>Email Corporativo</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading
                ? isSignUp
                  ? 'Cadastrando...'
                  : 'Entrando...'
                : isSignUp
                  ? 'Cadastrar'
                  : 'Entrar'}
            </Button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
