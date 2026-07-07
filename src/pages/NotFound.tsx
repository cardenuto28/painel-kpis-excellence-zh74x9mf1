import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Ops! A página não foi encontrada.</p>
        <Button asChild>
          <Link to="/">Voltar para o Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
