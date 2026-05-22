import { Trophy } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Leaderboard() {
  return (
    <PagePlaceholder
      title="Leaderboard"
      subtitle="Who's hot, who's climbing, who's slipping. Filterable rankings coming next."
      icon={Trophy}
      accent="amber"
    />
  )
}
