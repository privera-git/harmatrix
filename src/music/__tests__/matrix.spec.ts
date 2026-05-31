import { describe, it, expect } from 'vitest'
import { generateMatrix } from '@/music/matrix'
import type { MatrixPuzzle } from '@/music/matrix'

const col = (puzzle: MatrixPuzzle, c: number) =>
  puzzle.cells.map((row) => row[c]?.note ?? '')

describe('generateMatrix — C major 3×3 (AC from issue #9)', () => {
  it('produces correct notes for all three columns', () => {
    const puzzle = generateMatrix('C', 'major')
    expect(puzzle).not.toBeNull()
    expect(col(puzzle!, 0)).toEqual(['C', 'E', 'G'])
    expect(col(puzzle!, 1)).toEqual(['Ab', 'C', 'Eb'])
    expect(col(puzzle!, 2)).toEqual(['F', 'A', 'C'])
  })

  it('returns size 3', () => {
    expect(generateMatrix('C', 'major')?.size).toBe(3)
  })
})

describe('generateMatrix — diagonal invariant', () => {
  const cases: [string, Parameters<typeof generateMatrix>][] = [
    ['major triad, root C', ['C', 'major']],
    ['major triad, root Bb', ['Bb', 'major']],
    ['minor triad, root F#', ['F#', 'minor']],
    ['dom7, root G', ['G', 'dom7']],
    ['ionian, root D', ['D', 'ionian']],
    ['melodicMinor, root Ab', ['Ab', 'melodicMinor']],
    ['wholeTone, root C', ['C', 'wholeTone']],
  ]

  for (const [label, [note, quality]] of cases) {
    it(`diagonal contains "${note}" for ${label}`, () => {
      const puzzle = generateMatrix(note, quality)
      expect(puzzle, `generateMatrix('${note}', '${quality}') returned null`).not.toBeNull()
      for (let i = 0; i < puzzle!.size; i++) {
        expect(puzzle!.cells[i]?.[i]?.isGiven).toBe(true)
        expect(puzzle!.cells[i]?.[i]?.note).toBe(note)
      }
    })
  }
})

describe('generateMatrix — matrix sizes', () => {
  it('triads produce 3×3', () => expect(generateMatrix('C', 'major')?.size).toBe(3))
  it('tetrads produce 4×4', () => expect(generateMatrix('C', 'maj7')?.size).toBe(4))
  it('pentatonics produce 5×5', () => expect(generateMatrix('C', 'majorPenta')?.size).toBe(5))
  it('hexatonic produces 6×6', () => expect(generateMatrix('C', 'wholeTone')?.size).toBe(6))
  it('heptatonics produce 7×7', () => expect(generateMatrix('C', 'ionian')?.size).toBe(7))
  it('octatonics produce 8×8', () => expect(generateMatrix('C', 'wholeHalfDim')?.size).toBe(8))
})

describe('generateMatrix — cell structure', () => {
  it('non-diagonal cells have isGiven false', () => {
    const puzzle = generateMatrix('C', 'major')!
    expect(puzzle.cells[0]?.[1]?.isGiven).toBe(false)
    expect(puzzle.cells[1]?.[0]?.isGiven).toBe(false)
    expect(puzzle.cells[0]?.[2]?.isGiven).toBe(false)
  })

  it('row and col properties match position', () => {
    const puzzle = generateMatrix('C', 'major')!
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        expect(puzzle.cells[r]?.[c]?.row).toBe(r)
        expect(puzzle.cells[r]?.[c]?.col).toBe(c)
      }
    }
  })
})

describe('generateMatrix — additional qualities', () => {
  it('minor triad with C on diagonal', () => {
    const puzzle = generateMatrix('C', 'minor')!
    expect(col(puzzle, 0)).toEqual(['C', 'Eb', 'G'])
    expect(col(puzzle, 1)).toEqual(['A', 'C', 'E'])
    expect(col(puzzle, 2)).toEqual(['F', 'Ab', 'C'])
  })

  it('returns null for invalid note', () => {
    expect(generateMatrix('X', 'major')).toBeNull()
  })
})
