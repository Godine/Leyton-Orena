import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Home from './pages/Home.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Achievements from './pages/Achievements.jsx'
import Records from './pages/Records.jsx'
import Profile from './pages/Profile.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/records" element={<Records />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AppShell>
  )
}
