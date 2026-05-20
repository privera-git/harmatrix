import { Note, Interval } from '@/music/tonal'

export function intervalBetween(from: string, to: string): string | null {
  const result = Note.distance(from, to)
  return result === '' ? null : result
}

export function transpose(note: string, interval: string): string | null {
  const result = Note.transpose(note, interval)
  return result === '' ? null : result
}

export function invertInterval(interval: string): string | null {
  if (Interval.get(interval).empty) return null
  const result = Interval.invert(interval)
  return result === '' ? null : result
}

export function semitones(interval: string): number | null {
  const n = Interval.semitones(interval)
  return isNaN(n) ? null : n
}
