'use client'

import { useEffect, useState, useMemo } from 'react'
import { UserPlus, Search, Eye, User, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAgentsStore } from '@/store/agents'
import Header from '@/components/layout/Header'
import NewAgentPanel from './NewAgentPanel'

interface AgentsClientProps {
  workflowId: string
}

const PAGE_SIZE = 10

export default function AgentsClient({ workflowId }: AgentsClientProps) {
  const init        = useAgentsStore((s) => s.init)
  const agents      = useAgentsStore((s) => s.agents)

  const [panelOpen, setPanelOpen] = useState(false)
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)

  useEffect(() => { init() }, [init])

  const workflowAgents = agents.filter((a) => a.workflowId === workflowId)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return workflowAgents
    return workflowAgents.filter((a) =>
      a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
    )
  }, [workflowAgents, search])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Header
        title="Agents"
        actions={
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-xs"
          >
            <UserPlus size={15} />
            Ajouter un agent
          </button>
        }
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-4 bg-surface flex flex-col gap-4">

          {/* Search */}
          <div className="relative w-[260px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher un agent..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-border rounded-lg placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-colors"
            />
          </div>

          {/* Table */}
          <div className="bg-white border border-border rounded-lg shadow-xs overflow-hidden flex flex-col">

            {/* Table header */}
            <div className="grid grid-cols-[2fr_180px_1fr_80px] border-b border-border shrink-0">
              <div className="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Nom et prénom</div>
              <div className="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Dernière activité</div>
              <div className="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Progression sur les objectifs</div>
              <div className="px-6 py-3 text-xs font-medium text-text-tertiary leading-[18px]">Actions</div>
            </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4">
                  <Users size={22} className="text-text-muted" />
                </div>
                <p className="text-sm font-semibold text-text-secondary mb-1">
                  {search ? 'Aucun résultat' : "Aucun agent dans l'équipe"}
                </p>
                <p className="text-xs text-text-muted leading-5 max-w-xs">
                  {search
                    ? 'Essaie un autre terme de recherche.'
                    : 'Ajoute les agents terrain qui participeront à ce workflow.'}
                </p>
              </div>
            )}

            {/* Rows */}
            {pageItems.map((agent) => (
              <div
                key={agent.id}
                className="grid grid-cols-[2fr_180px_1fr_80px] border-b border-border last:border-b-0 hover:bg-surface transition-colors"
              >
                {/* Nom */}
                <div className="px-6 py-2 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface-alt ring-[0.75px] ring-black/[0.08] shrink-0">
                    <User size={16} className="text-text-tertiary" />
                  </div>
                  <span className="text-sm font-medium text-text-primary">{agent.name}</span>
                </div>

                {/* Dernière activité */}
                <div className="px-6 py-4 flex items-center">
                  <span className="text-sm text-text-tertiary whitespace-nowrap">
                    {agent.lastActivity ?? '—'}
                  </span>
                </div>

                {/* Progression */}
                <div className="px-6 py-4 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-surface-alt rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${agent.progress ?? 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-text-secondary tabular-nums w-9 shrink-0 text-right">
                    {agent.progress ?? 0}%
                  </span>
                </div>

                {/* Actions */}
                <div className="px-4 py-2 flex items-center justify-center">
                  <button className="p-2.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface transition-colors">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center border border-border rounded-lg shadow-xs overflow-hidden divide-x divide-border">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-secondary bg-white hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`min-w-[40px] px-2 py-2 text-sm font-semibold transition-colors ${
                      p === currentPage
                        ? 'bg-surface text-text-nav-hover'
                        : 'bg-white text-text-secondary hover:bg-surface'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-text-secondary bg-white hover:bg-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

        </main>

        {panelOpen && (
          <NewAgentPanel
            workflowId={workflowId}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
