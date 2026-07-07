import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import useDataStore from '@/stores/use-data-store'
import { useNavigate } from 'react-router-dom'
import { MONTH_NAMES } from '@/lib/kpi-definitions'

export default function History() {
  const { months, role, deleteMonth } = useDataStore()
  const navigate = useNavigate()

  const sortedMonths = useMemo(() => {
    return [...months].sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano
      return MONTH_NAMES.indexOf(b.mes) - MONTH_NAMES.indexOf(a.mes)
    })
  }, [months])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Histórico de Meses</h2>
        <div className="flex gap-2">
          <Button variant="secondary" className="gap-2" onClick={() => navigate('/import')}>
            <Upload className="w-4 h-4" /> Importar Dados
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Período</TableHead>
                <TableHead>Ranking</TableHead>
                <TableHead className="text-right">Score Euro Motors</TableHead>
                <TableHead className="text-right">Score Top Dealer</TableHead>
                <TableHead>Gap</TableHead>
                {role === 'Editor' && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMonths.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                sortedMonths.map((m) => (
                  <TableRow key={m.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {m.mes} {m.ano}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-card text-foreground">
                        {m.ranking}º lugar
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-display font-bold text-primary">
                      {m.totalScore}
                    </TableCell>
                    <TableCell className="text-right font-display text-muted-foreground">
                      {m.topDealerTotal}
                    </TableCell>
                    <TableCell>
                      <span className="text-secondary font-medium">
                        -{m.topDealerTotal - m.totalScore}
                      </span>
                    </TableCell>
                    {(role === 'Editor' || role === 'Admin') && (
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/entry/${m.id}`)}
                        >
                          <Edit className="w-4 h-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            deleteMonth(m.id).catch(() => toast.error('Erro ao excluir registro.'))
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
