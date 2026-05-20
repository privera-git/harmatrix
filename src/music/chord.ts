import { Note } from '@/music/tonal'
import { CHORD_CATALOG } from '@/music/data/chords'
import type { ChordQuality } from '@/music/data/chords'

export type { ChordQuality }
export { CHORD_CATALOG }
export type { ChordDef } from '@/music/data/chords'

export function buildChord(root: string, quality: ChordQuality): string[] {
  if (Note.get(root).empty) return []
  return CHORD_CATALOG[quality].intervals.flatMap((iv) => {
    const n = Note.transpose(root, iv)
    return n ? [n] : []
  })
}

export function degreeCount(quality: ChordQuality): number {
  return CHORD_CATALOG[quality].intervals.length
}
