import { notFound } from 'next/navigation'
import { workflows } from '@/data/workflows'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function WorkflowDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workflow = workflows.find((w) => w.id === id)
  if (!workflow) notFound()

  return (
    <DashboardClient
      workflowName={workflow.name}
      workflowProject={workflow.project}
    />
  )
}
