import { describe, it, expect } from 'vitest'
import { intervalBetween, transpose, invertInterval, semitones } from '@/music/interval'

describe('intervalBetween', () => {
  it('returns correct diatonic intervals for natural notes', () => {
    expect(intervalBetween('C', 'E')).toBe('3M')
    expect(intervalBetween('C', 'Eb')).toBe('3m')
    expect(intervalBetween('C', 'G')).toBe('5P')
    expect(intervalBetween('C', 'F')).toBe('4P')
    expect(intervalBetween('C', 'B')).toBe('7M')
    expect(intervalBetween('C', 'Bb')).toBe('7m')
    expect(intervalBetween('C', 'C')).toBe('1P')
  })

  it('computes intervals from flat roots', () => {
    expect(intervalBetween('Ab', 'C')).toBe('3M')
    expect(intervalBetween('Ab', 'Eb')).toBe('5P')
    expect(intervalBetween('Bb', 'D')).toBe('3M')
    expect(intervalBetween('Eb', 'G')).toBe('3M')
  })

  it('preserves diatonic spelling — G# to C is a diminished 4th, not a minor 3rd', () => {
    expect(intervalBetween('G#', 'C')).toBe('4d')
  })

  it('returns null for invalid input', () => {
    expect(intervalBetween('X', 'C')).toBeNull()
    expect(intervalBetween('C', 'X')).toBeNull()
    expect(intervalBetween('', 'C')).toBeNull()
  })
})

describe('transpose', () => {
  it('transposes natural notes up by common intervals', () => {
    expect(transpose('C', '3M')).toBe('E')
    expect(transpose('C', '5P')).toBe('G')
    expect(transpose('C', '4P')).toBe('F')
    expect(transpose('C', '7M')).toBe('B')
  })

  it('preserves correct spelling when transposing from flat roots', () => {
    expect(transpose('Ab', '3M')).toBe('C')
    expect(transpose('Ab', '5P')).toBe('Eb')
    expect(transpose('Bb', '3M')).toBe('D')
    expect(transpose('Eb', '3M')).toBe('G')
  })

  it('preserves correct spelling when transposing from sharp roots', () => {
    expect(transpose('G#', '3M')).toBe('B#')
    expect(transpose('G#', '5P')).toBe('D#')
  })

  it('transposes up using inverted intervals (used in reverse-degree engine)', () => {
    expect(transpose('C', '6m')).toBe('Ab') // C is the 3rd of Ab major
    expect(transpose('C', '4P')).toBe('F') // C is the 5th of F major
    expect(transpose('C', '1P')).toBe('C') // C is the root of C major
  })

  it('supports descending transposition with negative intervals', () => {
    expect(transpose('C', '-3M')).toBe('Ab')
    expect(transpose('E', '-3M')).toBe('C')
  })

  it('returns null for invalid input', () => {
    expect(transpose('X', '3M')).toBeNull()
    expect(transpose('C', '')).toBeNull()
  })
})

describe('invertInterval', () => {
  it('inverts major/minor interval pairs', () => {
    expect(invertInterval('3M')).toBe('6m')
    expect(invertInterval('3m')).toBe('6M')
    expect(invertInterval('2M')).toBe('7m')
    expect(invertInterval('2m')).toBe('7M')
    expect(invertInterval('6M')).toBe('3m')
    expect(invertInterval('6m')).toBe('3M')
    expect(invertInterval('7M')).toBe('2m')
    expect(invertInterval('7m')).toBe('2M')
  })

  it('inverts perfect intervals', () => {
    expect(invertInterval('5P')).toBe('4P')
    expect(invertInterval('4P')).toBe('5P')
    expect(invertInterval('1P')).toBe('1P')
  })

  it('inverts augmented/diminished intervals', () => {
    expect(invertInterval('4A')).toBe('5d')
    expect(invertInterval('5d')).toBe('4A')
    expect(invertInterval('4d')).toBe('5A')
  })

  it('returns null for invalid input', () => {
    expect(invertInterval('X')).toBeNull()
    expect(invertInterval('')).toBeNull()
  })
})

describe('semitones', () => {
  it('returns correct semitone counts for all diatonic intervals', () => {
    expect(semitones('1P')).toBe(0)
    expect(semitones('2m')).toBe(1)
    expect(semitones('2M')).toBe(2)
    expect(semitones('3m')).toBe(3)
    expect(semitones('3M')).toBe(4)
    expect(semitones('4P')).toBe(5)
    expect(semitones('4A')).toBe(6)
    expect(semitones('5P')).toBe(7)
    expect(semitones('6m')).toBe(8)
    expect(semitones('6M')).toBe(9)
    expect(semitones('7m')).toBe(10)
    expect(semitones('7M')).toBe(11)
  })

  it('returns negative semitones for descending intervals', () => {
    expect(semitones('-3M')).toBe(-4)
    expect(semitones('-5P')).toBe(-7)
  })

  it('returns null for invalid input', () => {
    expect(semitones('X')).toBeNull()
    expect(semitones('')).toBeNull()
  })
})

describe('round-trip: transpose(X, invertInterval(intervalBetween(root, X))) = root', () => {
  it('recovers Ab from C as the 3rd degree', () => {
    const iv = intervalBetween('Ab', 'C')!
    const root = transpose('C', invertInterval(iv)!)
    expect(root).toBe('Ab')
  })

  it('recovers F from C as the 5th degree', () => {
    const iv = intervalBetween('F', 'C')!
    const root = transpose('C', invertInterval(iv)!)
    expect(root).toBe('F')
  })

  it('recovers G# from B# as the 3rd degree', () => {
    const iv = intervalBetween('G#', 'B#')!
    const root = transpose('B#', invertInterval(iv)!)
    expect(root).toBe('G#')
  })
})
