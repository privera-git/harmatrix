import { describe, it, expect } from 'vitest'
import {
  validateAnswer,
  scoreCell,
  sessionMultiplier,
  scoreSession,
} from '@/music/scoring'
import type { ScoringOptions } from '@/music/scoring'

describe('validateAnswer', () => {
  it('returns correct for identical note names', () => {
    expect(validateAnswer('C', 'C')).toBe('correct')
    expect(validateAnswer('Ab', 'Ab')).toBe('correct')
    expect(validateAnswer('F#', 'F#')).toBe('correct')
  })

  it('returns correct for same pitch class across octaves', () => {
    expect(validateAnswer('Ab4', 'Ab')).toBe('correct')
    expect(validateAnswer('C', 'C3')).toBe('correct')
  })

  it('returns enharmonic for correct pitch with wrong spelling', () => {
    expect(validateAnswer('Ab', 'G#')).toBe('enharmonic')
    expect(validateAnswer('G#', 'Ab')).toBe('enharmonic')
    expect(validateAnswer('Eb', 'D#')).toBe('enharmonic')
    expect(validateAnswer('Db', 'C#')).toBe('enharmonic')
    expect(validateAnswer('Bb', 'A#')).toBe('enharmonic')
    expect(validateAnswer('F#', 'Gb')).toBe('enharmonic')
  })

  it('returns enharmonic for natural/accidental enharmonics', () => {
    expect(validateAnswer('E#', 'F')).toBe('enharmonic')
    expect(validateAnswer('B#', 'C')).toBe('enharmonic')
    expect(validateAnswer('Cb', 'B')).toBe('enharmonic')
    expect(validateAnswer('Fb', 'E')).toBe('enharmonic')
  })

  it('returns wrong for different pitches', () => {
    expect(validateAnswer('C', 'D')).toBe('wrong')
    expect(validateAnswer('Ab', 'A')).toBe('wrong')
    expect(validateAnswer('G#', 'G')).toBe('wrong')
    expect(validateAnswer('F', 'E')).toBe('wrong')
  })

  it('returns wrong when either note is invalid', () => {
    expect(validateAnswer('X', 'C')).toBe('wrong')
    expect(validateAnswer('C', 'X')).toBe('wrong')
  })
})

describe('scoreCell', () => {
  it('returns 3 for correct', () => {
    expect(scoreCell('correct')).toBe(3)
  })

  it('returns 1 for enharmonic', () => {
    expect(scoreCell('enharmonic')).toBe(1)
  })

  it('returns 0 for wrong', () => {
    expect(scoreCell('wrong')).toBe(0)
  })
})

describe('sessionMultiplier', () => {
  const base: ScoringOptions = { noDegreeLabels: false, noPianoKeyboard: false }

  it('returns 1 when all helpers enabled', () => {
    expect(sessionMultiplier(base)).toBe(1)
  })

  it('returns 1.5 when only degree labels disabled', () => {
    expect(sessionMultiplier({ noDegreeLabels: true, noPianoKeyboard: false })).toBe(1.5)
  })

  it('returns 1.5 when only piano keyboard disabled', () => {
    expect(sessionMultiplier({ noDegreeLabels: false, noPianoKeyboard: true })).toBe(1.5)
  })

  it('returns 2.5 when both helpers disabled', () => {
    expect(sessionMultiplier({ noDegreeLabels: true, noPianoKeyboard: true })).toBe(2.5)
  })
})

describe('scoreSession', () => {
  const noHelpers: ScoringOptions = { noDegreeLabels: true, noPianoKeyboard: true }
  const allHelpers: ScoringOptions = { noDegreeLabels: false, noPianoKeyboard: false }
  const oneHelper: ScoringOptions = { noDegreeLabels: true, noPianoKeyboard: false }

  it('sums raw cell scores with no multiplier', () => {
    expect(scoreSession(['correct', 'correct', 'correct'], allHelpers)).toBe(9)
    expect(scoreSession(['correct', 'enharmonic', 'wrong'], allHelpers)).toBe(4)
    expect(scoreSession(['wrong', 'wrong', 'wrong'], allHelpers)).toBe(0)
  })

  it('applies ×1.5 multiplier with one helper disabled', () => {
    expect(scoreSession(['correct', 'correct'], oneHelper)).toBe(9)
    expect(scoreSession(['correct', 'enharmonic'], oneHelper)).toBe(6)
  })

  it('applies ×2.5 multiplier when both helpers disabled', () => {
    expect(scoreSession(['correct', 'correct', 'correct'], noHelpers)).toBe(22.5)
    expect(scoreSession(['correct', 'enharmonic', 'wrong'], noHelpers)).toBe(10)
  })

  it('returns 0 for all-wrong session regardless of multiplier', () => {
    expect(scoreSession(['wrong', 'wrong'], noHelpers)).toBe(0)
  })

  it('handles empty cell array', () => {
    expect(scoreSession([], noHelpers)).toBe(0)
  })
})
