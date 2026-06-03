import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import { NAV_ITEMS } from './layout/navConfig.js'
import { BADGES, BADGES_BY_ID } from '../data/badges.js'

// Lightweight fuzzy scorer. Returns a positive score when every character of
// `needle` appears in `haystack` in order; lower (better) for tighter matches.
// 0 means no match.
function fuzzyScore(needle, haystack) {
  if (!needle) return 1
  const n = needle.toLowerCase()
  const h = haystack.toLowerCase()
  if (h.includes(n)) {
    // Substring matches are best, weighted by position so prefix wins.
    return 100 - h.indexOf(n)
  }
  let score = 0, hi = 0
  for (let ni = 0; ni < n.length; ni++) {
    const idx = h.indexOf(n[ni], hi)
    if (idx === -1) return 0
    score += 30 - Math.min(30, idx - hi)
    hi = idx + 1
  }
  return Math.max(1, score)
}

const RARITY_HEX = {
  common: '#8e8ea0', rare: '#1cb0f6', epic: '#ce82ff', legendary: '#ffc800', mythic: '#2DD4BF',
}

// ──────────────────────────────────────────────────────────────────────────

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  const consultants = useArenaStore((s) => s.consultants)
  const setCurrentUserId = useArenaStore((s) => s.setCurrentUserId)

  // Open via ⌘K / Ctrl+K from anywhere.
  useEffect(() => {
    function onKey(e) {
      const isMac = navigator.platform.toUpperCase().includes('MAC')
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Reset when opened; focus input.
  useEffect(() => {
    if (!open) return
    setQuery('')
    setActive(0)
    setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  // Build the full searchable index every render (cheap for our size).
  const items = useMemo(() => {
    const pages = NAV_ITEMS.map((n) => ({
      kind: 'page',
      id: `page:${n.to}`,
      title: n.label,
      subtitle: n.to,
      icon: n.icon,
      onPick: () => navigate(n.to),
    }))
    const people = consultants.map((c) => ({
      kind: 'consultant',
      id: `c:${c.id}`,
      title: c.name,
      subtitle: `${c.role} · ${c.location}${c.seniority ? ` · ${c.seniority}` : ''}`,
      onPick: () => { setCurrentUserId(c.id); navigate('/profile') },
    }))
    const badges = BADGES.map((b) => ({
      kind: 'badge',
      id: `b:${b.id}`,
      title: b.name,
      subtitle: b.description,
      glyph: b.icon,
      accent: RARITY_HEX[b.rarity],
      onPick: () => navigate('/achievements'),
    }))
    return [...pages, ...people, ...badges]
  }, [consultants, navigate, setCurrentUserId])

  const results = useMemo(() => {
    if (!query) {
      // Default: a curated mix — pages first, then the current user's
      // closest reach. For demo simplicity, just show the pages.
      return items.filter((i) => i.kind === 'page').slice(0, 8)
    }
    return items
      .map((i) => ({ ...i, score: fuzzyScore(query, `${i.title} ${i.subtitle ?? ''}`) }))
      .filter((i) => i.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
  }, [items, query])

  // Reset active row when results change.
  useEffect(() => { setActive(0) }, [results])

  // Keep the active row visible.
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector(`[data-row="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  function pick(i) {
    const r = results[i]
    if (!r) return
    r.onPick()
    setOpen(false)
  }

  function onInputKey(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(active)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: -20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-full max-w-xl bg-arena-surface border border-arena-border rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-arena-border">
              <Search size={18} className="text-arena-muted shrink-0" strokeWidth={2.4} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Jump to a page, consultant, or badge…"
                className="flex-1 bg-transparent text-arena-ink placeholder:text-arena-muted text-sm font-display font-bold focus:outline-none"
              />
              <kbd className="hidden md:inline text-[10px] uppercase tracking-wider text-arena-muted font-mono px-2 py-0.5 rounded bg-arena-bg/60 border border-arena-border">
                Esc
              </kbd>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="md:hidden h-8 w-8 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results */}
            <ul
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto py-1"
            >
              {results.length === 0 && (
                <li className="px-4 py-8 text-center text-sm text-arena-muted">
                  Nothing matches “{query}”.
                </li>
              )}
              {results.map((r, i) => (
                <li key={r.id} data-row={i}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(i)}
                    className={[
                      'w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors',
                      active === i
                        ? 'bg-accent-green/10 text-arena-ink'
                        : 'text-arena-ink/90 hover:bg-arena-surface2/60',
                    ].join(' ')}
                  >
                    <Glyph item={r} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-display font-bold truncate">{r.title}</div>
                      {r.subtitle && (
                        <div className="text-[11px] text-arena-muted truncate">{r.subtitle}</div>
                      )}
                    </div>
                    <KindChip kind={r.kind} />
                    {active === i && (
                      <ArrowRight size={14} className="text-accent-green shrink-0" strokeWidth={2.6} />
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Footer hints */}
            <div className="px-4 py-2.5 border-t border-arena-border flex items-center gap-3 text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">
              <span className="inline-flex items-center gap-1">
                <kbd className="font-mono px-1.5 py-0.5 rounded bg-arena-bg/60 border border-arena-border">↑↓</kbd> navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="font-mono px-1.5 py-0.5 rounded bg-arena-bg/60 border border-arena-border">↵</kbd> select
              </span>
              <span className="ml-auto inline-flex items-center gap-1">
                <kbd className="font-mono px-1.5 py-0.5 rounded bg-arena-bg/60 border border-arena-border">⌘K</kbd>
                anywhere
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Glyph({ item }) {
  if (item.kind === 'consultant') {
    const initials = item.title.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    return (
      <span
        className="h-8 w-8 rounded-lg grid place-items-center font-display font-black text-[11px] text-arena-bg shrink-0"
        style={{ background: 'linear-gradient(135deg,#F75C03,#ffc800)' }}
      >
        {initials}
      </span>
    )
  }
  if (item.kind === 'badge') {
    return (
      <span
        className="h-8 w-8 rounded-lg grid place-items-center text-base shrink-0"
        style={{
          background: `${item.accent}1f`,
          boxShadow: `inset 0 0 0 1px ${item.accent}55`,
        }}
      >
        {item.glyph}
      </span>
    )
  }
  // Page
  const Icon = item.icon
  return (
    <span className="h-8 w-8 rounded-lg grid place-items-center bg-arena-bg/60 border border-arena-border shrink-0">
      {Icon && <Icon size={15} strokeWidth={2.4} className="text-arena-ink" />}
    </span>
  )
}

function KindChip({ kind }) {
  const label = kind === 'page' ? 'Page' : kind === 'consultant' ? 'Person' : 'Badge'
  return (
    <span className="hidden md:inline arena-chip bg-arena-surface2 text-arena-muted text-[9px] py-0.5 px-2">
      {label}
    </span>
  )
}

// Render a button that opens the palette — used in TopBar.
export function CommandPaletteTrigger() {
  // We don't share state with the palette; instead simulate a ⌘K event.
  function open() {
    const isMac = navigator.platform.toUpperCase().includes('MAC')
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: isMac,
      ctrlKey: !isMac,
    }))
  }
  return (
    <button
      onClick={open}
      title="Search (⌘K)"
      aria-label="Open command palette"
      className="hidden md:inline-flex items-center gap-2 h-10 px-3 rounded-full bg-arena-surface border border-arena-border hover:border-accent-green/50 transition-colors text-xs font-display font-bold text-arena-muted"
    >
      <Search size={14} strokeWidth={2.4} />
      <span>Search</span>
      <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-arena-bg/60 border border-arena-border">
        ⌘K
      </kbd>
    </button>
  )
}
