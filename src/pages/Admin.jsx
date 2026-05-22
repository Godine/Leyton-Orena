import { Settings } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Admin() {
  return (
    <PagePlaceholder
      title="Admin"
      subtitle="Data management — import/edit consultants, months, and badge awards."
      icon={Settings}
      accent="coral"
    />
  )
}
