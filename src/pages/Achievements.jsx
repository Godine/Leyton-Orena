import { Award } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Achievements() {
  return (
    <PagePlaceholder
      title="Achievements"
      subtitle="The badge gallery — earned, locked, and just out of reach."
      icon={Award}
      accent="amber"
    />
  )
}
