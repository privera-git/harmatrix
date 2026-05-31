import { describe, it, expect } from 'vitest'
import { findRoot } from '@/music/reverse'

describe('findRoot — major triad (GDD diagonal table)', () => {
  it('C at degree 0 (root) → C', () => {
    expect(findRoot('C', 0, 'major')).toBe('C')
  })

  it('C at degree 1 (3rd) → Ab (not G#)', () => {
    expect(findRoot('C', 1, 'major')).toBe('Ab')
  })

  it('C at degree 2 (5th) → F', () => {
    expect(findRoot('C', 2, 'major')).toBe('F')
  })
})

describe('findRoot — triads', () => {
  it('minor: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'minor')).toBe('C')
    expect(findRoot('Eb', 1, 'minor')).toBe('C')
    expect(findRoot('G', 2, 'minor')).toBe('C')
  })

  it('aug: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'aug')).toBe('C')
    expect(findRoot('E', 1, 'aug')).toBe('C')
    expect(findRoot('G#', 2, 'aug')).toBe('C')
  })

  it('dim: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'dim')).toBe('C')
    expect(findRoot('Eb', 1, 'dim')).toBe('C')
    expect(findRoot('Gb', 2, 'dim')).toBe('C')
  })

  it('sus2: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'sus2')).toBe('C')
    expect(findRoot('D', 1, 'sus2')).toBe('C')
    expect(findRoot('G', 2, 'sus2')).toBe('C')
  })

  it('sus4: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'sus4')).toBe('C')
    expect(findRoot('F', 1, 'sus4')).toBe('C')
    expect(findRoot('G', 2, 'sus4')).toBe('C')
  })
})

describe('findRoot — tetrads', () => {
  it('maj7: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'maj7')).toBe('C')
    expect(findRoot('E', 1, 'maj7')).toBe('C')
    expect(findRoot('G', 2, 'maj7')).toBe('C')
    expect(findRoot('B', 3, 'maj7')).toBe('C')
  })

  it('dom7: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'dom7')).toBe('C')
    expect(findRoot('E', 1, 'dom7')).toBe('C')
    expect(findRoot('G', 2, 'dom7')).toBe('C')
    expect(findRoot('Bb', 3, 'dom7')).toBe('C')
  })

  it('m7: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'm7')).toBe('C')
    expect(findRoot('Eb', 1, 'm7')).toBe('C')
    expect(findRoot('G', 2, 'm7')).toBe('C')
    expect(findRoot('Bb', 3, 'm7')).toBe('C')
  })

  it('m7b5: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'm7b5')).toBe('C')
    expect(findRoot('Eb', 1, 'm7b5')).toBe('C')
    expect(findRoot('Gb', 2, 'm7b5')).toBe('C')
    expect(findRoot('Bb', 3, 'm7b5')).toBe('C')
  })

  it('dim7: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'dim7')).toBe('C')
    expect(findRoot('Eb', 1, 'dim7')).toBe('C')
    expect(findRoot('Gb', 2, 'dim7')).toBe('C')
    expect(findRoot('Bbb', 3, 'dim7')).toBe('C')
  })
})

describe('findRoot — scale modes', () => {
  it('ionian: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'ionian')).toBe('C')
    expect(findRoot('D', 1, 'ionian')).toBe('C')
    expect(findRoot('E', 2, 'ionian')).toBe('C')
    expect(findRoot('F', 3, 'ionian')).toBe('C')
    expect(findRoot('G', 4, 'ionian')).toBe('C')
    expect(findRoot('A', 5, 'ionian')).toBe('C')
    expect(findRoot('B', 6, 'ionian')).toBe('C')
  })

  it('dorian: D at degree 1 of C dorian → C', () => {
    expect(findRoot('D', 1, 'dorian')).toBe('C')
  })

  it('phrygian: Db at degree 1 of C phrygian → C', () => {
    expect(findRoot('Db', 1, 'phrygian')).toBe('C')
  })

  it('mixolydian: Bb at degree 6 of C mixolydian → C', () => {
    expect(findRoot('Bb', 6, 'mixolydian')).toBe('C')
  })

  it('melodicMinor: recovers root from each degree', () => {
    expect(findRoot('C', 0, 'melodicMinor')).toBe('C')
    expect(findRoot('Eb', 2, 'melodicMinor')).toBe('C')
    expect(findRoot('B', 6, 'melodicMinor')).toBe('C')
  })
})

describe('findRoot — double accidentals', () => {
  it('Bbb at degree 3 of C dim7 → C', () => {
    expect(findRoot('Bbb', 3, 'dim7')).toBe('C')
  })

  it('B# at degree 1 of aug from G# root → G#', () => {
    expect(findRoot('B#', 1, 'aug')).toBe('G#')
  })
})

describe('findRoot — flat and sharp roots', () => {
  it('works with flat-rooted qualities', () => {
    expect(findRoot('Bb', 0, 'major')).toBe('Bb')
    expect(findRoot('D', 1, 'major')).toBe('Bb')
    expect(findRoot('F', 2, 'major')).toBe('Bb')
  })

  it('works with sharp-rooted qualities', () => {
    expect(findRoot('F#', 0, 'major')).toBe('F#')
    expect(findRoot('A#', 1, 'major')).toBe('F#')
    expect(findRoot('C#', 2, 'major')).toBe('F#')
  })
})

describe('findRoot — invalid input', () => {
  it('returns null for out-of-range degree index', () => {
    expect(findRoot('C', 3, 'major')).toBeNull()
    expect(findRoot('C', -1, 'major')).toBeNull()
  })

  it('returns null for invalid note', () => {
    expect(findRoot('X', 0, 'major')).toBeNull()
  })
})
