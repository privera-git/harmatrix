export type ChordQuality =
  // Triads
  | 'major'
  | 'minor'
  | 'aug'
  | 'dim'
  | 'sus2'
  | 'sus4'
  // Tetrads
  | 'maj7'
  | 'dom7'
  | 'm7'
  | 'mMaj7'
  | 'm7b5'
  | 'dim7'
  | 'maj6'
  | 'dom7sus4'
  // Extended dominant
  | 'dom9'
  | 'dom7b9'
  | 'dom7s9'
  | 'dom7s11'
  | 'dom13'
  // Altered
  | 'alt'

export interface ChordDef {
  quality: ChordQuality
  symbol: string
  intervals: string[]
}

export const CHORD_CATALOG: Record<ChordQuality, ChordDef> = {
  // Triads (3×3 matrix)
  major: { quality: 'major', symbol: '', intervals: ['1P', '3M', '5P'] },
  minor: { quality: 'minor', symbol: 'm', intervals: ['1P', '3m', '5P'] },
  aug: { quality: 'aug', symbol: '+', intervals: ['1P', '3M', '5A'] },
  dim: { quality: 'dim', symbol: '°', intervals: ['1P', '3m', '5d'] },
  sus2: { quality: 'sus2', symbol: 'sus2', intervals: ['1P', '2M', '5P'] },
  sus4: { quality: 'sus4', symbol: 'sus4', intervals: ['1P', '4P', '5P'] },

  // Tetrads (4×4 matrix)
  maj7: { quality: 'maj7', symbol: 'Δ7', intervals: ['1P', '3M', '5P', '7M'] },
  dom7: { quality: 'dom7', symbol: '7', intervals: ['1P', '3M', '5P', '7m'] },
  m7: { quality: 'm7', symbol: 'm7', intervals: ['1P', '3m', '5P', '7m'] },
  mMaj7: { quality: 'mMaj7', symbol: 'mΔ7', intervals: ['1P', '3m', '5P', '7M'] },
  m7b5: { quality: 'm7b5', symbol: 'ø7', intervals: ['1P', '3m', '5d', '7m'] },
  dim7: { quality: 'dim7', symbol: '°7', intervals: ['1P', '3m', '5d', '7d'] },
  maj6: { quality: 'maj6', symbol: '6', intervals: ['1P', '3M', '5P', '6M'] },
  dom7sus4: {
    quality: 'dom7sus4',
    symbol: '7sus4',
    intervals: ['1P', '4P', '5P', '7m'],
  },

  // Extended dominant (5–6 note matrix)
  dom9: { quality: 'dom9', symbol: '9', intervals: ['1P', '3M', '5P', '7m', '9M'] },
  dom7b9: {
    quality: 'dom7b9',
    symbol: '7b9',
    intervals: ['1P', '3M', '5P', '7m', '9m'],
  },
  dom7s9: {
    quality: 'dom7s9',
    symbol: '7#9',
    intervals: ['1P', '3M', '5P', '7m', '9A'],
  },
  dom7s11: {
    quality: 'dom7s11',
    symbol: '7#11',
    intervals: ['1P', '3M', '5P', '7m', '11A'],
  },
  dom13: {
    quality: 'dom13',
    symbol: '13',
    intervals: ['1P', '3M', '5P', '7m', '9M', '13M'],
  },

  // Altered dominant — 7 notes (7×7 matrix)
  // Degrees: 1, 3, b5, #5, b7, b9, #9
  alt: {
    quality: 'alt',
    symbol: '7alt',
    intervals: ['1P', '3M', '5d', '5A', '7m', '9m', '9A'],
  },
}
