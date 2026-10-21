import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import useDataStore from '@/stores/use-data-store'
import { useRealtime } from '@/hooks/use-realtime'
import { getNpsCases, getLatestWeeklyStats, deleteNpsCase } from '@/services/nps'
import { NpsWeeklyCards } from '@/components/nps/NpsWeeklyCards'
import { NpsKpiCards } from '@/components/nps/NpsKpiCards'
import { NpsCaseTable } from '@/components/nps/NpsCaseTable'
import { NpsCaseDialog } from '@/components/nps/NpsCaseDialog'
import { NpsActionPlanDialog } from '@/components/nps/NpsActionPlanDialog'
import { NpsImportDialog } from '@/components/nps/NpsImportDialog'
import { NpsAiAnalystDialog } from '@/components/nps/NpsAiAnalystDialog'
import { toast } from 'sonner'
import { Plus, Upload, Bot, Search, Filter, Sparkles, RefreshCw, X } from 'lucide-react'
import type { NpsCase, NpsWeeklyStat, NpsBrand, NpsDepartment, NpsKpiSummary } from '@/types/nps'

export default function NpsCasesPage() {
  const { role } = useDataStore()
  const canManage = role === 'Admin' || role === 'Editor'

  const [cases, setCases] = useState<NpsCase[]>([])
  const [weeklyStats, setWeeklyStats] = useState<Record<string, NpsWeeklyStat>>({})
  const [loading, setLoading] = useState(true)

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<'all' | NpsBrand>('all')
  const [selectedDept, setSelectedDept] = useState<'all' | NpsDepartment>('all')
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  // Modais
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false)
  const [selectedCaseForEdit, setSelectedCaseForEdit] = useState<NpsCase | null>(null)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [selectedCaseForPlans, setSelectedCaseForPlans] = useState<NpsCase | null>(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  // Carregar dados
  const loadAllData = useCallback(async () => {
    try {
      const [casesData, statsData] = await Promise.all([
        getNpsCases().catch(() => []),
        getLatestWeeklyStats().catch(() => ({})),
      ])
      setCases(casesData)
      setWeeklyStats(statsData)
    } catch (err: any) {
      console.error('Erro ao carregar dados NPS:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Realtime updates para nps_cases, nps_weekly_stats e nps_action_plans
  useRealtime('nps_cases', () => {
    loadAllData()
  })
  useRealtime('nps_weekly_stats', () => {
    loadAllData()
  })
  useRealtime('nps_action_plans', () => {
    loadAllData()
  })

  // Ação ao clicar em um card semanal (filtra a tabela)
  const handleSegmentCardClick = (brand: 'BMW' | 'Motorrad', department: NpsDepartment) => {
    setSelectedBrand(brand)
    setSelectedDept(department)
    toast.info(`Filtrando casos por ${brand} • ${department}`)
  }

  // Ação ao clicar em um KPI Card (muda aba de ativos/histórico)
  const handleKpiCardClick = (type: 'all' | 'pending' | 'resolved') => {
    if (type === 'resolved') {
      setActiveTab('history')
    } else {
      setActiveTab('active')
    }
  }

  // Filtragem dos casos
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Aba: ativos vs histórico
      const isResolved = c.status === 'Resolvido'
      if (activeTab === 'active' && isResolved) return false
      if (activeTab === 'history' && !isResolved) return false

      // Marca
      if (selectedBrand !== 'all' && c.marca !== selectedBrand) return false

      // Depto
      if (selectedDept !== 'all' && c.departamento !== selectedDept) return false

      // Busca texto (cliente ou responsável ou veiculo)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesClient = c.cliente.toLowerCase().includes(query)
        const matchesResp = (c.responsavel || '').toLowerCase().includes(query)
        const matchesVeic = (c.veiculo || '').toLowerCase().includes(query)
        if (!matchesClient && !matchesResp && !matchesVeic) return false
      }

      return true
    })
  }, [cases, activeTab, selectedBrand, selectedDept, searchQuery])

  // Resumo de KPIs do NPS
  const kpiSummary = useMemo<NpsKpiSummary>(() => {
    const totalCritical = cases.length
    const detractorsCount = cases.filter((c) => c.nota <= 6).length
    const resolvedCount = cases.filter((c) => c.status === 'Resolvido').length
    const pendingCount = totalCritical - resolvedCount
    const resolutionRate = totalCritical > 0 ? Math.round((resolvedCount / totalCritical) * 100) : 0

    // Cálculo do tempo médio de resolução (dias entre criação e update do caso resolvido)
    let totalResolutionDays = 0
    let resolvedWithDates = 0
    for (const c of cases) {
      if (c.status === 'Resolvido') {
        const start = new Date(c.data || c.created)
        const end = new Date(c.updated || c.created)
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diffDays = Math.max(
            0,
            Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
          )
          totalResolutionDays += diffDays
          resolvedWithDates++
        }
      }
    }
    const avgResolutionDays =
      resolvedWithDates > 0 ? Math.round(totalResolutionDays / resolvedWithDates) : 0

    return {
      totalCritical,
      detractorsCount,
      pendingCount,
      resolvedCount,
      resolutionRate,
      avgResolutionDays,
    }
  }, [cases])

  // Contadores das abas
  const activeCount = useMemo(() => cases.filter((c) => c.status !== 'Resolvido').length, [cases])
  const historyCount = useMemo(() => cases.filter((c) => c.status === 'Resolvido').length, [cases])

  // Handlers para ações
  const handleOpenPlans = (npsCase: NpsCase) => {
    setSelectedCaseForPlans(npsCase)
    setIsPlanModalOpen(true)
  }

  const handleEditCase = (npsCase: NpsCase) => {
    setSelectedCaseForEdit(npsCase)
    setIsCaseModalOpen(true)
  }

  const handleDeleteCase = async (npsCase: NpsCase) => {
    if (confirm(`Deseja realmente excluir o caso do cliente "${npsCase.cliente}"?`)) {
      try {
        await deleteNpsCase(npsCase.id)
        toast.success('Caso NPS excluído com sucesso')
        loadAllData()
      } catch (err: any) {
        toast.error('Erro ao excluir caso')
      }
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBrand('all')
    setSelectedDept('all')
  }

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight">Casos NPS Críticos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gestão de detratores e recuperação de clientes • PG Prime BMW Jundiaí
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Botão Analista IA (visível para todos os perfis) */}
          <Button
            onClick={() => setIsAiModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analista IA</span>
          </Button>

          {canManage && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(true)}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Importar Histórico</span>
              </Button>

              <Button
                onClick={() => {
                  setSelectedCaseForEdit(null)
                  setIsCaseModalOpen(true)
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Caso</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Painel Performance NPS Semanal (4 cartões de segmento) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold tracking-tight">Performance NPS Semanal</h3>
          <span className="text-xs text-muted-foreground">
            Clique no segmento para filtrar os casos
          </span>
        </div>
        <NpsWeeklyCards
          stats={weeklyStats}
          canEdit={canManage}
          onSegmentClick={handleSegmentCardClick}
          onStatsUpdated={loadAllData}
        />
      </section>

      {/* KPI Cards NPS */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold tracking-tight">Indicadores de Tratamento</h3>
        <NpsKpiCards summary={kpiSummary} onKpiClick={handleKpiCardClick} />
      </section>

      {/* Seção Principal: Filtros + Abas + Tabela de Casos */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          {/* Abas: Casos Ativos vs Histórico */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'active' | 'history')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
              <TabsTrigger value="active" className="gap-2">
                Casos Ativos
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                  {activeCount}
                </span>
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                Histórico
                <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                  {historyCount}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filtros: Busca, Marca e Depto */}
          <div className="flex items-center flex-wrap gap-2.5">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar cliente, responsável..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9"
              />
            </div>

            <Select
              value={selectedBrand}
              onValueChange={(v) => setSelectedBrand(v as 'all' | NpsBrand)}
            >
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Marca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Marcas</SelectItem>
                <SelectItem value="BMW">BMW Auto</SelectItem>
                <SelectItem value="Motorrad">BMW Motorrad</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedDept}
              onValueChange={(v) => setSelectedDept(v as 'all' | NpsDepartment)}
            >
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Depto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Deptos</SelectItem>
                <SelectItem value="Vendas">Vendas</SelectItem>
                <SelectItem value="Pós-Vendas">Pós-Vendas</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || selectedBrand !== 'all' || selectedDept !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground"
                title="Limpar filtros"
              >
                <X className="w-3.5 h-3.5" /> Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Tabela de Casos */}
        <NpsCaseTable
          cases={filteredCases}
          canManage={canManage}
          onOpenPlans={handleOpenPlans}
          onEditCase={handleEditCase}
          onDeleteCase={handleDeleteCase}
        />
      </section>

      {/* Modais */}
      {/* 1. Novo / Editar Caso */}
      <NpsCaseDialog
        open={isCaseModalOpen}
        onOpenChange={setIsCaseModalOpen}
        initialCase={selectedCaseForEdit}
        onSaved={loadAllData}
      />

      {/* 2. Planos de Ação e Pattern Alert (IA) */}
      <NpsActionPlanDialog
        npsCase={selectedCaseForPlans}
        open={isPlanModalOpen}
        onOpenChange={setIsPlanModalOpen}
        canManage={canManage}
        onCaseUpdated={loadAllData}
      />

      {/* 3. Importação em lote */}
      <NpsImportDialog
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImportCompleted={loadAllData}
      />

      {/* 4. Analista IA (Chat nativo) */}
      <NpsAiAnalystDialog open={isAiModalOpen} onOpenChange={setIsAiModalOpen} />
    </div>
  )
}
