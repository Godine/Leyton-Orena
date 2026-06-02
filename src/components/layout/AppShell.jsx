import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import Toast from '../notifications/Toast.jsx'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex bg-arena-bg text-arena-ink">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-8 md:pl-72">
        <div className="max-w-[1480px] 2xl:max-w-[1680px] mx-auto px-5 md:px-8 xl:px-12 py-6 md:py-8 xl:py-10">
          <TopBar />
          {children}
        </div>
      </main>
      <Toast />
    </div>
  )
}

