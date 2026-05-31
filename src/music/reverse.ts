import { CHORD_CATALOG, type ChordQuality } from '@/music/data/chords'
import { SCALE_CATALOG, type ScaleMode } from '@/music/data/scales'
import { invertInterval, transpose } from '@/music/interval'

export function findRoot(
  note: string,
  degreeIndex: number,
  quality: ChordQuality | ScaleMode,
): string | null {
  const intervals =
    quality in CHORD_CATALOG
      ? CHORD_CATALOG[quality as ChordQuality].intervals
      : SCALE_CATALOG[quality as ScaleMode].intervals

  const interval = intervals[degreeIndex]
  if (interval === undefined) return null

  const inverted = invertInterval(interval)
  if (inverted === null) return null

  return transpose(note, inverted)
}
