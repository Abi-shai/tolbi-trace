'use client'

import Header from '@/components/layout/Header'
import ProcessStepper from '@/components/dashboard/ProcessStepper'
import CampaignEntriesCard from '@/components/dashboard/CampaignEntriesCard'
import AgentsNowCard from '@/components/dashboard/AgentsNowCard'
import { activeAgents } from '@/data/dashboard'

interface DashboardClientProps {
  workflowName: string
  workflowProject: string
}

export default function DashboardClient({ workflowName, workflowProject }: DashboardClientProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <Header
        title="Tableau de bord"
        description={`${workflowName} · ${workflowProject}`}
      />

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

        {/* 1. Process stepper — vue d'ensemble de la campagne */}
        <ProcessStepper />

        {/* 2. Données + monitoring */}
        <div className="grid grid-cols-3 gap-4 items-start">

          {/* Entrées campagne — activité filtrée par étape */}
          <div className="col-span-2">
            <CampaignEntriesCard />
          </div>

          {/* Agents terrain */}
          <div className="col-span-1">
            <AgentsNowCard agents={activeAgents} />
          </div>

        </div>

      </main>
    </div>
  )
}
