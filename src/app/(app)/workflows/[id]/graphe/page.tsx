import { notFound } from 'next/navigation'
import { graphNodes, graphEdges } from '@/data/graph'
import { workflows } from '@/data/workflows'
import GraphPageClient from '@/components/graph/GraphPageClient'

export default async function WorkflowGraphePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workflow = workflows.find((w) => w.id === id)
  if (!workflow) notFound()

  return <GraphPageClient nodes={graphNodes} edges={graphEdges} />
}
