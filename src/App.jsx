import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Users2, GitFork, FolderOpen, Settings,
  BadgeCheck, CheckCircle2, Clock, Eye, AlertCircle,
  ChevronDown, X, Home, Users, BarChart3, Wifi, WifiOff, RefreshCw,
} from 'lucide-react'

// ── Config ────────────────────────────────────────────────────
const CONFIG = {
  projectName:      import.meta.env.VITE_PROJECT_NAME      || 'Fintech XYZ',
  projectType:      import.meta.env.VITE_PROJECT_TYPE      || 'Plataforma de Pagamentos',
  projectInitials:  import.meta.env.VITE_PROJECT_INITIALS  || 'FX',
  listId:           import.meta.env.VITE_LIST_ID           || '',
  activeSprintName: import.meta.env.VITE_ACTIVE_SPRINT     || 'Sprint 12',
  deliveryDate:     import.meta.env.VITE_DELIVERY_DATE     || '12 Out, 2023',
  velocity:         import.meta.env.VITE_VELOCITY          || '42pts/wk',
}

// ── Status mapping — usa includes() para ser tolerante com variações ──
function mapStatus(raw) {
  const s = (raw || '').toLowerCase().trim()
  if (s.includes('complet') || s.includes('done') || s.includes('closed') || s.includes('conclu')) return 'completed'
  if (s.includes('progress') || s.includes('doing') || s.includes('andamento'))                    return 'in_progress'
  if (s.includes('review') || s.includes('revis') || s.includes('approval') || s.includes('waiting')) return 'review'
  return 'pending'
}

// ── Tempo relativo ────────────────────────────────────────────
function timeAgo(timestamp) {
  if (!timestamp) return ''
  const diff    = Date.now() - parseInt(timestamp)
  const minutes = Math.floor(diff / 60000)
  const hours   = Math.floor(diff / 3600000)
  const days    = Math.floor(diff / 86400000)
  if (minutes < 2)  return 'Agora mesmo'
  if (minutes < 60) return `Há ${minutes} min`
  if (hours < 24)   return `Há ${hours} hora${hours > 1 ? 's' : ''}`
  if (days === 1)   return 'Há 1 dia'
  return `Há ${days} dias`
}

// ── Label de ação baseada no status (para o histórico) ────────
function actionLabel(status) {
  return {
    completed:   'Tarefa concluída',
    in_progress: 'Em andamento',
    review:      'Enviada para review',
    pending:     'Adicionada à sprint',
  }[status] || 'Atualizada'
}

// ── Dados fixos ───────────────────────────────────────────────
const DEMO_SQUAD = [
  { name: 'Ana Mendes',  role: 'Lead Dev',    initials: 'AM', bg: 'bg-primary-container',   textColor: 'text-white' },
  { name: 'Ricardo B.',  role: 'UX Design',   initials: 'RB', bg: 'bg-secondary-container', textColor: 'text-on-secondary-container' },
  { name: 'Carla Silva', role: 'Backend',      initials: 'CS', bg: 'bg-primary-fixed',       textColor: 'text-primary' },
  { name: 'João Pedro',  role: 'QA Engineer', initials: 'JP', bg: 'bg-slate-200',            textColor: 'text-slate-500' },
  { name: 'Lucas F.',    role: 'DevOps',       initials: 'LF', bg: 'bg-blue-100',             textColor: 'text-primary' },
]

const DEMO_TASKS = [
  { title: 'Integração API Pix',     subtitle: 'Concluída',            status: 'completed',  statusLabel: 'Concluída',    statusBg: 'bg-primary',                                statusText: 'text-white' },
  { title: 'Dashboard Analytics',    subtitle: 'Enviada para review',  status: 'review',     statusLabel: 'Review',       statusBg: 'bg-secondary-container',                   statusText: 'text-on-secondary-container' },
  { title: 'Checkout Flow Refactor', subtitle: 'Em andamento',         status: 'in_progress', statusLabel: 'Em Progresso', statusBg: 'bg-primary-container border border-primary/30', statusText: 'text-white' },
  { title: 'Push Notifications',     subtitle: 'Adicionada à sprint',  status: 'pending',    statusLabel: 'Pendente',     statusBg: 'bg-white/10',                               statusText: 'text-white opacity-40' },
]

const HISTORICAL_SPRINTS = [
  { name: 'Sprint 10', period: '01 Set – 14 Set', status: 'completed', tasks: [
    { title: 'Setup do ambiente e CI/CD',       status: 'completed' },
    { title: 'Modelagem do banco de dados',      status: 'completed' },
    { title: 'Autenticação e autorização (JWT)', status: 'completed' },
    { title: 'Tela de login e cadastro',         status: 'completed' },
    { title: 'API de usuários (CRUD)',           status: 'completed' },
    { title: 'Configuração de monitoramento',    status: 'completed' },
  ]},
  { name: 'Sprint 11', period: '15 Set – 28 Set', status: 'completed', tasks: [
    { title: 'API de transações (PIX)',          status: 'completed' },
    { title: 'Dashboard do cliente',            status: 'completed' },
    { title: 'Integração gateway de pagamento', status: 'completed' },
    { title: 'Notificações por e-mail',         status: 'completed' },
    { title: 'Relatórios básicos (PDF)',        status: 'completed' },
    { title: 'Code review e refactoring',       status: 'completed' },
  ]},
]

const DEMO_HEATMAP = [
  10, 40, 20, 90, 30, 60, 10,
  50,100, 70, 40, 20, 60, 30,
  30, 60, 80, 10, 40, 90, 20,
 100, 20, 50, 30, 70, 40, 60,
]

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Team',      icon: Users2 },
  { label: 'Roadmap',   icon: GitFork },
  { label: 'Resources', icon: FolderOpen },
  { label: 'Settings',  icon: Settings },
]

const MOBILE_NAV = [
  { label: 'Home',     icon: Home,     active: true },
  { label: 'Team',     icon: Users },
  { label: 'Stats',    icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

// ── Status configs ────────────────────────────────────────────
const sprintStatusConfig = {
  completed:   { label: 'Concluída',    bg: 'bg-blue-500/20',  text: 'text-blue-300',  dot: 'bg-blue-300' },
  in_progress: { label: 'Em andamento', bg: 'bg-[#fdc425]/20', text: 'text-[#fdc425]', dot: 'bg-[#fdc425]' },
  review:      { label: 'Em review',    bg: 'bg-[#d8e2ff]/20', text: 'text-[#d8e2ff]', dot: 'bg-[#d8e2ff]' },
  pending:     { label: 'Pendente',     bg: 'bg-white/10',     text: 'text-white/50',  dot: 'bg-white/30' },
  planned:     { label: 'Planejada',    bg: 'bg-white/10',     text: 'text-white/40',  dot: 'bg-white/20' },
}

const taskStatusConfig = {
  completed:   { label: 'Concluída',    bg: 'bg-primary',                                    text: 'text-white' },
  review:      { label: 'Review',       bg: 'bg-secondary-container',                        text: 'text-on-secondary-container' },
  in_progress: { label: 'Em Progresso', bg: 'bg-primary-container border border-primary/30', text: 'text-white' },
  pending:     { label: 'Pendente',     bg: 'bg-white/10',                                   text: 'text-white opacity-40' },
}

function SprintStatusBadge({ status }) {
  const cfg = sprintStatusConfig[status] || sprintStatusConfig.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

const taskIconMap = {
  completed:   <CheckCircle2 className="w-4 h-4 text-blue-300 shrink-0" />,
  in_progress: <Clock        className="w-4 h-4 text-[#fdc425] shrink-0" />,
  review:      <Eye          className="w-4 h-4 text-[#d8e2ff] shrink-0" />,
  pending:     <AlertCircle  className="w-4 h-4 text-white/30 shrink-0" />,
}

// ── App ──────────────────────────────────────────────────────
export default function App() {
  const [expanded, setExpanded]             = useState(null)
  const [isClosing, setIsClosing]           = useState(false)
  const [expandedSprint, setExpandedSprint] = useState(2)
  const [progressWidth, setProgressWidth]   = useState(0)
  const [heatmapVisible, setHeatmapVisible] = useState(false)
  const [blocksVisible, setBlocksVisible]   = useState(false)

  const [isLive, setIsLive]       = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync]   = useState(null)
  const [progress, setProgress]   = useState(0)
  const [tasks, setTasks]         = useState(DEMO_TASKS)
  const [sprints, setSprints]     = useState([
    ...HISTORICAL_SPRINTS,
    { name: 'Sprint 12', period: '29 Set – 12 Out', status: 'in_progress', tasks: [] },
    { name: 'Sprint 13', period: '13 Out – 26 Out', status: 'planned',     tasks: [] },
  ])

  const hasClickUp = !!CONFIG.listId

  // ── Busca dados do ClickUp ────────────────────────────────
  async function fetchClickUp() {
    if (!hasClickUp) {
      setProgress(85)
      setTimeout(() => setProgressWidth(85), 400)
      setTasks(DEMO_TASKS)
      return
    }
    setIsLoading(true)
    try {
      const res  = await fetch(`/api/clickup?path=list/${CONFIG.listId}/task%3Finclude_closed%3Dtrue`)
      const json = await res.json()

      if (json.error) throw new Error(json.error)

      // Mapeia todas as tarefas com status e timestamp
      const allTasks = (json.tasks || []).map(t => ({
        title:       t.name,
        status:      mapStatus(t.status?.status),
        rawStatus:   t.status?.status || '',
        dateUpdated: t.date_updated || t.date_created || '0',
      }))

      // Progresso: concluídas / total
      const done  = allTasks.filter(t => t.status === 'completed').length
      const total = allTasks.length
      const pct   = total > 0 ? Math.round((done / total) * 100) : 0

      // Sprint 12 = todas as tarefas reais do ClickUp
      const liveSprint = {
        name:   CONFIG.activeSprintName,
        period: '29 Set – 12 Out',
        status: done === total && total > 0 ? 'completed' : 'in_progress',
        tasks:  allTasks.map(t => ({ title: t.title, status: t.status })),
      }

      // Tarefas recentes: ordenadas por data de atualização (mais recente primeiro)
      const sorted = [...allTasks].sort((a, b) =>
        parseInt(b.dateUpdated) - parseInt(a.dateUpdated)
      )

      const recentTasks = sorted.slice(0, 4).map(t => {
        const cfg = taskStatusConfig[t.status] || taskStatusConfig.pending
        return {
          title:       t.title,
          subtitle:    `${actionLabel(t.status)} · ${timeAgo(t.dateUpdated)}`,
          status:      t.status,
          statusLabel: cfg.label,
          statusBg:    cfg.bg,
          statusText:  cfg.text,
        }
      })

      setSprints([
        ...HISTORICAL_SPRINTS,
        liveSprint,
        { name: 'Sprint 13', period: '13 Out – 26 Out', status: 'planned', tasks: [] },
      ])
      setTasks(recentTasks)
      setProgress(pct)
      setProgressWidth(pct)   // atualiza barra diretamente
      setIsLive(true)
      setLastSync(new Date())
    } catch (err) {
      console.warn('ClickUp fetch falhou:', err.message)
      setProgress(85)
      setTimeout(() => setProgressWidth(85), 400)
      setTasks(DEMO_TASKS)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Animações de entrada ──────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setBlocksVisible(true), 50)
    const t2 = setTimeout(() => setHeatmapVisible(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => { fetchClickUp() }, [])

  const openExpand  = (block) => { if (expanded || isClosing) return; setExpanded(block) }
  const closeExpand = (e) => {
    e?.stopPropagation()
    setIsClosing(true)
    setTimeout(() => { setExpanded(null); setIsClosing(false) }, 350)
  }

  const hasOverlay = expanded !== null

  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <main className="max-w-screen-2xl mx-auto flex">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-64 bg-[#f7f9fb] px-4 py-8 shadow-[4px_0_32px_rgba(0,74,198,0.04)] shrink-0">
          <div className="mb-8 px-6">
            <h2 className="text-2xl font-black text-[#004ac6]">Lionsoft</h2>
            <p className="text-xs text-label text-slate-500 tracking-wider">Squad as a Service</p>
          </div>
          <nav className="flex flex-col gap-2">
            {SIDEBAR_ITEMS.map((item) => (
              <a key={item.label} href="#"
                className={`px-6 py-3 flex items-center gap-3 rounded-xl transition-all duration-200 hover:translate-x-1 ${
                  item.active ? 'bg-[#2563eb] text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 hover:bg-[#e8eeff] hover:text-[#2563eb]'
                }`}>
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-body text-sm font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          {/* Indicador ClickUp */}
          <div className="mt-auto px-6 pb-2 space-y-1">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${isLive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {isLoading
                ? <RefreshCw className="w-3 h-3 animate-spin" />
                : isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />
              }
              {isLoading ? 'Sincronizando...' : isLive ? 'ClickUp conectado' : 'Dados demo'}
            </div>
            {lastSync && (
              <p className="text-[10px] text-slate-400 px-3">
                Sync: {lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
            {isLive && (
              <button onClick={fetchClickUp} className="w-full text-[10px] text-slate-400 hover:text-[#2563eb] transition-colors px-3 text-left">
                Atualizar agora →
              </button>
            )}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <section className="flex-1 p-8 lg:p-12 space-y-10 bg-white min-h-screen">

          {/* Client bar */}
          <div className="animate-fade-in-up flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-md shrink-0">
                <span className="text-white text-xs sm:text-sm font-black">{CONFIG.projectInitials}</span>
              </div>
              <span className="text-base sm:text-lg font-extrabold text-on-surface tracking-tight">{CONFIG.projectName}</span>
            </div>
            <div className="bg-surface-container-low px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg flex items-center gap-2 self-start sm:self-auto">
              <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
              <span className="text-label text-xs sm:text-sm font-bold text-on-surface">Projeto Ativo: {CONFIG.activeSprintName}</span>
            </div>
          </div>

          {/* Hero */}
          <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
            <h1 className="text-xl sm:text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-none">
              Bem-vindo de volta, {CONFIG.projectName}
            </h1>
            <p className="text-lg text-on-surface-variant font-label font-medium opacity-80">{CONFIG.projectType}</p>
          </div>

          {/* Grid */}
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 pb-24 md:pb-0">

            {hasOverlay && <div className="absolute inset-0 z-[5] pointer-events-none" />}

            {/* BLOCK 1: Squad */}
            <div className={`animate-fade-in-up transition-opacity duration-300 ${hasOverlay ? 'opacity-30' : 'opacity-100'}`} style={{ animationDelay: blocksVisible ? '100ms' : '9999ms' }}>
              <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-xl space-y-8 min-h-[400px] transition-all duration-200 hover:shadow-xl hover:scale-[1.01] cursor-default">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-on-background">Seu Squad</h3>
                  <Users className="w-5 h-5 text-primary opacity-40" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                  {DEMO_SQUAD.map((member, idx) => (
                    <div key={member.initials} className="flex flex-col items-center text-center space-y-3 animate-fade-in-up" style={{ animationDelay: `${300 + idx * 80}ms` }}>
                      <div className={`w-12 h-12 sm:w-20 sm:h-20 ${member.bg} rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-110 cursor-pointer`}>
                        <span className={`${member.textColor} text-base sm:text-2xl font-black`}>{member.initials}</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-on-surface">{member.name}</p>
                        <p className="text-label text-[10px] sm:text-xs text-on-surface-variant">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BLOCK 2: Progresso */}
            <div
              className={`animate-fade-in-up transition-all duration-300 ${expanded === 'progress' ? 'md:col-span-2 z-10 opacity-100' : hasOverlay ? 'opacity-30' : 'opacity-100'}`}
              style={{ animationDelay: blocksVisible ? '200ms' : '9999ms' }}
            >
              <div
                className={`bg-on-primary-fixed-variant p-8 rounded-xl min-h-[400px] flex flex-col justify-between cursor-pointer transition-all duration-400 ease-out ${
                  expanded === 'progress' ? 'ring-2 ring-primary/40 shadow-2xl shadow-primary/20' : 'hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.01]'
                }`}
                onClick={() => expanded !== 'progress' && openExpand('progress')}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Progresso do Projeto</h3>
                    <p className="text-label text-xs text-primary-fixed opacity-70 mt-1">
                      {CONFIG.activeSprintName}: {progress}% concluída
                    </p>
                  </div>
                  {expanded === 'progress' && (
                    <button onClick={closeExpand} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 animate-fade-in-rotate">
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-center gap-6">
                  <div className="flex items-end justify-between">
                    <span className="text-7xl font-extrabold text-white tracking-tighter">{progress}%</span>
                    <div className="hidden sm:flex gap-2">
                      <div className="w-4 h-12 bg-secondary-container rounded-full" />
                      <div className="w-4 h-24 bg-primary rounded-full" />
                      <div className="w-4 h-16 bg-white rounded-full opacity-30" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-900 border border-white/10 h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-primary-fixed h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-label text-[10px] uppercase tracking-widest opacity-60">Entrega Estimada</p>
                    <p className="font-bold text-white">{CONFIG.deliveryDate}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <p className="text-label text-[10px] uppercase tracking-widest opacity-60">Velocidade Squad</p>
                    <p className="font-bold text-white">{CONFIG.velocity}</p>
                  </div>
                </div>

                {expanded === 'progress' && (
                  <div className={`pt-6 border-t border-white/10 space-y-4 ${isClosing ? 'animate-expanded-out' : 'animate-expanded-in'}`} style={{ animationDelay: isClosing ? '0ms' : '200ms' }} onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-lg font-bold text-white mb-4">Detalhes das Sprints</h4>
                    {sprints.map((sprint, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl overflow-hidden">
                        <button onClick={() => setExpandedSprint(expandedSprint === idx ? -1 : idx)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${sprint.status === 'completed' ? 'bg-primary/30 text-blue-300' : sprint.status === 'in_progress' ? 'bg-[#fdc425]/20 text-[#fdc425]' : 'bg-white/10 text-white/40'}`}>
                              {idx + 1}
                            </div>
                            <div>
                              <span className="font-semibold text-white text-sm">{sprint.name}</span>
                              <p className="text-xs text-white/40">{sprint.period}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <SprintStatusBadge status={sprint.status} />
                            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${expandedSprint === idx ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        {expandedSprint === idx && sprint.tasks.length > 0 && (
                          <div className="px-4 pb-4 space-y-2">
                            {sprint.tasks.map((task, tIdx) => (
                              <div key={tIdx} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors animate-slide-in-left" style={{ animationDelay: `${tIdx * 50}ms` }}>
                                <div className="flex items-center gap-3">
                                  {taskIconMap[task.status] || taskIconMap.pending}
                                  <span className={`text-sm ${task.status === 'completed' ? 'text-white/40 line-through' : 'text-white/80'}`}>{task.title}</span>
                                </div>
                                <SprintStatusBadge status={task.status} />
                              </div>
                            ))}
                          </div>
                        )}
                        {expandedSprint === idx && sprint.tasks.length === 0 && (
                          <div className="px-4 pb-4">
                            <p className="text-sm text-white/30 italic">Nenhuma tarefa ainda</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* BLOCK 3: Tarefas Recentes */}
            <div
              className={`animate-fade-in-up transition-all duration-300 ${expanded === 'tasks' ? 'md:col-span-2 z-10 opacity-100' : hasOverlay ? 'opacity-30' : 'opacity-100'}`}
              style={{ animationDelay: blocksVisible ? '300ms' : '9999ms' }}
            >
              <div
                className={`bg-on-primary-fixed-variant p-8 rounded-xl min-h-[400px] cursor-pointer transition-all duration-400 ease-out ${expanded === 'tasks' ? 'ring-2 ring-primary/40 shadow-2xl shadow-primary/20' : 'hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.01]'}`}
                onClick={() => expanded !== 'tasks' && openExpand('tasks')}
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white">Tarefas Recentes</h3>
                    <p className="text-xs text-white/40 mt-1">Ordenadas por última movimentação</p>
                  </div>
                  {expanded === 'tasks'
                    ? <button onClick={closeExpand} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 animate-fade-in-rotate"><X className="w-4 h-4 text-white/60" /></button>
                    : <CheckCircle2 className="w-5 h-5 text-primary-fixed" />
                  }
                </div>

                <div className="space-y-4">
                  {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-4 group animate-slide-in-left" style={{ animationDelay: `${500 + idx * 80}ms` }}>
                      <div className={`h-10 sm:h-12 w-20 sm:w-24 ${task.statusBg} flex items-center justify-center rounded shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                        <span className={`text-[8px] sm:text-[10px] font-black ${task.statusText} uppercase tracking-tighter`}>{task.statusLabel}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-white font-bold text-sm ${task.status === 'pending' ? 'opacity-60' : ''}`}>{task.title}</p>
                        <p className={`text-label text-[11px] text-primary-fixed ${task.status === 'pending' ? 'opacity-30' : 'opacity-50'}`}>{task.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expandido: histórico completo */}
                {expanded === 'tasks' && (
                  <div className={`pt-6 mt-6 border-t border-white/10 ${isClosing ? 'animate-expanded-out' : 'animate-expanded-in'}`} style={{ animationDelay: isClosing ? '0ms' : '200ms' }} onClick={(e) => e.stopPropagation()}>
                    <h4 className="text-lg font-bold text-white mb-4">Histórico Completo</h4>
                    <div className="space-y-2">
                      {tasks.map((task, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-white/5 transition-colors animate-slide-in-left" style={{ animationDelay: `${idx * 60}ms` }}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            task.status === 'completed'   ? 'bg-primary/20' :
                            task.status === 'review'      ? 'bg-[#fdc425]/20' :
                            task.status === 'in_progress' ? 'bg-primary/20' :
                            'bg-white/10'
                          }`}>
                            {taskIconMap[task.status] || taskIconMap.pending}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white/80 font-medium">{task.title}</p>
                            <p className="text-xs text-white/30 mt-0.5">{task.subtitle}</p>
                          </div>
                          <SprintStatusBadge status={task.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* BLOCK 4: Visão Geral */}
            <div className={`animate-fade-in-up transition-opacity duration-300 ${hasOverlay ? 'opacity-30' : 'opacity-100'}`} style={{ animationDelay: blocksVisible ? '400ms' : '9999ms' }}>
              <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-xl space-y-8 min-h-[400px] transition-all duration-200 hover:shadow-xl hover:scale-[1.01] cursor-default">
                <div>
                  <h3 className="text-2xl font-bold text-on-background">Visão Geral</h3>
                  <p className="text-label text-xs text-on-surface-variant opacity-70">Atividade do repositório nos últimos 6 meses</p>
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {DEMO_HEATMAP.map((val, idx) => (
                    <div key={idx}
                      className={`h-8 sm:h-12 bg-primary rounded transition-transform duration-150 hover:scale-110 cursor-pointer ${heatmapVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                      style={{ opacity: heatmapVisible ? val / 100 : 0, animationDelay: heatmapVisible ? `${idx * 25}ms` : '0ms', animationFillMode: 'both' }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-primary opacity-20" /><span className="text-label text-[10px] text-on-surface-variant uppercase font-bold">Baixa</span></div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-primary" /><span className="text-label text-[10px] text-on-surface-variant uppercase font-bold">Alta</span></div>
                  </div>
                  <span className="text-label text-xs font-bold text-primary cursor-pointer hover:underline transition-all">Ver Relatório Completo</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Mobile Nav */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container-lowest border-t border-outline-variant/10 px-8 py-3 flex justify-between items-center z-50">
        {MOBILE_NAV.map((item) => (
          <div key={item.label} className={`flex flex-col items-center transition-transform duration-150 active:scale-90 ${item.active ? 'text-primary' : 'text-on-surface-variant opacity-60'}`}>
            <item.icon className={`w-5 h-5 ${item.active ? 'fill-current' : ''}`} />
            <span className={`text-[10px] ${item.active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
          </div>
        ))}
      </footer>
    </div>
  )
}
