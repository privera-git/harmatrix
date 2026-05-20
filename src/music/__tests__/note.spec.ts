import { describe, it, expect } from 'vitest'
import { parseNote, isSamePitch, isSameSpelling, enharmonicsOf } from '@/music/note'

describe('parseNote', () => {
  it('parses a natural note', () => {
    expect(parseNote('C')).toEqual({ letter: 'C', accidental: '', name: 'C', chroma: 0 })
    expect(parseNote('G')).toEqual({ letter: 'G', accidental: '', name: 'G', chroma: 7 })
  })

  it('parses a flat note', () => {
    expect(parseNote('Ab')).toEqual({ letter: 'A', accidental: 'b', name: 'Ab', chroma: 8 })
    expect(parseNote('Eb')).toEqual({ letter: 'E', accidental: 'b', name: 'Eb', chroma: 3 })
  })

  it('parses a sharp note', () => {
    expect(parseNote('G#')).toEqual({ letter: 'G', accidental: '#', name: 'G#', chroma: 8 })
    expect(parseNote('C#')).toEqual({ letter: 'C', accidental: '#', name: 'C#', chroma: 1 })
  })

  it('parses double flat', () => {
    expect(parseNote('Dbb')).toEqual({ letter: 'D', accidental: 'bb', name: 'Dbb', chroma: 0 })
    expect(parseNote('Ebb')).toEqual({ letter: 'E', accidental: 'bb', name: 'Ebb', chroma: 2 })
  })

  it('parses double sharp', () => {
    expect(parseNote('C##')).toEqual({ letter: 'C', accidental: '##', name: 'C##', chroma: 2 })
    expect(parseNote('F##')).toEqual({ letter: 'F', accidental: '##', name: 'F##', chroma: 7 })
  })

  it('strips octave and returns pitch class', () => {
    expect(parseNote('Ab4')?.name).toBe('Ab')
    expect(parseNote('C#3')?.name).toBe('C#')
  })

  it('handles enharmonic edge cases', () => {
    expect(parseNote('E#')?.chroma).toBe(5) // same as F
    expect(parseNote('Fb')?.chroma).toBe(4) // same as E
    expect(parseNote('B#')?.chroma).toBe(0) // same as C
    expect(parseNote('Cb')?.chroma).toBe(11) // same as B
  })

  it('returns null for invalid input', () => {
    expect(parseNote('X')).toBeNull()
    expect(parseNote('')).toBeNull()
    expect(parseNote('H')).toBeNull()
    expect(parseNote('123')).toBeNull()
  })
})

describe('isSamePitch', () => {
  it('returns true for common enharmonic pairs', () => {
    expect(isSamePitch('G#', 'Ab')).toBe(true)
    expect(isSamePitch('C#', 'Db')).toBe(true)
    expect(isSamePitch('D#', 'Eb')).toBe(true)
    expect(isSamePitch('A#', 'Bb')).toBe(true)
    expect(isSamePitch('F#', 'Gb')).toBe(true)
  })

  it('returns true for natural/accidental enharmonics', () => {
    expect(isSamePitch('E#', 'F')).toBe(true)
    expect(isSamePitch('B#', 'C')).toBe(true)
    expect(isSamePitch('Cb', 'B')).toBe(true)
    expect(isSamePitch('E', 'Fb')).toBe(true)
  })

  it('returns true for double accidental enharmonics', () => {
    expect(isSamePitch('C##', 'D')).toBe(true)
    expect(isSamePitch('Dbb', 'C')).toBe(true)
  })

  it('returns true for identical notes', () => {
    expect(isSamePitch('C', 'C')).toBe(true)
    expect(isSamePitch('Ab', 'Ab')).toBe(true)
  })

  it('returns true regardless of octave', () => {
    expect(isSamePitch('G#4', 'Ab3')).toBe(true)
    expect(isSamePitch('C5', 'C2')).toBe(true)
  })

  it('returns false for different pitches', () => {
    expect(isSamePitch('C', 'D')).toBe(false)
    expect(isSamePitch('Ab', 'A')).toBe(false)
    expect(isSamePitch('G#', 'G')).toBe(false)
  })

  it('returns false when either note is invalid', () => {
    expect(isSamePitch('X', 'C')).toBe(false)
    expect(isSamePitch('C', 'X')).toBe(false)
  })
})

describe('isSameSpelling', () => {
  it('returns false for enharmonic equivalents', () => {
    expect(isSameSpelling('G#', 'Ab')).toBe(false)
    expect(isSameSpelling('C#', 'Db')).toBe(false)
    expect(isSameSpelling('E#', 'F')).toBe(false)
    expect(isSameSpelling('B#', 'C')).toBe(false)
    expect(isSameSpelling('Cb', 'B')).toBe(false)
  })

  it('returns true for identical note names', () => {
    expect(isSameSpelling('Ab', 'Ab')).toBe(true)
    expect(isSameSpelling('G#', 'G#')).toBe(true)
    expect(isSameSpelling('C', 'C')).toBe(true)
  })

  it('returns true for same pitch class across octaves', () => {
    expect(isSameSpelling('Ab4', 'Ab3')).toBe(true)
    expect(isSameSpelling('Ab', 'Ab4')).toBe(true)
    expect(isSameSpelling('G#2', 'G#5')).toBe(true)
  })

  it('returns false when either note is invalid', () => {
    expect(isSameSpelling('X', 'C')).toBe(false)
    expect(isSameSpelling('C', 'X')).toBe(false)
  })
})

describe('enharmonicsOf', () => {
  it('returns the flat enharmonic of a sharp', () => {
    expect(enharmonicsOf('G#')).toContain('Ab')
    expect(enharmonicsOf('C#')).toContain('Db')
    expect(enharmonicsOf('F#')).toContain('Gb')
  })

  it('returns the sharp enharmonic of a flat', () => {
    expect(enharmonicsOf('Ab')).toContain('G#')
    expect(enharmonicsOf('Eb')).toContain('D#')
  })

  it('does not include the note itself', () => {
    expect(enharmonicsOf('G#')).not.toContain('G#')
    expect(enharmonicsOf('C')).not.toContain('C')
    expect(enharmonicsOf('Ab')).not.toContain('Ab')
  })

  it('includes double-accidental enharmonics of natural notes', () => {
    expect(enharmonicsOf('C')).toContain('B#')
    expect(enharmonicsOf('C')).toContain('Dbb')
    expect(enharmonicsOf('E')).toContain('Fb')
    expect(enharmonicsOf('E')).toContain('D##')
    expect(enharmonicsOf('F')).toContain('E#')
    expect(enharmonicsOf('F')).toContain('Gbb')
  })

  it('includes double-accidental enharmonics for sharps and flats', () => {
    // F# (chroma 6): enharmonics are Gb and E##
    expect(enharmonicsOf('F#')).toContain('E##')
    expect(enharmonicsOf('F#')).toContain('Gb')
    // Ab (chroma 8): only enharmonic within bb–## range is G#
    expect(enharmonicsOf('Ab')).toEqual(['G#'])
  })

  it('returns empty array for invalid input', () => {
    expect(enharmonicsOf('X')).toEqual([])
    expect(enharmonicsOf('')).toEqual([])
  })
})
