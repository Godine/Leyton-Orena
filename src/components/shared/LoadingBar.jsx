import { AnimatePresence, motion } from 'framer-motion'

// Slim 2px progress bar that crosses the top of its container while `active`
// is true. Useful as a transitional indicator paired with useStaleWhileChanging.
export default function LoadingBar({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="loading-bar"
          className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none rounded-t-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            className="absolute inset-y-0 w-1/3 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, #F75C03, transparent)',
              boxShadow: '0 0 12px rgba(247,92,3,0.6)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '300%' }}
            transition={{ duration: 1.0, ease: 'easeInOut', repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
