import { CHORD_CATALOG, type ChordQuality } from '@/music/data/chords'
import { SCALE_CATALOG, type ScaleMode } from '@/music/data/scales'
import { INTERVAL_CATALOG, type IntervalGroup } from '@/music/data/intervals'
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
  quality: ChordQuality | ScaleMode | IntervalGroup
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

function intervalsFor(quality: ChordQuality | ScaleMode | IntervalGroup): string[] {
  return quality in CHORD_CATALOG
    ? CHORD_CATALOG[quality as ChordQuality].intervals
    : quality in INTERVAL_CATALOG
      ? INTERVAL_CATALOG[quality as IntervalGroup].intervals
      : SCALE_CATALOG[quality as ScaleMode].intervals
}

// Number of cells per row/column in the matrix for this quality (the diagonal cells are given).
export function puzzleSize(quality: ChordQuality | ScaleMode | IntervalGroup): number {
  return intervalsFor(quality).length
}

// Computes the octave-qualified pitch a note should sound at when it occupies a given
// matrix position, based on its semitone distance from that column's given (diagonal) note.
// Reused both to replay an existing cell's own note (MatrixGrid) and to audition an
// arbitrary candidate note as if it were placed in a cell (piano keyboard / note picker).
export function computePlaybackNote(
  cells: MatrixCell[][],
  intervalSemitones: number[] | undefined,
  cell: Pick<MatrixCell, 'row' | 'col' | 'note'>,
): string {
  if (!cell.note || !intervalSemitones) return cell.note
  const givenRow = cell.col // diagonal: given is always at row === col
  const givenCell = cells[givenRow]?.[cell.col]
  if (!givenCell?.note) return cell.note
  const givenMidi = Note.midi(`${givenCell.note}4`) ?? 60
  const semDiff = (intervalSemitones[cell.row] ?? 0) - (intervalSemitones[givenRow] ?? 0)
  const targetMidi = givenMidi + semDiff
  const { letter, alt } = Note.get(cell.note)
  // Note.get().chroma wraps mod 12, which is wrong for Cb/Cbb/B#/B## whose alt pushes the
  // pitch class outside 0-11; rebuild the unbounded value from the natural letter + alt instead.
  const unboundedChroma = Note.get(letter).chroma + alt
  const octave = Math.round((targetMidi - unboundedChroma) / 12) - 1
  return `${cell.note}${octave}`
}

export function generateMatrix(
  diagonalNote: string,
  quality: ChordQuality | ScaleMode | IntervalGroup,
): MatrixPuzzle | null {
  const intervals = intervalsFor(quality)

  const size = intervals.length
  const degrees = intervals.map(intervalToDegreeLabel)

  const columns: string[][] = []
  for (let col = 0; col < size; col++) {
    const root = findRoot(diagonalNote, col, quality)
    if (root === null) return null

    const buildNotes = (r: string) =>
      quality in CHORD_CATALOG
        ? buildChord(r, quality as ChordQuality)
        : quality in INTERVAL_CATALOG
          ? INTERVAL_CATALOG[quality as IntervalGroup].intervals.flatMap((iv) => {
              const n = Note.transpose(r, iv)
              return n ? [n] : []
            })
          : buildScale(r, quality as ScaleMode)

    let notes = buildNotes(root)

    if (columnIsUnsolvable(notes, col)) {
      const replacement = bestEnharmonicReplacement(diagonalNote)
      if (replacement !== null) {
        const newRoot = findRoot(replacement, col, quality)
        if (newRoot !== null) {
          notes = buildNotes(newRoot)
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
