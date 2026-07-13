import { Note } from '@/music/tonal'

type JingleType = 'perfect' | 'enharmonic' | 'wrong' | 'fanfare'

const JINGLES: Record<JingleType, Array<{ note: string; delayMs: number }>> = {
  // Ascending major arpeggio — extra 50ms gap before final note for fanfare feel
  perfect: [
    { note: 'C5', delayMs: 0 },
    { note: 'E5', delayMs: 100 },
    { note: 'G5', delayMs: 200 },
    { note: 'C6', delayMs: 350 },
  ],
  // Two-octave ascending major arpeggio resolving on a held triad — substage/stage completion
  fanfare: [
    { note: 'C4', delayMs: 0 },
    { note: 'E4', delayMs: 90 },
    { note: 'G4', delayMs: 180 },
    { note: 'C5', delayMs: 270 },
    { note: 'E5', delayMs: 360 },
    { note: 'G5', delayMs: 450 },
    { note: 'C6', delayMs: 600 },
    { note: 'E5', delayMs: 600 },
    { note: 'G4', delayMs: 600 },
  ],
  // Dominant 7th arpeggio — ascends hopefully but ends on unresolved tension
  enharmonic: [
    { note: 'C4', delayMs: 0 },
    { note: 'E4', delayMs: 120 },
    { note: 'G4', delayMs: 240 },
    { note: 'Bb4', delayMs: 360 },
  ],
  // Descending chromatic line — universally negative
  wrong: [
    { note: 'C4', delayMs: 0 },
    { note: 'B3', delayMs: 100 },
    { note: 'Bb3', delayMs: 200 },
    { note: 'Ab3', delayMs: 300 },
  ],
}

let sharedContext: AudioContext | null = null

function getContext(): AudioContext {
  if (!sharedContext) sharedContext = new AudioContext()
  if (sharedContext.state === 'suspended') void sharedContext.resume()
  return sharedContext
}

function scheduleNote(ctx: AudioContext, note: string, startTime: number): void {
  const freq = Note.freq(note)
  if (!freq) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.value = freq

  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(0.35, startTime + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)

  osc.start(startTime)
  osc.stop(startTime + 0.4)
}

export function useAudio() {
  function playNote(noteName: string): void {
    const withOctave = /\d$/.test(noteName) ? noteName : `${noteName}4`
    try {
      const ctx = getContext()
      scheduleNote(ctx, withOctave, ctx.currentTime)
    } catch {
      // AudioContext unavailable (test env, sandboxed iframe, etc.)
    }
  }

  function playJingle(type: JingleType): void {
    try {
      const ctx = getContext()
      const base = ctx.currentTime
      for (const { note, delayMs } of JINGLES[type]) {
        scheduleNote(ctx, note, base + delayMs / 1000)
      }
    } catch {
      // AudioContext unavailable
    }
  }

  return { playNote, playJingle }
}
