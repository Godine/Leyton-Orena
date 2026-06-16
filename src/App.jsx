import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from './components/layout/AppShell.jsx'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'
import { PageSkeleton } from './components/shared/SkeletonLoader.jsx'
import DemoModeDriver from './components/admin/DemoModeDriver.jsx'
import WalkthroughOverlay from './components/admin/WalkthroughOverlay.jsx'
import WelcomeSplash from './components/WelcomeSplash.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import { useArenaStore } from './store/useArenaStore.js'

const Landing      = lazy(() => import('./pages/Landing.jsx'))
const Login        = lazy(() => import('./pages/Login.jsx'))
const Home         = lazy(() => import('./pages/Home.jsx'))
const Leaderboard  = lazy(() => import('./pages/Leaderboard.jsx'))
const Achievements = lazy(() => import('./pages/Achievements.jsx'))
const Records      = lazy(() => import('./pages/Records.jsx'))
const Profile      = lazy(() => import('./pages/Profile.jsx'))
const Manager      = lazy(() => import('./pages/Manager.jsx'))
const Rewards      = lazy(() => import('./pages/Rewards.jsx'))
const Wrapped      = lazy(() => import('./pages/Wrapped.jsx'))
const Duels        = lazy(() => import('./pages/Duels.jsx'))
const Compare      = lazy(() => import('./pages/Compare.jsx'))
const Seasons      = lazy(() => import('./pages/Seasons.jsx'))
const Admin        = lazy(() => import('./pages/Admin.jsx'))

// Wraps app pages in the AppShell + ErrorBoundary + page transition. Redirects
// to /login when the user isn't authed.
function AppRoute({ children }) {
  const isAuthed = useArenaStore((s) => s.isAuthed)
  const location = useLocation()
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location }} />
  return (
    <AppShell>
      <ErrorBoundary>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </ErrorBoundary>
      <DemoModeDriver />
      <WalkthroughOverlay />
      <WelcomeSplash />
      <CommandPalette />
    </AppShell>
  )
}

// `/` decides based on auth: Landing when logged out, Home when logged in.
function RootRoute() {
  const isAuthed = useArenaStore((s) => s.isAuthed)
  return isAuthed ? <AppRoute><Home /></AppRoute> : <Landing />
}

export default function App() {
  const location = useLocation()
  const theme = useArenaStore((s) => s.theme)
  const isAuthed = useArenaStore((s) => s.isAuthed)
  const seenOnboarding = useArenaStore((s) => s.seenOnboarding)
  const markOnboardingSeen = useArenaStore((s) => s.markOnboardingSeen)
  const setWalkthroughOpen = useArenaStore((s) => s.setWalkthroughOpen)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // First-run onboarding fires only inside the app (after login). The slight
  // delay lets the welcome splash finish first.
  useEffect(() => {
    if (!isAuthed || seenOnboarding) return
    const t = setTimeout(() => {
      setWalkthroughOpen(true)
      markOnboardingSeen()
    }, 2400)
    return () => clearTimeout(t)
  }, [isAuthed, seenOnboarding, markOnboardingSeen, setWalkthroughOpen])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location}>
          <Route path="/"             element={<RootRoute />} />
          <Route path="/login"        element={<Login />} />
          <Route path="/leaderboard"  element={<AppRoute><Leaderboard /></AppRoute>} />
          <Route path="/achievements" element={<AppRoute><Achievements /></AppRoute>} />
          <Route path="/records"      element={<AppRoute><Records /></AppRoute>} />
          <Route path="/profile"      element={<AppRoute><Profile /></AppRoute>} />
          <Route path="/manager"      element={<AppRoute><Manager /></AppRoute>} />
          <Route path="/rewards"      element={<AppRoute><Rewards /></AppRoute>} />
          <Route path="/wrapped"      element={<AppRoute><Wrapped /></AppRoute>} />
          <Route path="/duels"        element={<AppRoute><Duels /></AppRoute>} />
          <Route path="/compare"      element={<AppRoute><Compare /></AppRoute>} />
          <Route path="/seasons"      element={<AppRoute><Seasons /></AppRoute>} />
          <Route path="/admin"        element={<AppRoute><Admin /></AppRoute>} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
