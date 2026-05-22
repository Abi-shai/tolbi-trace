'use client'

import { useEffect, useState } from 'react'
import { UserPlus, Phone, Trash2, Users } from 'lucide-react'
import { useAgentsStore } from '@/store/agents'
import Header from '@/components/layout/Header'
import NewAgentPanel from './NewAgentPanel'

interface AgentsClientProps {
  workflowId: string
}

function initials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default function AgentsClient({ workflowId }: AgentsClientProps) {
  const init         = useAgentsStore((s) => s.init)
  const agents       = useAgentsStore((s) => s.agents)
  const removeAgent  = useAgentsStore((s) => s.removeAgent)

  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => { init() }, [init])

  const workflowAgents = agents.filter((a) => a.workflowId === workflowId)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Header
        title="Équipe"
        description="Agents assignés à ce workflow. Ils pourront accéder aux étapes sur l'application mobile."
        actions={
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-[0px_1px_2px_rgba(16,24,40,0.05)]"
          >
            <UserPlus size={15} />
            Ajouter un agent
          </button>
        }
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-6 py-6">

          {workflowAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4">
                <Users size={22} className="text-text-muted" />
              </div>
              <p className="text-sm font-semibold text-text-secondary mb-1">Aucun agent dans l'équipe</p>
              <p className="text-xs text-text-muted leading-5 max-w-xs">
                Ajoute les agents terrain qui participeront à ce workflow. Tu pourras ensuite les assigner à chaque étape.
              </p>
            </div>
          ) : (
            <div className="max-w-2xl space-y-2">
              <p className="text-sm text-text-tertiary mb-4">
                {workflowAgents.length} agent{workflowAgents.length > 1 ? 's' : ''}
              </p>

              {workflowAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="group flex items-center gap-4 px-4 py-3.5 bg-white border border-border rounded-lg hover:border-border-strong hover:shadow-[0px_1px_4px_rgba(16,24,40,0.08)] transition-all"
                >
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-primary text-sm font-bold shrink-0">
                    {initials(agent.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary leading-5">{agent.name}</p>
                    <p className="text-xs text-text-tertiary leading-4">{agent.role}</p>
                    {agent.phone && (
                      <p className="flex items-center gap-1 text-xs text-text-muted mt-0.5">
                        <Phone size={10} />
                        {agent.phone}
                      </p>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeAgent(agent.id)}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center p-1.5 rounded-md text-text-muted hover:text-status-anomaly hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
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
