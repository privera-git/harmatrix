import { CHORD_CATALOG, type ChordQuality } from '@/music/data/chords'
import { SCALE_CATALOG, type ScaleMode } from '@/music/data/scales'
import { INTERVAL_CATALOG, type IntervalGroup } from '@/music/data/intervals'
import { invertInterval, transpose } from '@/music/interval'

export function findRoot(
  note: string,
  degreeIndex: number,
  quality: ChordQuality | ScaleMode | IntervalGroup,
): string | null {
  const intervals =
    quality in CHORD_CATALOG
      ? CHORD_CATALOG[quality as ChordQuality].intervals
      : quality in INTERVAL_CATALOG
        ? INTERVAL_CATALOG[quality as IntervalGroup].intervals
        : SCALE_CATALOG[quality as ScaleMode].intervals

  const interval = intervals[degreeIndex]
  if (interval === undefined) return null

  const inverted = invertInterval(interval)
  if (inverted === null) return null

  return transpose(note, inverted)
}
