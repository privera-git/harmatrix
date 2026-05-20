export type ScaleMode =
  // Major modes
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'
  // Harmonic minor modes
  | 'harmonicMinor'
  | 'locrianNat6'
  | 'ionianSharp5'
  | 'dorianSharp4'
  | 'phrygianDom'
  | 'lydianSharp2'
  | 'ultraLocrian'
  // Melodic minor modes
  | 'melodicMinor'
  | 'dorianFlat2'
  | 'lydianAug'
  | 'lydianDom'
  | 'mixolydianFlat6'
  | 'aeolianFlat5'
  | 'altered'
  // Pentatonics
  | 'majorPenta'
  | 'minorPenta'
  // Hexatonic
  | 'wholeTone'
  // Octatonic (diminished)
  | 'wholeHalfDim'
  | 'halfWholeDim'

export interface ScaleDef {
  mode: ScaleMode
  symbol: string
  intervals: string[]
}

export const SCALE_CATALOG: Record<ScaleMode, ScaleDef> = {
  // Major modes (7×7 matrix)
  ionian: { mode: 'ionian', symbol: '', intervals: ['1P', '2M', '3M', '4P', '5P', '6M', '7M'] },
  dorian: { mode: 'dorian', symbol: 'dor', intervals: ['1P', '2M', '3m', '4P', '5P', '6M', '7m'] },
  phrygian: {
    mode: 'phrygian',
    symbol: 'phr',
    intervals: ['1P', '2m', '3m', '4P', '5P', '6m', '7m'],
  },
  lydian: { mode: 'lydian', symbol: 'lyd', intervals: ['1P', '2M', '3M', '4A', '5P', '6M', '7M'] },
  mixolydian: {
    mode: 'mixolydian',
    symbol: 'mix',
    intervals: ['1P', '2M', '3M', '4P', '5P', '6M', '7m'],
  },
  aeolian: {
    mode: 'aeolian',
    symbol: 'aeo',
    intervals: ['1P', '2M', '3m', '4P', '5P', '6m', '7m'],
  },
  locrian: {
    mode: 'locrian',
    symbol: 'loc',
    intervals: ['1P', '2m', '3m', '4P', '5d', '6m', '7m'],
  },

  // Harmonic minor modes (7×7 matrix)
  harmonicMinor: {
    mode: 'harmonicMinor',
    symbol: 'hm',
    intervals: ['1P', '2M', '3m', '4P', '5P', '6m', '7M'],
  },
  locrianNat6: {
    mode: 'locrianNat6',
    symbol: 'loc♮6',
    intervals: ['1P', '2m', '3m', '4P', '5d', '6M', '7m'],
  },
  ionianSharp5: {
    mode: 'ionianSharp5',
    symbol: 'ion♯5',
    intervals: ['1P', '2M', '3M', '4P', '5A', '6M', '7M'],
  },
  dorianSharp4: {
    mode: 'dorianSharp4',
    symbol: 'dor♯4',
    intervals: ['1P', '2M', '3m', '4A', '5P', '6M', '7m'],
  },
  phrygianDom: {
    mode: 'phrygianDom',
    symbol: 'phr dom',
    intervals: ['1P', '2m', '3M', '4P', '5P', '6m', '7m'],
  },
  lydianSharp2: {
    mode: 'lydianSharp2',
    symbol: 'lyd♯2',
    intervals: ['1P', '2A', '3M', '4A', '5P', '6M', '7M'],
  },
  ultraLocrian: {
    mode: 'ultraLocrian',
    symbol: 'uloc',
    intervals: ['1P', '2m', '3m', '4d', '5d', '6m', '7d'],
  },

  // Melodic minor modes (7×7 matrix)
  melodicMinor: {
    mode: 'melodicMinor',
    symbol: 'mm',
    intervals: ['1P', '2M', '3m', '4P', '5P', '6M', '7M'],
  },
  dorianFlat2: {
    mode: 'dorianFlat2',
    symbol: 'dor♭2',
    intervals: ['1P', '2m', '3m', '4P', '5P', '6M', '7m'],
  },
  lydianAug: {
    mode: 'lydianAug',
    symbol: 'lyd+',
    intervals: ['1P', '2M', '3M', '4A', '5A', '6M', '7M'],
  },
  lydianDom: {
    mode: 'lydianDom',
    symbol: 'lyd♭7',
    intervals: ['1P', '2M', '3M', '4A', '5P', '6M', '7m'],
  },
  mixolydianFlat6: {
    mode: 'mixolydianFlat6',
    symbol: 'mix♭6',
    intervals: ['1P', '2M', '3M', '4P', '5P', '6m', '7m'],
  },
  aeolianFlat5: {
    mode: 'aeolianFlat5',
    symbol: 'aeo♭5',
    intervals: ['1P', '2M', '3m', '4P', '5d', '6m', '7m'],
  },
  altered: {
    mode: 'altered',
    symbol: 'alt',
    intervals: ['1P', '2m', '3m', '4d', '5d', '6m', '7m'],
  },

  // Pentatonics (5×5 matrix)
  majorPenta: {
    mode: 'majorPenta',
    symbol: 'penta',
    intervals: ['1P', '2M', '3M', '5P', '6M'],
  },
  minorPenta: {
    mode: 'minorPenta',
    symbol: 'm penta',
    intervals: ['1P', '3m', '4P', '5P', '7m'],
  },

  // Hexatonic (6×6 matrix)
  wholeTone: {
    mode: 'wholeTone',
    symbol: 'WT',
    intervals: ['1P', '2M', '3M', '4A', '5A', '7m'],
  },

  // Octatonic — diminished (8×8 matrix)
  wholeHalfDim: {
    mode: 'wholeHalfDim',
    symbol: 'WH dim',
    intervals: ['1P', '2M', '3m', '4P', '5d', '6m', '6M', '7M'],
  },
  halfWholeDim: {
    mode: 'halfWholeDim',
    symbol: 'HW dim',
    intervals: ['1P', '2m', '3m', '3M', '4A', '5P', '6M', '7m'],
  },
}
