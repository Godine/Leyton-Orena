import Sidebar from './Sidebar.jsx'
import BottomTabs from './BottomTabs.jsx'
import TopBar from './TopBar.jsx'
import Toast from '../notifications/Toast.jsx'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex bg-arena-bg text-arena-ink">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-24 md:pb-8 md:pl-72">
        <div className="max-w-6xl mx-auto px-5 md:px-8 py-6 md:py-8">
          <TopBar />
          {children}
        </div>
      </main>
      <BottomTabs />
      <Toast />
    </div>
  )
}
