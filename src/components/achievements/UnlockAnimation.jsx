import { motion } from 'framer-motion'

// 12 sparks bursting outward + a flash ring. Sits absolutely over a badge card.
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  return { x: Math.cos(angle) * 70, y: Math.sin(angle) * 70 }
})

export default function UnlockAnimation({ color = '#ffc800', delay = 0.5 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ delay, duration: 1.2, times: [0, 0.2, 1] }}
      className="pointer-events-none absolute inset-0 grid place-items-center"
    >
      <motion.span
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: [0, 1.4, 1.8], opacity: [0.8, 0.4, 0] }}
        transition={{ delay, duration: 1.0, ease: 'easeOut' }}
        className="absolute h-24 w-24 rounded-full"
        style={{ boxShadow: `0 0 36px 8px ${color}` }}
      />
      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
          animate={{ x: s.x, y: s.y, opacity: [0, 1, 0], scale: [0.6, 1, 0.4] }}
          transition={{ delay: delay + 0.05, duration: 0.9, ease: 'easeOut' }}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      ))}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: -28, opacity: [0, 1, 1, 0] }}
        transition={{ delay: delay + 0.3, duration: 1.3, times: [0, 0.2, 0.7, 1] }}
        className="absolute font-display font-black text-sm tracking-wider uppercase"
        style={{ color, textShadow: `0 0 10px ${color}` }}
      >
        Unlocked!
      </motion.div>
    </motion.div>
  )
}
