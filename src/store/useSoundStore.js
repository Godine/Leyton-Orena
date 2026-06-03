import { create } from 'zustand'

// Tiny WebAudio-synthesised SFX. Zero asset files, < 1KB each call. Each
// sound is a sequence of short notes with a quick envelope so they feel
// tactile rather than musical.

let audioCtx = null
function ctx() {
  if (typeof window === 'undefined') return null
  if (audioCtx) return audioCtx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  audioCtx = new AC()
  return audioCtx
}

function tone(freq, time, dur = 0.18, gain = 0.12, type = 'sine') {
  const c = ctx()
  if (!c) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, time)
  g.gain.setValueAtTime(0, time)
  g.gain.linearRampToValueAtTime(gain, time + 0.005)
  g.gain.exponentialRampToValueAtTime(0.001, time + dur)
  o.connect(g)
  g.connect(c.destination)
  o.start(time)
  o.stop(time + dur)
}

const RECIPES = {
  unlock: (t) => {                 // bright ascending arpeggio + bell ring
    tone(523.25, t + 0.00, 0.12, 0.10)
    tone(659.25, t + 0.07, 0.12, 0.10)
    tone(987.77, t + 0.14, 0.45, 0.14, 'triangle')
  },
  win: (t) => {                    // triumphant triad
    tone(523.25, t + 0.00, 0.16)
    tone(659.25, t + 0.10, 0.16)
    tone(783.99, t + 0.20, 0.35, 0.15, 'triangle')
  },
  milestone: (t) => {              // soft chime
    tone(880.00, t + 0.00, 0.30, 0.10, 'triangle')
    tone(1318.51, t + 0.04, 0.28, 0.08, 'triangle')
  },
  pop: (t) => {                    // tiny tap for UI confirms
    tone(660.00, t + 0.00, 0.08, 0.08)
  },
}

export const useSoundStore = create((set, get) => ({
  enabled:
    typeof window !== 'undefined' && localStorage.getItem('arena-sound') === '1',
  setEnabled: (v) => {
    if (typeof window !== 'undefined') localStorage.setItem('arena-sound', v ? '1' : '0')
    set({ enabled: v })
    // Unlock AudioContext on user gesture (the toggle click counts).
    if (v) {
      const c = ctx()
      if (c && c.state === 'suspended') c.resume()
    }
  },
  play: (name) => {
    if (!get().enabled) return
    const c = ctx()
    if (!c) return
    if (c.state === 'suspended') c.resume()
    const recipe = RECIPES[name]
    if (recipe) recipe(c.currentTime)
  },
}))
