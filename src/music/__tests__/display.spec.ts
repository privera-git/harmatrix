import { describe, it, expect } from 'vitest'
import { formatPuzzleTitle, isMinorSymbolLabel } from '@/music/display'

describe('formatPuzzleTitle', () => {
  describe('triads', () => {
    it('formats major triad', () => {
      expect(formatPuzzleTitle('C', 'major')).toBe('C major triad')
    })

    it('formats minor triad with flat note', () => {
      expect(formatPuzzleTitle('Eb', 'minor')).toBe('Eb minor triad')
    })

    it('formats augmented triad', () => {
      expect(formatPuzzleTitle('C', 'aug')).toBe('C augmented triad')
    })

    it('formats diminished triad', () => {
      expect(formatPuzzleTitle('C', 'dim')).toBe('C diminished triad')
    })

    it('formats sus2', () => {
      expect(formatPuzzleTitle('G', 'sus2')).toBe('G sus2')
    })

    it('formats sus4', () => {
      expect(formatPuzzleTitle('G', 'sus4')).toBe('G sus4')
    })
  })

  describe('tetrads', () => {
    it('formats maj7', () => {
      expect(formatPuzzleTitle('C', 'maj7')).toBe('CΔ7')
    })

    it('formats dom7', () => {
      expect(formatPuzzleTitle('G', 'dom7')).toBe('G7')
    })

    it('formats m7', () => {
      expect(formatPuzzleTitle('A', 'm7')).toBe('Am7')
    })

    it('formats mMaj7', () => {
      expect(formatPuzzleTitle('C', 'mMaj7')).toBe('CmΔ7')
    })

    it('formats m7b5 (half-diminished)', () => {
      expect(formatPuzzleTitle('B', 'm7b5')).toBe('Bø7')
    })

    it('formats dim7', () => {
      expect(formatPuzzleTitle('C', 'dim7')).toBe('C°7')
    })

    it('formats maj6', () => {
      expect(formatPuzzleTitle('C', 'maj6')).toBe('C6')
    })

    it('formats dom7sus4', () => {
      expect(formatPuzzleTitle('C', 'dom7sus4')).toBe('C7sus4')
    })
  })

  describe('extended chords with alterations', () => {
    it('formats dom9', () => {
      expect(formatPuzzleTitle('C', 'dom9')).toBe('C9')
    })

    it('formats dom7b9 with parens', () => {
      expect(formatPuzzleTitle('C', 'dom7b9')).toBe('C7(b9)')
    })

    it('formats dom7s9 with parens', () => {
      expect(formatPuzzleTitle('Bb', 'dom7s9')).toBe('Bb7(#9)')
    })

    it('formats dom7s11 with parens', () => {
      expect(formatPuzzleTitle('C', 'dom7s11')).toBe('C7(#11)')
    })

    it('formats dom13', () => {
      expect(formatPuzzleTitle('C', 'dom13')).toBe('C13')
    })

    it('formats alt', () => {
      expect(formatPuzzleTitle('G', 'alt')).toBe('G7alt')
    })
  })

  describe('scales', () => {
    it('formats ionian scale', () => {
      expect(formatPuzzleTitle('C', 'ionian')).toBe('C ionian scale')
    })

    it('formats pentatonic minor scale', () => {
      expect(formatPuzzleTitle('A', 'minorPenta')).toBe('A pentatonic minor scale')
    })

    it('formats major pentatonic scale', () => {
      expect(formatPuzzleTitle('C', 'majorPenta')).toBe('C major pentatonic scale')
    })

    it('formats harmonic minor scale', () => {
      expect(formatPuzzleTitle('A', 'harmonicMinor')).toBe('A harmonic minor scale')
    })

    it('formats altered scale', () => {
      expect(formatPuzzleTitle('G', 'altered')).toBe('G altered scale')
    })

    it('formats whole tone scale', () => {
      expect(formatPuzzleTitle('C', 'wholeTone')).toBe('C whole tone scale')
    })
  })
})

describe('isMinorSymbolLabel', () => {
  it('returns true for m7', () => {
    expect(isMinorSymbolLabel('m7')).toBe(true)
  })

  it('returns true for mMaj7', () => {
    expect(isMinorSymbolLabel('mMaj7')).toBe(true)
  })

  it('returns false for the minor triad despite its m symbol', () => {
    expect(isMinorSymbolLabel('minor')).toBe(false)
  })

  it('returns false for major', () => {
    expect(isMinorSymbolLabel('major')).toBe(false)
  })

  it('returns false for sus2', () => {
    expect(isMinorSymbolLabel('sus2')).toBe(false)
  })

  it('returns false for sus4', () => {
    expect(isMinorSymbolLabel('sus4')).toBe(false)
  })

  it('returns false for dom7sus4', () => {
    expect(isMinorSymbolLabel('dom7sus4')).toBe(false)
  })

  it('returns false for a scale mode', () => {
    expect(isMinorSymbolLabel('ionian')).toBe(false)
  })

  it('returns false for an interval group', () => {
    expect(isMinorSymbolLabel('seconds')).toBe(false)
  })
})
