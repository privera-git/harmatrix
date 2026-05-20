import { Note } from '@/music/tonal'
import { SCALE_CATALOG } from '@/music/data/scales'
import type { ScaleMode } from '@/music/data/scales'

export type { ScaleMode }
export { SCALE_CATALOG }
export type { ScaleDef } from '@/music/data/scales'

export function buildScale(root: string, mode: ScaleMode): string[] {
  if (Note.get(root).empty) return []
  return SCALE_CATALOG[mode].intervals.flatMap((iv) => {
    const n = Note.transpose(root, iv)
    return n ? [n] : []
  })
}

export function degreeCount(mode: ScaleMode): number {
  return SCALE_CATALOG[mode].intervals.length
}
