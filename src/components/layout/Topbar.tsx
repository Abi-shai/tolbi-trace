'use client'

import { usePathname } from 'next/navigation'
import { Bell, Home, ChevronRight, Settings, BookOpen, LayoutGrid } from 'lucide-react'
import Link from 'next/link'
import { useWorkflowsStore } from '@/store/workflows'

interface Crumb {
  label: string
  href?: string
}

const SUB_LABELS: Record<string, string> = {
  'qr-codes': 'QR Codes',
  graphe:     'Traçabilité',
  sacs:       'Détail sac',
  agents:     'Équipe',
}

function useBreadcrumbs(): Crumb[] {
  const pathname  = usePathname()
  const workflows = useWorkflowsStore((s) => s.workflows)
  const segments  = pathname.split('/').filter(Boolean)

  if (segments[0] !== 'workflows') return []

  // /workflows → Trace is the active page
  if (segments.length === 1) return [{ label: 'Trace' }]

  const wf     = workflows.find((w) => w.id === segments[1])
  const wfName = wf?.name ?? segments[1]
  const wfHref = `/workflows/${segments[1]}`

  // /workflows/{id} → Trace clickable, workflow name active
  if (segments.length === 2) {
    return [{ label: 'Trace', href: '/workflows' }, { label: wfName }]
  }

  const sub      = segments[2]
  const subLabel = SUB_LABELS[sub] ?? sub

  // /workflows/{id}/{section} → Trace clickable, workflow name clickable, section active
  if (segments.length === 3) {
    return [
      { label: 'Trace',  href: '/workflows' },
      { label: wfName,   href: wfHref       },
      { label: subLabel                      },
    ]
  }

  // /workflows/{id}/{section}/{detail}
  return [
    { label: 'Trace',    href: '/workflows'       },
    { label: wfName,     href: wfHref             },
    { label: subLabel,   href: `${wfHref}/${sub}` },
    { label: segments[3]                           },
  ]
}

export default function Topbar() {
  const breadcrumbs = useBreadcrumbs()

  return (
    <header
      className="flex items-center justify-between px-4 py-3 shrink-0 w-full"
      style={{ backgroundColor: 'rgba(6, 105, 56, 0.95)' }}
    >
      {/* Left: logo + breadcrumbs */}
      <div className={`flex items-center ${breadcrumbs.length > 0 ? 'gap-8' : ''}`}>
        <img
          src="/icons/tolbi-wordmark.svg"
          alt="Tolbi"
          width={47}
          height={20}
          className="shrink-0 select-none"
        />

        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className="flex items-center justify-center p-1.5 rounded-[6px] text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Home size={15} />
            </Link>

            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight size={13} className="text-white/30 shrink-0" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="px-2 py-1 rounded-[6px] text-text-disabled text-sm font-medium leading-5 hover:text-white transition-colors whitespace-nowrap"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="px-2 py-1 rounded-[6px] bg-primary text-border text-sm font-semibold leading-5 max-w-[220px] truncate">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: credits badge + actions + avatar */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Credits badge */}
        <div className="flex items-center gap-2 px-2.5 pr-3 py-1 rounded-full bg-warning-bg">
          <img src="/icons/token-coin.png" alt="" className="w-[17px] h-[17px] rounded-full shrink-0 object-cover" />
          <p className="text-sm leading-6 whitespace-nowrap">
            <span className="font-bold text-brand-700">32</span>
            <span className="font-medium text-text-secondary"> crédits disponibles</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">

          {/* Apprendre */}
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-border text-sm font-semibold border border-primary shadow-sm hover:bg-primary transition-colors"
            style={{ backgroundColor: 'rgba(5, 96, 51, 0.9)' }}
          >
            <BookOpen size={16} />
            Apprendre
          </button>

          {/* Settings */}
          <button className="flex items-center justify-center p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <Settings size={18} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="flex items-center justify-center p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
              <Bell size={18} />
            </button>
            <div className="absolute top-[14px] right-[14px] w-1.5 h-1.5 rounded-full bg-status-anomaly border-[1.5px] border-border pointer-events-none" />
          </div>

          {/* Grid */}
          <button className="flex items-center justify-center p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <LayoutGrid size={18} />
          </button>
        </div>

        {/* Avatar */}
        <button className="w-10 h-10 rounded-full bg-surface-alt border border-black/[0.08] flex items-center justify-center shrink-0 hover:ring-2 hover:ring-white/30 transition-all">
          <span className="text-sm font-semibold text-text-muted">AG</span>
        </button>
      </div>
    </header>
  )
}
