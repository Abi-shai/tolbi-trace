'use client'

import { use } from 'react'
import AgentsClient from '@/components/workflow-agents/AgentsClient'

export default function AgentsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <AgentsClient workflowId={id} />
}
