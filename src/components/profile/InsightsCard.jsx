import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { computeInsights } from '../../utils/computeInsights.js'

// Pattern-detection card for the Profile page. Reads the consultant's data,
// pulls out the most impactful 4-6 insights, and renders them as a list.
export default function InsightsCard({ consultant, allConsultants, months }) {
  const insights = computeInsights(consultant, allConsultants, months)
  if (!insights.length) return null

  return (
    <div className="arena-card p-5">
      <header className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-accent-amber animate-pulseRing" />
        <h3 className="font-display font-black text-arena-ink">Insights</h3>
        <span className="ml-auto text-[10px] uppercase tracking-[0.18em] text-arena-muted font-display font-bold">
          patterns from your data
        </span>
      </header>

      <ul className="space-y-2">
        {insights.map((ins, i) => (
          <motion.li
            key={ins.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i, type: 'spring', stiffness: 280, damping: 24 }}
            className="rounded-xl p-3 border"
            style={{
              background: `${ins.color}10`,
              borderColor: `${ins.color}33`,
            }}
          >
            <div className="flex items-start gap-2.5">
              <span
                className="h-9 w-9 rounded-xl grid place-items-center text-lg shrink-0"
                style={{ background: `${ins.color}22`, boxShadow: `inset 0 0 0 1px ${ins.color}55` }}
              >
                {ins.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className="font-display font-black text-sm leading-tight"
                  style={{ color: ins.color }}
                >
                  {ins.title}
                </div>
                <p className="text-[11px] text-arena-ink/85 mt-0.5 leading-snug">{ins.body}</p>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
