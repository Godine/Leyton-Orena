import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useArenaStore } from '../../store/useArenaStore.js'
import { useRewardStore, REWARDS, pointsForBadges } from '../../store/useRewardStore.js'

// Always-visible Arena points balance for the current user. Clicking it deep
// links to /rewards. Subscribes to the redemptions array so the number
// updates the moment a reward is cashed in.
export default function RewardsBalance() {
  const currentUser = useArenaStore((s) => s.getCurrentUser())
  const redemptions = useRewardStore((s) => s.redemptions)

  const balance = useMemo(() => {
    const earned = pointsForBadges(currentUser?.badges)
    const spent = redemptions
      .filter((r) => r.consultantId === currentUser?.id)
      .reduce((acc, r) => acc + (REWARDS.find((x) => x.id === r.rewardId)?.cost ?? 0), 0)
    return earned - spent
  }, [redemptions, currentUser])

  return (
    <Link
      to="/rewards"
      title={`${balance.toLocaleString('en-GB')} Arena points · cash in for rewards`}
      aria-label={`${balance} Arena points`}
      className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full bg-arena-surface border border-arena-border hover:border-accent-amber/60 transition-colors"
    >
      <Coins size={14} className="text-accent-amber" strokeWidth={2.6} />
      <motion.span
        key={balance}
        initial={{ y: -4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="text-xs font-display font-black text-arena-ink tabular-nums"
      >
        {balance.toLocaleString('en-GB')}
      </motion.span>
      <span className="text-[10px] uppercase tracking-wider text-arena-muted font-display font-bold">
        pt
      </span>
    </Link>
  )
}
