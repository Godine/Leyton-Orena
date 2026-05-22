import { Home as HomeIcon } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Home() {
  return (
    <PagePlaceholder
      title="Welcome to the Arena"
      subtitle="Your overview dashboard — streaks, this month's standing, and quick wins will live here."
      icon={HomeIcon}
      accent="green"
    />
  )
}
