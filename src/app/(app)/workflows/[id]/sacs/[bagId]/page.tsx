import { notFound } from 'next/navigation'
import BagDetail from '@/components/bags/BagDetail'
import { qrCodes } from '@/data/qr-codes'
import { getBagEvents } from '@/data/bag-events'

export default async function BagDetailPage({
  params,
}: {
  params: Promise<{ id: string; bagId: string }>
}) {
  const { id, bagId } = await params
  const bag = qrCodes.find((q) => q.id === bagId && q.workflowId === id)
  if (!bag) notFound()

  const events = getBagEvents(bag.id, bag.currentStep)

  return <BagDetail bag={bag} events={events} workflowId={id} />
}
