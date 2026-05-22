import { User } from 'lucide-react'
import PagePlaceholder from '../components/PagePlaceholder.jsx'

export default function Profile() {
  return (
    <PagePlaceholder
      title="My Profile"
      subtitle="Your personal arena stats — streaks, badges, and how you stack up."
      icon={User}
      accent="green"
    />
  )
}
