import { CHORD_CATALOG, type ChordQuality } from '@/music/data/chords'
import { SCALE_CATALOG, type ScaleMode } from '@/music/data/scales'
import { buildChord } from '@/music/chord'
import { buildScale } from '@/music/scale'
import { findRoot } from '@/music/reverse'

export interface MatrixCell {
  note: string
  isGiven: boolean
  row: number
  col: number
}

export interface MatrixPuzzle {
  quality: ChordQuality | ScaleMode
  diagonalNote: string
  size: number
  cells: MatrixCell[][]
}

export function generateMatrix(
  diagonalNote: string,
  quality: ChordQuality | ScaleMode,
): MatrixPuzzle | null {
  const size =
    quality in CHORD_CATALOG
      ? CHORD_CATALOG[quality as ChordQuality].intervals.length
      : SCALE_CATALOG[quality as ScaleMode].intervals.length

  const columns: string[][] = []
  for (let col = 0; col < size; col++) {
    const root = findRoot(diagonalNote, col, quality)
    if (root === null) return null

    const notes =
      quality in CHORD_CATALOG
        ? buildChord(root, quality as ChordQuality)
        : buildScale(root, quality as ScaleMode)

    columns.push(notes)
  }

  const cells: MatrixCell[][] = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col): MatrixCell => ({
      note: columns[col]?.[row] ?? '',
      isGiven: row === col,
      row,
      col,
    })),
  )

  return { quality, diagonalNote, size, cells }
}
