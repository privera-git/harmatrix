import { Note } from '@/music/tonal'

let sharedContext: AudioContext | null = null

function getContext(): AudioContext {
  if (!sharedContext) sharedContext = new AudioContext()
  if (sharedContext.state === 'suspended') void sharedContext.resume()
  return sharedContext
}

export function useAudio() {
  function playNote(noteName: string): void {
    const withOctave = /\d$/.test(noteName) ? noteName : `${noteName}4`
    const freq = Note.freq(withOctave)
    if (!freq) return

    try {
      const ctx = getContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.type = 'sine'
      osc.frequency.value = freq

      const now = ctx.currentTime
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.35, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

      osc.start(now)
      osc.stop(now + 0.45)
    } catch {
      // AudioContext unavailable (test env, sandboxed iframe, etc.)
    }
  }

  return { playNote }
}
