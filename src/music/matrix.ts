import { CHORD_CATALOG, type ChordQuality } from '@/music/data/chords'
import { SCALE_CATALOG, type ScaleMode } from '@/music/data/scales'
import { buildChord } from '@/music/chord'
import { buildScale } from '@/music/scale'
import { findRoot } from '@/music/reverse'
import { Note } from '@/music/tonal'
import { enharmonicsOf } from '@/music/note'

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
  degrees: string[]
  cells: MatrixCell[][]
}

// Converts interval notation (e.g. '3m', '5d', '9A') to a degree label (e.g. '♭3', '♭5', '♯9').
export function intervalToDegreeLabel(interval: string): string {
  const match = interval.match(/^(\d+)([A-Za-z])$/)
  if (!match) return interval
  const [, num, qual] = match
  if (qual === 'A') return `♯${num}`
  if (qual === 'm') return `♭${num}`
  if (qual === 'd') return num === '7' ? '°7' : `♭${num}`
  return num! // P (perfect) or M (major) — no accidental
}

function columnIsUnsolvable(notes: string[], diagonalRow: number): boolean {
  return notes.some((note, row) => {
    if (row === diagonalRow) return false
    const n = Note.get(note)
    return !n.empty && Math.abs(n.alt) > 2
  })
}

function bestEnharmonicReplacement(note: string): string | null {
  const candidates = enharmonicsOf(note).filter((e) => {
    const n = Note.get(e)
    return !n.empty && Math.abs(n.alt) <= 1
  })
  if (candidates.length === 0) return null
  return candidates.find((e) => Note.get(e).alt === 0) ?? candidates[0]!
}

export function generateMatrix(
  diagonalNote: string,
  quality: ChordQuality | ScaleMode,
): MatrixPuzzle | null {
  const intervals =
    quality in CHORD_CATALOG
      ? CHORD_CATALOG[quality as ChordQuality].intervals
      : SCALE_CATALOG[quality as ScaleMode].intervals

  const size = intervals.length
  const degrees = intervals.map(intervalToDegreeLabel)

  const columns: string[][] = []
  for (let col = 0; col < size; col++) {
    const root = findRoot(diagonalNote, col, quality)
    if (root === null) return null

    let notes =
      quality in CHORD_CATALOG
        ? buildChord(root, quality as ChordQuality)
        : buildScale(root, quality as ScaleMode)

    if (columnIsUnsolvable(notes, col)) {
      const replacement = bestEnharmonicReplacement(diagonalNote)
      if (replacement !== null) {
        const newRoot = findRoot(replacement, col, quality)
        if (newRoot !== null) {
          notes =
            quality in CHORD_CATALOG
              ? buildChord(newRoot, quality as ChordQuality)
              : buildScale(newRoot, quality as ScaleMode)
        }
      }
    }

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

  return { quality, diagonalNote, size, degrees, cells }
}
