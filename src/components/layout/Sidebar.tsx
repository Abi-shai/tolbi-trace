'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Network, ChevronsLeft, ChevronsRight, QrCode, Users, Route, AlignRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useWorkflowsStore } from '@/store/workflows'
import { useWorkflowBuilderStore } from '@/store/workflow-builder'
import { useUIStore } from '@/store/ui'
import UnsavedChangesModal from '@/components/workflow-canvas/UnsavedChangesModal'

// ─── Constants ────────────────────────────────────────────────────────────────

const W = { collapsed: 80, expanded: 320 } as const

const widthTransition = { duration: 0.22, ease: [0.4, 0, 0.2, 1] as const }

const fadeIn  = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
const fadeInDelayed = { ...fadeIn, transition: { duration: 0.16, delay: 0.08 } }

// ─── Sub-components ────────────────────────────────────────────────────────────

function ModuleIcon() {
  return (
    <img
      src="/icons/trace-module.svg"
      alt="Trace"
      width={48}
      height={48}
      className="shrink-0"
    />
  )
}

function IconTooltip({ label, rect }: { label: string; rect: DOMRect }) {
  return (
    <div
      className="fixed z-50 pointer-events-none flex items-center gap-1.5"
      style={{ top: rect.top + rect.height / 2, left: rect.right + 8, transform: 'translateY(-50%)' }}
    >
      <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderRight: '6px solid #101828' }} />
      <span className="bg-[#101828] text-white text-xs font-semibold px-2.5 py-1.5 rounded-md whitespace-nowrap shadow-lg">
        {label}
      </span>
    </div>
  )
}

function useIconTooltip() {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const handlers = {
    onMouseEnter: (e: React.MouseEvent) => setRect((e.currentTarget as HTMLElement).getBoundingClientRect()),
    onMouseLeave: () => setRect(null),
  }
  return { rect, handlers }
}

function CollapseBtn({ onClick }: { onClick: () => void }) {
  const { rect, handlers } = useIconTooltip()
  return (
    <>
      <button
        onClick={onClick}
        {...handlers}
        className="flex items-center justify-center p-2 rounded-lg border border-[#eaecf0] text-[#667085] hover:bg-[#f9fafb] transition-colors shrink-0"
      >
        <ChevronsLeft size={20} />
      </button>
      {rect && <IconTooltip label="Réduire" rect={rect} />}
    </>
  )
}

function ExpandBtn({ onClick }: { onClick: () => void }) {
  const { rect, handlers } = useIconTooltip()
  return (
    <>
      <button
        onClick={onClick}
        {...handlers}
        className="flex items-center justify-center p-2 rounded-lg border border-[#eaecf0] text-[#667085] hover:bg-[#f9fafb] transition-colors"
      >
        <ChevronsRight size={20} />
      </button>
      {rect && <IconTooltip label="Afficher la navigation" rect={rect} />}
    </>
  )
}

function NavIconBtn({
  icon: Icon, label, active, onClick,
}: {
  icon: React.ElementType; label: string; active: boolean; onClick: () => void
}) {
  const { rect, handlers } = useIconTooltip()

  return (
    <>
      <button
        onClick={onClick}
        {...handlers}
        className={cn(
          'flex items-center justify-center w-12 h-12 rounded-[6px] transition-colors',
          active ? 'bg-[#f9fafb] text-[#182230]' : 'bg-white text-[#667085] hover:bg-[#f9fafb] hover:text-[#182230]',
        )}
      >
        <Icon size={24} />
      </button>
      {rect && <IconTooltip label={label} rect={rect} />}
    </>
  )
}

function NavTextBtn({
  icon: Icon, label, active, onClick,
}: {
  icon: React.ElementType; label: string; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-[6px] text-base font-semibold transition-colors whitespace-nowrap',
        active
          ? 'bg-[#f9fafb] text-[#182230]'
          : 'bg-white text-[#344054] hover:bg-[#f9fafb] hover:text-[#182230]',
      )}
    >
      <Icon size={24} className={active ? 'text-[#344054]' : 'text-[#667085]'} />
      {label}
    </button>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname   = usePathname()
  const router     = useRouter()
  const init       = useWorkflowsStore((s) => s.init)
  const workflows  = useWorkflowsStore((s) => s.workflows)
  const hasUnsaved = useWorkflowBuilderStore((s) => s.hasUnsavedChanges)
  const markSaved  = useWorkflowBuilderStore((s) => s.markSaved)
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUIStore()

  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => { init() }, [init])

  const workflowMatch = pathname.match(/^\/workflows\/([^/]+)/)
  const workflowId    = workflowMatch?.[1]
  const workflow      = workflowId ? workflows.find((w) => w.id === workflowId) : null
  const isCanvasPage  = pathname === `/workflows/${workflowId}`

  function navigate(href: string) {
    if (isCanvasPage && hasUnsaved && href !== pathname) {
      setPendingHref(href)
    } else {
      router.push(href)
    }
  }

  function handleSaveAndLeave() {
    markSaved()
    if (pendingHref) router.push(pendingHref)
    setPendingHref(null)
  }

  function handleDiscard() {
    if (pendingHref) router.push(pendingHref)
    setPendingHref(null)
  }

  // ─── Inside a workflow ───────────────────────────────────────────────────────

  if (workflow) {
    const base      = `/workflows/${workflow.id}`
    const navGroups = [
      {
        label: 'Configurer',
        items: [
          { href: base,             label: 'Étapes',      icon: AlignRight },
          { href: `${base}/agents`, label: 'Agents',      icon: Users      },
        ],
      },
      {
        label: 'Observer',
        items: [
          // { href: `${base}/dashboard`, label: 'Tableau de bord', icon: Home },
          { href: `${base}/graphe`,   label: 'Traçabilité', icon: Network },
          { href: `${base}/qr-codes`, label: 'QR codes',    icon: QrCode  },
        ],
      },
    ]

    function isActive(href: string) {
      return pathname === href || (href !== base && pathname.startsWith(href + '/'))
    }

    return (
      <>
        <motion.aside
          animate={{ width: collapsed ? W.collapsed : W.expanded }}
          transition={widthTransition}
          className="flex shrink-0 h-full bg-white border-r border-[#eaecf0] overflow-hidden"
        >
          {/* Icon rail */}
          <div className={cn(
            'flex flex-col w-[80px] shrink-0 pt-4',
            !collapsed && 'border-r border-[#eaecf0]',
          )}>
            {/* Top: expand btn (collapsed only) → module icon → divider */}
            <div className="flex flex-col items-center gap-4 px-2 mb-6">
              <AnimatePresence initial={false}>
                {collapsed && (
                  <motion.div key="expand-btn" {...fadeIn} transition={{ duration: 0.12 }}>
                    <ExpandBtn onClick={toggleSidebar} />
                  </motion.div>
                )}
              </AnimatePresence>
              <ModuleIcon />
              <div className="w-full h-px bg-[#eaecf0]" />
            </div>

            {/* Nav: all icons when collapsed, Route only when expanded */}
            <AnimatePresence mode="wait" initial={false}>
              {collapsed ? (
                <motion.div
                  key="all-icons"
                  {...fadeIn}
                  transition={{ duration: 0.12 }}
                  className="flex flex-col gap-2 items-start px-4"
                >
                  {navGroups.flatMap((group) =>
                    group.items.map(({ href, label, icon }) => (
                      <NavIconBtn
                        key={href}
                        icon={icon}
                        label={label}
                        active={isActive(href)}
                        onClick={() => navigate(href)}
                      />
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="route-only"
                  {...fadeIn}
                  transition={{ duration: 0.12 }}
                  className="flex flex-col gap-2 items-start px-4"
                >
                  <NavIconBtn
                    icon={Route}
                    label="Processus"
                    active={false}
                    onClick={() => navigate('/workflows')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subnav: slides in when expanded */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16, delay: 0.07 }}
                className="flex flex-col flex-1 min-w-0 px-4 py-4 gap-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between gap-2 shrink-0">
                  <p className="text-xl font-semibold text-[#101828] leading-[30px] truncate">
                    {workflow.name}
                  </p>
                  <CollapseBtn onClick={toggleSidebar} />
                </div>

                <div className="flex flex-col gap-6">
                  {navGroups.map((group) => (
                    <div key={group.label} className="flex flex-col gap-3">
                      <p className="text-base font-medium text-[#475467] leading-6">
                        {group.label}
                      </p>
                      <div className="flex flex-col gap-1">
                        {group.items.map(({ href, label, icon }) => (
                          <NavTextBtn
                            key={href}
                            icon={icon}
                            label={label}
                            active={isActive(href)}
                            onClick={() => navigate(href)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        {pendingHref && (
          <UnsavedChangesModal
            onSave={handleSaveAndLeave}
            onDiscard={handleDiscard}
            onCancel={() => setPendingHref(null)}
          />
        )}
      </>
    )
  }

  // ─── Outside a workflow ───────────────────────────────────────────────────────

  const processusActive = pathname === '/workflows' || pathname.startsWith('/workflows/')

  return (
    <motion.aside
      animate={{ width: collapsed ? W.collapsed : W.expanded }}
      transition={widthTransition}
      className="flex flex-col shrink-0 h-full bg-white border-r border-[#eaecf0] overflow-hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {collapsed ? (
          <motion.div
            key="collapsed"
            {...fadeIn}
            transition={{ duration: 0.12 }}
            className="flex flex-col h-full py-4 gap-6"
          >
            <div className="flex flex-col items-center gap-4 px-2">
              <ExpandBtn onClick={toggleSidebar} />
              <ModuleIcon />
              <div className="w-full h-px bg-[#eaecf0]" />
            </div>
            <div className="flex flex-col gap-2 items-start px-4">
              <NavIconBtn
                icon={Route}
                label="Processus"
                active={processusActive}
                onClick={() => router.push('/workflows')}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            {...fadeInDelayed}
            className="flex flex-col h-full py-4 gap-6"
          >
            <div className="flex items-center gap-3 px-4">
              <ModuleIcon />
              <span className="flex-1 text-xl font-semibold text-[#101828] leading-[30px] whitespace-nowrap">
                Trace
              </span>
              <CollapseBtn onClick={toggleSidebar} />
            </div>
            <nav className="px-4">
              <NavTextBtn
                icon={Route}
                label="Processus"
                active={processusActive}
                onClick={() => router.push('/workflows')}
              />
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
