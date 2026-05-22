import { Medal } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Records() {
  return (
    <PagePlaceholder
      title="Hall of Records"
      subtitle="All-time bests: biggest months, fastest closes, longest streaks."
      icon={Medal}
      accent="coral"
    />
  )
}
