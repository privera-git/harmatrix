import { describe, it, expect } from 'vitest'
import { generateMatrix, intervalToDegreeLabel } from '@/music/matrix'
import type { MatrixPuzzle } from '@/music/matrix'
import { parseNote } from '@/music/note'

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

describe('intervalToDegreeLabel', () => {
  it('returns numeric string for perfect and major intervals', () => {
    expect(intervalToDegreeLabel('1P')).toBe('1')
    expect(intervalToDegreeLabel('5P')).toBe('5')
    expect(intervalToDegreeLabel('3M')).toBe('3')
    expect(intervalToDegreeLabel('9M')).toBe('9')
  })

  it('prepends ♭ for minor intervals', () => {
    expect(intervalToDegreeLabel('3m')).toBe('♭3')
    expect(intervalToDegreeLabel('7m')).toBe('♭7')
    expect(intervalToDegreeLabel('9m')).toBe('♭9')
  })

  it('prepends ♯ for augmented intervals', () => {
    expect(intervalToDegreeLabel('5A')).toBe('♯5')
    expect(intervalToDegreeLabel('9A')).toBe('♯9')
    expect(intervalToDegreeLabel('11A')).toBe('♯11')
  })

  it('returns °7 for diminished 7th', () => {
    expect(intervalToDegreeLabel('7d')).toBe('°7')
  })

  it('prepends ♭ for other diminished intervals', () => {
    expect(intervalToDegreeLabel('5d')).toBe('♭5')
    expect(intervalToDegreeLabel('4d')).toBe('♭4')
  })
})

describe('generateMatrix — degrees', () => {
  it('major triad has degrees [1, 3, 5]', () => {
    expect(generateMatrix('C', 'major')?.degrees).toEqual(['1', '3', '5'])
  })

  it('minor triad has degrees [1, ♭3, 5]', () => {
    expect(generateMatrix('C', 'minor')?.degrees).toEqual(['1', '♭3', '5'])
  })

  it('dom7 has degrees [1, 3, 5, ♭7]', () => {
    expect(generateMatrix('C', 'dom7')?.degrees).toEqual(['1', '3', '5', '♭7'])
  })

  it('dim7 has degrees [1, ♭3, ♭5, °7]', () => {
    expect(generateMatrix('C', 'dim7')?.degrees).toEqual(['1', '♭3', '♭5', '°7'])
  })

  it('alt chord has degrees [1, 3, ♭5, ♯5, ♭7, ♭9, ♯9]', () => {
    expect(generateMatrix('C', 'alt')?.degrees).toEqual(['1', '3', '♭5', '♯5', '♭7', '♭9', '♯9'])
  })

  it('ionian has degrees [1, 2, 3, 4, 5, 6, 7]', () => {
    expect(generateMatrix('C', 'ionian')?.degrees).toEqual(['1', '2', '3', '4', '5', '6', '7'])
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

describe('generateMatrix — enharmonic substitution for unsolvable columns', () => {
  it('col 2 of Fb aug uses E on the diagonal (enharmonic substitution)', () => {
    const puzzle = generateMatrix('Fb', 'aug')
    expect(puzzle).not.toBeNull()
    expect(puzzle!.cells[2]?.[2]?.note).toBe('E')
  })

  it('col 2 of Fb aug returns [Ab, C, E] (not the triple-accidental column)', () => {
    const puzzle = generateMatrix('Fb', 'aug')!
    expect(col(puzzle, 2)).toEqual(['Ab', 'C', 'E'])
  })

  it('col 0 of Fb aug is unchanged — Fb remains on diagonal', () => {
    const puzzle = generateMatrix('Fb', 'aug')!
    expect(puzzle.cells[0]?.[0]?.note).toBe('Fb')
    expect(col(puzzle, 0)).toEqual(['Fb', 'Ab', 'C'])
  })

  it('col 1 of Fb aug is unchanged — Fb remains on diagonal', () => {
    const puzzle = generateMatrix('Fb', 'aug')!
    expect(puzzle.cells[1]?.[1]?.note).toBe('Fb')
    expect(col(puzzle, 1)).toEqual(['Dbb', 'Fb', 'Ab'])
  })

  it('no triple accidentals in any cell of the fixed Fb aug matrix', () => {
    const puzzle = generateMatrix('Fb', 'aug')!
    const notes = puzzle.cells.flat().map((c) => c.note)
    for (const note of notes) {
      expect(parseNote(note), `note "${note}" has a triple accidental`).not.toBeNull()
    }
  })

  it('safe puzzle without substitution is not affected (C aug — diagonal unchanged)', () => {
    const puzzle = generateMatrix('C', 'aug')!
    for (let i = 0; i < puzzle.size; i++) {
      expect(puzzle.cells[i]?.[i]?.note).toBe('C')
    }
    const notes = puzzle.cells.flat().map((c) => c.note)
    for (const note of notes) {
      expect(parseNote(note), `note "${note}" has a triple accidental`).not.toBeNull()
    }
  })
})
