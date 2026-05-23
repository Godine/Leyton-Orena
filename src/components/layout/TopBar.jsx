import NotificationBell from '../notifications/NotificationBell.jsx'

export default function TopBar() {
  return (
    <div className="flex items-center justify-end gap-3 mb-2">
      <NotificationBell />
    </div>
  )
}
