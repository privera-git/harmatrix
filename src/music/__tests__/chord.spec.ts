import { describe, it, expect } from 'vitest'
import { buildChord, degreeCount, CHORD_CATALOG } from '@/music/chord'
import type { ChordQuality } from '@/music/chord'

describe('CHORD_CATALOG', () => {
  it('contains all GDD chord types', () => {
    const required: ChordQuality[] = [
      'major',
      'minor',
      'aug',
      'dim',
      'sus2',
      'sus4',
      'maj7',
      'dom7',
      'm7',
      'mMaj7',
      'm7b5',
      'dim7',
      'maj6',
      'dom7sus4',
      'dom9',
      'dom7b9',
      'dom7s9',
      'dom7s11',
      'dom13',
      'alt',
    ]
    for (const q of required) {
      expect(CHORD_CATALOG[q], `missing quality: ${q}`).toBeDefined()
    }
  })

  it('alt chord has exactly 7 intervals', () => {
    expect(CHORD_CATALOG.alt.intervals).toHaveLength(7)
  })
})

describe('degreeCount', () => {
  it('returns 3 for triads', () => {
    expect(degreeCount('major')).toBe(3)
    expect(degreeCount('minor')).toBe(3)
    expect(degreeCount('aug')).toBe(3)
    expect(degreeCount('dim')).toBe(3)
    expect(degreeCount('sus2')).toBe(3)
    expect(degreeCount('sus4')).toBe(3)
  })

  it('returns 4 for tetrads', () => {
    expect(degreeCount('maj7')).toBe(4)
    expect(degreeCount('dom7')).toBe(4)
    expect(degreeCount('m7')).toBe(4)
    expect(degreeCount('mMaj7')).toBe(4)
    expect(degreeCount('m7b5')).toBe(4)
    expect(degreeCount('dim7')).toBe(4)
    expect(degreeCount('maj6')).toBe(4)
    expect(degreeCount('dom7sus4')).toBe(4)
  })

  it('returns 5 for extended dominant chords', () => {
    expect(degreeCount('dom9')).toBe(5)
    expect(degreeCount('dom7b9')).toBe(5)
    expect(degreeCount('dom7s9')).toBe(5)
    expect(degreeCount('dom7s11')).toBe(5)
  })

  it('returns 6 for dom13', () => {
    expect(degreeCount('dom13')).toBe(6)
  })

  it('returns 7 for alt (GDD 7×7 matrix)', () => {
    expect(degreeCount('alt')).toBe(7)
  })
})

describe('buildChord', () => {
  it('builds major triads with correct spelling', () => {
    expect(buildChord('Ab', 'major')).toEqual(['Ab', 'C', 'Eb'])
    expect(buildChord('G#', 'major')).toEqual(['G#', 'B#', 'D#'])
    expect(buildChord('Bb', 'major')).toEqual(['Bb', 'D', 'F'])
    expect(buildChord('C', 'major')).toEqual(['C', 'E', 'G'])
  })

  it('builds minor triads with correct spelling', () => {
    expect(buildChord('Bb', 'minor')).toEqual(['Bb', 'Db', 'F'])
    expect(buildChord('G#', 'minor')).toEqual(['G#', 'B', 'D#'])
  })

  it('builds augmented and diminished triads', () => {
    expect(buildChord('C', 'aug')).toEqual(['C', 'E', 'G#'])
    expect(buildChord('C', 'dim')).toEqual(['C', 'Eb', 'Gb'])
  })

  it('builds suspended triads', () => {
    expect(buildChord('C', 'sus2')).toEqual(['C', 'D', 'G'])
    expect(buildChord('C', 'sus4')).toEqual(['C', 'F', 'G'])
  })

  it('builds tetrads with correct spelling', () => {
    expect(buildChord('Ab', 'maj7')).toEqual(['Ab', 'C', 'Eb', 'G'])
    expect(buildChord('G#', 'dom7')).toEqual(['G#', 'B#', 'D#', 'F#'])
    expect(buildChord('C', 'm7')).toEqual(['C', 'Eb', 'G', 'Bb'])
    expect(buildChord('C', 'mMaj7')).toEqual(['C', 'Eb', 'G', 'B'])
    expect(buildChord('C', 'm7b5')).toEqual(['C', 'Eb', 'Gb', 'Bb'])
  })

  it('builds dim7 with double-flat seventh', () => {
    // Diminished seventh uses a diminished 7th interval (Bbb, not A)
    expect(buildChord('C', 'dim7')).toEqual(['C', 'Eb', 'Gb', 'Bbb'])
    expect(buildChord('Ab', 'dim7')).toEqual(['Ab', 'Cb', 'Ebb', 'Gbb'])
  })

  it('builds extended dominant chords', () => {
    expect(buildChord('Bb', 'dom9')).toEqual(['Bb', 'D', 'F', 'Ab', 'C'])
    expect(buildChord('C', 'dom7b9')).toEqual(['C', 'E', 'G', 'Bb', 'Db'])
    expect(buildChord('C', 'dom7s9')).toEqual(['C', 'E', 'G', 'Bb', 'D#'])
    expect(buildChord('C', 'dom7s11')).toEqual(['C', 'E', 'G', 'Bb', 'F#'])
    expect(buildChord('F', 'dom13')).toEqual(['F', 'A', 'C', 'Eb', 'G', 'D'])
  })

  it('builds the 7-note alt chord', () => {
    expect(buildChord('C', 'alt')).toEqual(['C', 'E', 'Gb', 'G#', 'Bb', 'Db', 'D#'])
    expect(buildChord('Ab', 'alt')).toEqual(['Ab', 'C', 'Ebb', 'E', 'Gb', 'Bbb', 'B'])
  })

  it('first note always equals root', () => {
    const qualities: ChordQuality[] = ['major', 'minor', 'dim7', 'dom9', 'alt']
    const roots = ['C', 'G#', 'Ab', 'Bb']
    for (const root of roots) {
      for (const q of qualities) {
        expect(buildChord(root, q)[0]).toBe(root)
      }
    }
  })

  it('result length matches degreeCount', () => {
    const qualities: ChordQuality[] = ['major', 'dom7', 'dom9', 'dom13', 'alt']
    for (const q of qualities) {
      expect(buildChord('C', q)).toHaveLength(degreeCount(q))
    }
  })

  it('returns empty array for invalid root', () => {
    expect(buildChord('X', 'major')).toEqual([])
    expect(buildChord('', 'major')).toEqual([])
  })
})
