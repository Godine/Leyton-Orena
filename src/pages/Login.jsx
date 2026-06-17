import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lock, Mail, ChevronDown, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useArenaStore } from '../store/useArenaStore.js'

const PRELOAD_EMAIL = 'oumayma.benali@leyton.com'
const PRELOAD_PASSWORD = 'arena-demo-2026'

export default function Login() {
  const consultants = useArenaStore((s) => s.consultants)
  const login = useArenaStore((s) => s.login)
  const isAuthed = useArenaStore((s) => s.isAuthed)
  const navigate = useNavigate()

  const [email, setEmail] = useState(PRELOAD_EMAIL)
  const [password, setPassword] = useState(PRELOAD_PASSWORD)
  const [showPw, setShowPw] = useState(false)
  const [consultantId, setConsultantId] = useState(consultants[0]?.id ?? 'c-01')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthed) navigate('/', { replace: true })
  }, [isAuthed, navigate])

  // Landing/login render in dark theme regardless of app theme.
  useEffect(() => {
    const prev = document.documentElement.dataset.theme
    document.documentElement.dataset.theme = 'dark'
    return () => { document.documentElement.dataset.theme = prev || 'light' }
  }, [])

  function submit(e) {
    e?.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setTimeout(() => {
      login(consultantId)
      navigate('/', { replace: true })
    }, 700)
  }

  const picked = consultants.find((c) => c.id === consultantId) ?? consultants[0]

  return (
    <div className="relative min-h-screen bg-arena-bg text-white overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(247,92,3,0.5), transparent 60%)' }}
          animate={{ x: [0, 20, 0], y: [0, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,200,0,0.32), transparent 60%)' }}
          animate={{ x: [0, -20, 0], y: [0, -15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-30" aria-hidden>
          <defs>
            <pattern id="login-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.15)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-dots)" />
        </svg>
      </div>

      {/* Top bar */}
      <header className="max-w-7xl mx-auto px-5 md:px-8 pt-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 select-none">
          <Logo size={32} className="drop-shadow-[0_4px_18px_rgba(247,92,3,0.5)]" />
          <div className="leading-none">
            <div className="font-display font-black text-lg tracking-tight text-white">
              Leyton<span className="text-arena-amber"> Arena</span>
            </div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-white/50 mt-1">
              R&D delivery · gamified
            </div>
          </div>
        </Link>
        <Link
          to="/"
          className="text-xs text-white/60 hover:text-white font-display font-bold"
        >
          ← Back to landing
        </Link>
      </header>

      {/* Card */}
      <main className="relative max-w-md mx-auto px-5 md:px-0 pt-12 md:pt-20 pb-20">
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-3xl border border-white/15 bg-arena-surface/80 backdrop-blur p-8 shadow-2xl"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-arena-amber/15 border border-arena-amber/30 text-[10px] uppercase tracking-[0.2em] text-arena-amber font-display font-black">
            <ShieldCheck size={11} strokeWidth={3} /> MVP · mock login
          </div>
          <h1 className="mt-3 font-display font-black text-white text-3xl">Welcome back</h1>
          <p className="mt-1.5 text-sm text-white/60">
            Credentials are pre-filled so you can dive straight into the demo.
            Pick which consultant you want to log in as.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {/* Email */}
            <Field label="Email" icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm font-display font-bold text-white placeholder-white/30 focus:outline-none"
              />
            </Field>

            {/* Password */}
            <Field label="Password" icon={Lock} right={
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-white/40 hover:text-white/80"
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm font-display font-bold text-white placeholder-white/30 focus:outline-none tracking-wider"
              />
            </Field>

            {/* Consultant picker */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-display font-bold mb-2">
                Log in as
              </div>
              <div className="relative">
                <select
                  value={consultantId}
                  onChange={(e) => setConsultantId(e.target.value)}
                  className="w-full appearance-none bg-white/[0.04] border border-white/15 rounded-2xl pl-4 pr-10 py-3 text-sm font-display font-bold text-white focus:outline-none focus:border-arena-amber/60 cursor-pointer"
                >
                  {consultants.map((c) => (
                    <option key={c.id} value={c.id} className="bg-arena-surface">
                      {c.name} — {c.role} · {c.location}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
              <AnimatePresence mode="wait">
                {picked && (
                  <motion.div
                    key={picked.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10"
                  >
                    <span
                      className="h-8 w-8 rounded-lg grid place-items-center font-display font-black text-arena-bg text-xs shrink-0"
                      style={{ background: 'linear-gradient(135deg, #F75C03, #ffc800)' }}
                    >
                      {picked.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-display font-black text-white truncate">
                        {picked.name}
                      </div>
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/40 font-display font-bold truncate">
                        {picked.role} · {picked.location}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-arena-amber text-arena-bg font-display font-black text-sm shadow-[0_8px_32px_rgba(255,200,0,0.45)] hover:brightness-110 transition disabled:opacity-70 disabled:cursor-wait"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" strokeWidth={3} />
                  Entering the arena…
                </>
              ) : (
                <>
                  Log in
                  <ArrowRight size={16} strokeWidth={3} />
                </>
              )}
            </motion.button>

            <div className="flex items-center justify-between text-[11px] text-white/40 font-display font-bold">
              <span>This is an MVP. No data is sent anywhere.</span>
            </div>
          </form>
        </motion.div>

        <div className="mt-6 text-center text-[11px] text-white/40 font-display font-bold">
          New here? You don't need an account — credentials are prefilled.
        </div>
      </main>
    </div>
  )
}

function Field({ label, icon: Icon, right, children }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-display font-bold mb-2">
        {label}
      </div>
      <div className="flex items-center gap-3 bg-white/[0.04] border border-white/15 rounded-2xl px-4 py-3 focus-within:border-arena-amber/60 transition-colors">
        <Icon size={16} className="text-white/40 shrink-0" />
        {children}
        {right}
      </div>
    </div>
  )
}
