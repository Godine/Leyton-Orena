import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/layout/AppShell.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'
import { PageSkeleton } from './components/shared/SkeletonLoader.jsx'
import DemoModeDriver from './components/admin/DemoModeDriver.jsx'
import WalkthroughOverlay from './components/admin/WalkthroughOverlay.jsx'
import WelcomeSplash from './components/WelcomeSplash.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import { useArenaStore } from './store/useArenaStore.js'

const Home         = lazy(() => import('./pages/Home.jsx'))
const Leaderboard  = lazy(() => import('./pages/Leaderboard.jsx'))
const Achievements = lazy(() => import('./pages/Achievements.jsx'))
const Records      = lazy(() => import('./pages/Records.jsx'))
const Profile      = lazy(() => import('./pages/Profile.jsx'))
const Manager      = lazy(() => import('./pages/Manager.jsx'))
const Rewards      = lazy(() => import('./pages/Rewards.jsx'))
const Wrapped      = lazy(() => import('./pages/Wrapped.jsx'))
const Duels        = lazy(() => import('./pages/Duels.jsx'))
const Admin        = lazy(() => import('./pages/Admin.jsx'))

export default function App() {
  const location = useLocation()
  const theme = useArenaStore((s) => s.theme)
  const seenOnboarding = useArenaStore((s) => s.seenOnboarding)
  const markOnboardingSeen = useArenaStore((s) => s.markOnboardingSeen)
  const setWalkthroughOpen = useArenaStore((s) => s.setWalkthroughOpen)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // First-run onboarding: auto-launch the walkthrough exactly once. Delayed
  // until after the welcome splash fades out so the two don't compete.
  useEffect(() => {
    if (seenOnboarding) return
    const t = setTimeout(() => {
      setWalkthroughOpen(true)
      markOnboardingSeen()
    }, 2400)
    return () => clearTimeout(t)
  }, [seenOnboarding, markOnboardingSeen, setWalkthroughOpen])

  return (
    <AppShell>
      <ErrorBoundary>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Suspense fallback={<PageSkeleton />}>
              <Routes location={location}>
                <Route path="/"             element={<Home />} />
                <Route path="/leaderboard"  element={<Leaderboard />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/records"      element={<Records />} />
                <Route path="/profile"      element={<Profile />} />
                <Route path="/manager"      element={<Manager />} />
                <Route path="/rewards"      element={<Rewards />} />
                <Route path="/wrapped"      element={<Wrapped />} />
                <Route path="/duels"        element={<Duels />} />
                <Route path="/admin"        element={<Admin />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </ErrorBoundary>
      <DemoModeDriver />
      <WalkthroughOverlay />
      <WelcomeSplash />
      <CommandPalette />
    </AppShell>
  )
}
