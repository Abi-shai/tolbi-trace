'use client'

import { useEffect, useState, useMemo } from 'react'
import { UserPlus, Search, Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useAgentsStore } from '@/store/agents'
import Header from '@/components/layout/Header'
import NewAgentPanel from './NewAgentPanel'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import Input from '@/components/ui/Input'

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
      a.name.toLowerCase().includes(q)
    )
  }, [workflowAgents, search])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Header
        title="Agents"
        description="Agents terrain assignés à ce processus. Ils exécutent leurs étapes depuis l'application mobile."
        actions={
          <Button variant="primary" icon={UserPlus} onClick={() => setPanelOpen(true)}>
            Ajouter un agent
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-y-auto px-4 py-4 bg-surface flex flex-col gap-4">

          {/* Search */}
          <div className="w-[260px]">
            <Input
              leadingIcon={Search}
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher un agent..."
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
                    ? 'Essayez un autre terme de recherche.'
                    : 'Ajoutez les agents terrain qui participeront à ce processus.'}
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
                  <Avatar name={agent.name} size="md" />
                  <span className="text-sm font-medium text-text-primary">{agent.name}</span>
                </div>

                {/* Dernière activité */}
                <div className="px-6 py-4 flex items-center">
                  <span className="text-sm text-text-tertiary whitespace-nowrap">
                    {agent.lastActivity ?? '—'}
                  </span>
                </div>

                {/* Progression */}
                <div className="px-6 py-4 flex items-center">
                  <ProgressBar value={agent.progress ?? 0} showLabel />
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

      </div>

      <AnimatePresence>
        {panelOpen && (
          <NewAgentPanel
            workflowId={workflowId}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
