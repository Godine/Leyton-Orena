import { motion } from 'framer-motion'
import { Award, Trophy, TrendingUp, Flame, Medal, Zap } from 'lucide-react'

// Mock events — hand-authored to read like real arena activity.
const EVENT_KINDS = {
  badge:  { Icon: Award,      color: '#ce82ff' },
  record: { Icon: Medal,      color: '#ffc800' },
  rank:   { Icon: TrendingUp, color: '#58cc02' },
  streak: { Icon: Flame,      color: '#ff4b4b' },
  close:  { Icon: Zap,        color: '#1cb0f6' },
  champ:  { Icon: Trophy,     color: '#ffc800' },
}

const EVENTS = [
  { kind: 'badge',  who: 'Amélie Laurent',  text: 'unlocked 🏔️ Peak Month — best invoice month of her career.', ago: '4m ago' },
  { kind: 'record', who: 'Helena Voss',     text: 'is closing in on Highest Quarterly Invoice — 92% there.',     ago: '18m ago' },
  { kind: 'rank',   who: 'Yusuf El-Amrani', text: 'climbed two spots to #3 on the Technical leaderboard.',       ago: '32m ago' },
  { kind: 'streak', who: 'Saoirse Kelly',   text: 'just hit a 5-month delivery streak 🔥',                       ago: '1h ago' },
  { kind: 'close',  who: 'Marc Dufresne',   text: 'closed an Op in 1.8 days — fastest of the month.',            ago: '2h ago' },
  { kind: 'badge',  who: 'Sara Benkirane',  text: 'earned 💎 Diamond Hands for 12 Ops in March.',                'ago': '3h ago' },
  { kind: 'champ',  who: 'Helena Voss',     text: 'is the current Arena Champion (Q1).',                          ago: '5h ago' },
  { kind: 'rank',   who: 'Ines Cherkaoui',  text: 'overtook Tom Whitaker to break into the top 5 in Financial.', ago: '7h ago' },
  { kind: 'badge',  who: 'Niamh Doyle',     text: 'unlocked 🛡️ Iron Wall — zero pushed Ops in March.',           ago: '9h ago' },
  { kind: 'streak', who: 'Priya Anand',     text: 'extended her streak to 2 months in a row.',                    ago: '12h ago' },
  { kind: 'record', who: 'Sara Benkirane',  text: 'set a new personal best for early-invoice % (94%).',           ago: '1d ago' },
  { kind: 'badge',  who: 'Mehdi Bouzid',    text: 'earned 🌅 Early Bird for raising day-2 invoices.',             ago: '1d ago' },
]

export default function ActivityFeed() {
  return (
    <section>
      <header className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-display font-black text-arena-ink text-lg">Team activity</h2>
        <span className="text-xs text-arena-muted">last 24 hours</span>
      </header>
      <ol className="relative arena-card p-0 overflow-hidden divide-y divide-arena-border">
        {EVENTS.map((e, i) => {
          const meta = EVENT_KINDS[e.kind]
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, type: 'spring', stiffness: 240, damping: 22 }}
              className="flex items-start gap-3 px-4 py-3 hover:bg-arena-surface2/40"
            >
              <span
                className="h-9 w-9 rounded-xl grid place-items-center shrink-0 mt-0.5"
                style={{ background: `${meta.color}22`, boxShadow: `inset 0 0 0 1px ${meta.color}55` }}
              >
                <meta.Icon size={15} style={{ color: meta.color }} strokeWidth={2.4} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">
                  <span className="font-display font-bold text-arena-ink">{e.who}</span>{' '}
                  <span className="text-arena-ink/80">{e.text}</span>
                </p>
                <p className="text-[10px] uppercase tracking-wider text-arena-muted mt-1">{e.ago}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}
