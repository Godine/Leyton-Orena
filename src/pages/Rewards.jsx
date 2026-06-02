import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Coins, Check, Sparkles, X } from 'lucide-react'
import { useArenaStore } from '../store/useArenaStore.js'
import {
  useRewardStore, REWARDS, REWARD_CATEGORIES, rarityBreakdown, pointsForBadges,
} from '../store/useRewardStore.js'
import { useNotificationStore } from '../store/useNotificationStore.js'
import AnimatedCounter from '../components/shared/AnimatedCounter.jsx'

function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts)
  const m = Math.floor(diff / 60000)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function Rewards() {
  const currentUser = useArenaStore((s) => s.getCurrentUser())
  // Subscribe to the raw redemptions array, not a function call. Calling a
  // store method inside a selector returns a new array each render, which
  // makes Zustand think the state changed and triggers an infinite re-render
  // loop that bubbles up as an error to the ErrorBoundary.
  const redemptions = useRewardStore((s) => s.redemptions)
  const redeem = useRewardStore((s) => s.redeem)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const balance = useMemo(() => {
    const earned = pointsForBadges(currentUser?.badges)
    const spent = redemptions
      .filter((r) => r.consultantId === currentUser?.id)
      .reduce((acc, r) => acc + (REWARDS.find((x) => x.id === r.rewardId)?.cost ?? 0), 0)
    return { earned, spent, balance: earned - spent }
  }, [redemptions, currentUser])

  const history = useMemo(
    () => redemptions
      .filter((r) => r.consultantId === currentUser?.id)
      .sort((a, b) => b.at - a.at),
    [redemptions, currentUser],
  )

  const breakdown = useMemo(() => rarityBreakdown(currentUser?.badges ?? []), [currentUser])

  const [pending, setPending] = useState(null)
  const [justRedeemed, setJustRedeemed] = useState(null)

  const handleConfirm = () => {
    if (!pending) return
    const res = redeem(currentUser.id, pending.id)
    if (res.ok) {
      addNotification({
        kind: 'team',
        title: `Redeemed · ${pending.icon} ${pending.name}`,
        body: `${pending.cost} pt deducted. Treat yourself.`,
      })
      setJustRedeemed(pending.id)
      setTimeout(() => setJustRedeemed(null), 1500)
    }
    setPending(null)
  }

  const grouped = REWARD_CATEGORIES.map((cat) => ({
    name: cat,
    items: REWARDS.filter((r) => r.category === cat),
  }))

  return (
    <div className="space-y-8 xl:space-y-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-arena-surface border border-arena-border grid place-items-center shadow-glow">
            <Gift className="text-accent-green" size={24} strokeWidth={2.4} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl xl:text-6xl font-display font-black">
          <span className="text-accent-green">Rewards</span>
        </h1>
        <p className="text-arena-muted max-w-2xl">
          Cash in your badges. Common → 10 pt, Rare → 25, Epic → 50, Legendary → 100, Mythic → 250.
        </p>
      </header>

      {/* Balance + breakdown ------------------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 xl:gap-6">
        <div className="arena-card p-5 lg:col-span-1 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
            <Coins size={14} className="text-accent-amber" /> Available balance
          </div>
          <div className="font-display font-black text-arena-ink text-5xl">
            <AnimatedCounter value={balance.balance} format={(v) => Math.round(v).toLocaleString('en-GB')} />
            <span className="text-arena-muted text-xl ml-1.5">pt</span>
          </div>
          <div className="text-xs text-arena-muted">
            {balance.earned.toLocaleString('en-GB')} earned · {balance.spent.toLocaleString('en-GB')} spent
          </div>
        </div>

        <div className="arena-card p-5 lg:col-span-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold mb-3">
            How your points add up
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {breakdown.map((row) => (
              <li key={row.rarity} className="rounded-xl bg-arena-bg/40 border border-arena-border p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-arena-muted font-display font-bold">
                  {row.label}
                </div>
                <div className="font-display font-black text-arena-ink text-lg leading-tight">{row.count}</div>
                <div className="text-[11px] text-arena-muted">
                  = {row.points.toLocaleString('en-GB')} pt
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Catalogue ----------------------------------------------------------- */}
      <section className="space-y-6">
        {grouped.map((group) => (
          <div key={group.name} className="space-y-3">
            <header className="flex items-center gap-3">
              <h2 className="font-display font-black text-arena-ink text-lg">{group.name}</h2>
              <span className="h-px flex-1 bg-arena-border" />
              <span className="text-xs text-arena-muted">{group.items.length}</span>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {group.items.map((reward) => {
                const affordable = balance.balance >= reward.cost
                const ratio = Math.min(1, balance.balance / reward.cost)
                return (
                  <motion.button
                    key={reward.id}
                    layout
                    whileHover={affordable ? { y: -3 } : {}}
                    whileTap={affordable ? { scale: 0.98 } : {}}
                    disabled={!affordable}
                    onClick={() => setPending(reward)}
                    className={[
                      'relative arena-card p-4 text-left transition-colors',
                      affordable ? 'hover:border-accent-green/40' : 'opacity-60 cursor-not-allowed',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-2xl grid place-items-center text-2xl bg-arena-bg/40 border border-arena-border">
                        {reward.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-black text-arena-ink leading-tight truncate">
                          {reward.name}
                        </div>
                        <div className="text-xs text-arena-muted mt-1 leading-snug">{reward.description}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="arena-chip bg-accent-amber/15 text-accent-amber" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,200,0,0.4)' }}>
                        <Coins size={11} /> {reward.cost} pt
                      </span>
                      <span className={['text-[11px] font-display font-bold', affordable ? 'text-accent-green' : 'text-arena-muted'].join(' ')}>
                        {affordable ? 'Available' : `${Math.round(ratio * 100)}% there`}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-arena-surface2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${ratio * 100}%`, background: affordable ? '#F75C03' : '#ffc800' }}
                      />
                    </div>
                    <AnimatePresence>
                      {justRedeemed === reward.id && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-green text-arena-bg text-[10px] font-display font-black"
                        >
                          <Check size={11} strokeWidth={3.5} /> Redeemed
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* History ------------------------------------------------------------- */}
      <section>
        <header className="flex items-center gap-3 mb-3">
          <h2 className="font-display font-black text-arena-ink text-lg">Your redemptions</h2>
          <span className="h-px flex-1 bg-arena-border" />
          <span className="text-xs text-arena-muted">{history.length}</span>
        </header>
        {history.length === 0 ? (
          <div className="arena-card p-6 text-center text-sm text-arena-muted">
            You haven't cashed in yet. Treat yourself.
          </div>
        ) : (
          <ul className="arena-card p-0 divide-y divide-arena-border">
            {history.map((h) => {
              const r = REWARDS.find((x) => x.id === h.rewardId)
              if (!r) return null
              return (
                <li key={h.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl shrink-0">{r.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-arena-ink truncate">{r.name}</div>
                    <div className="text-[11px] text-arena-muted">{timeAgo(h.at)} · {r.category}</div>
                  </div>
                  <span className="arena-chip bg-arena-surface2 text-arena-muted">−{r.cost} pt</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Confirm modal ------------------------------------------------------- */}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-end md:place-items-center bg-black/60 backdrop-blur-sm p-0 md:p-6"
            onClick={() => setPending(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="w-full md:max-w-md bg-arena-surface border border-arena-border rounded-t-3xl md:rounded-3xl p-6 relative"
            >
              <button
                onClick={() => setPending(null)}
                className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full text-arena-muted hover:text-arena-ink hover:bg-arena-surface2"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-arena-muted font-display font-bold">
                <Sparkles size={12} className="text-accent-amber" /> Confirm redemption
              </div>
              <div className="flex items-center gap-3 mt-3">
                <div className="h-14 w-14 rounded-2xl grid place-items-center text-3xl bg-arena-bg/40 border border-arena-border">
                  {pending.icon}
                </div>
                <div>
                  <div className="font-display font-black text-arena-ink text-lg">{pending.name}</div>
                  <div className="text-xs text-arena-muted">{pending.description}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-arena-muted">Cost</span>
                <span className="font-display font-black text-arena-amber">{pending.cost} pt</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-arena-muted">Balance after</span>
                <span className="font-display font-black text-arena-ink">
                  {(balance.balance - pending.cost).toLocaleString('en-GB')} pt
                </span>
              </div>
              <div className="mt-5 flex items-center justify-end gap-2">
                <button onClick={() => setPending(null)} className="px-4 py-2 rounded-full text-sm font-display font-bold text-arena-muted hover:text-arena-ink">
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 rounded-full bg-accent-green text-arena-bg text-sm font-display font-bold shadow-glow"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
