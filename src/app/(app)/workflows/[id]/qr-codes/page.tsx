import { notFound } from 'next/navigation'
import QRCodesClient from '@/components/qr-codes/QRCodesClient'
import { qrCodes } from '@/data/qr-codes'
import { workflows } from '@/data/workflows'

export default async function WorkflowQRCodesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const workflow = workflows.find((w) => w.id === id)
  if (!workflow) notFound()

  const codes = qrCodes.filter((c) => c.workflowId === id)

  return <QRCodesClient initialCodes={codes} workflowId={id} />
}
