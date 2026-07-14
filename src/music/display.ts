import { CHORD_CATALOG } from './data/chords'
import type { ChordQuality } from './data/chords'
import type { ScaleMode } from './data/scales'
import { INTERVAL_CATALOG } from './data/intervals'
import type { IntervalGroup } from './data/intervals'

const TRIAD_LABEL: Partial<Record<ChordQuality, string>> = {
  major: 'major triad',
  minor: 'minor triad',
  aug: 'augmented triad',
  dim: 'diminished triad',
}

const SCALE_LABEL: Record<ScaleMode, string> = {
  ionian: 'ionian scale',
  dorian: 'dorian scale',
  phrygian: 'phrygian scale',
  lydian: 'lydian scale',
  mixolydian: 'mixolydian scale',
  aeolian: 'aeolian scale',
  locrian: 'locrian scale',
  harmonicMinor: 'harmonic minor scale',
  locrianNat6: 'locrian ♮6 scale',
  ionianSharp5: 'ionian ♯5 scale',
  dorianSharp4: 'dorian ♯4 scale',
  phrygianDom: 'phrygian dominant scale',
  lydianSharp2: 'lydian ♯2 scale',
  ultraLocrian: 'ultra locrian scale',
  melodicMinor: 'melodic minor scale',
  dorianFlat2: 'dorian ♭2 scale',
  lydianAug: 'lydian augmented scale',
  lydianDom: 'lydian dominant scale',
  mixolydianFlat6: 'mixolydian ♭6 scale',
  aeolianFlat5: 'aeolian ♭5 scale',
  altered: 'altered scale',
  minorPenta: 'pentatonic minor scale',
  majorPenta: 'major pentatonic scale',
  wholeTone: 'whole tone scale',
  wholeHalfDim: 'whole-half diminished scale',
  halfWholeDim: 'half-whole diminished scale',
}

export function formatQualityLabel(quality: ChordQuality | ScaleMode | IntervalGroup): string {
  if (quality in CHORD_CATALOG) {
    const def = CHORD_CATALOG[quality as ChordQuality]
    return TRIAD_LABEL[quality as ChordQuality] ?? def.symbol
  }
  if (quality in INTERVAL_CATALOG) {
    return INTERVAL_CATALOG[quality as IntervalGroup].label
  }
  return SCALE_LABEL[quality as ScaleMode] ?? quality
}

// Tetrad/extended chord labels (e.g. 'm7', 'mΔ7') are notation symbols, not words —
// they must never be capitalized, unlike the word-phrase labels used for triads/scales/intervals.
export function isChordSymbolQuality(quality: ChordQuality | ScaleMode | IntervalGroup): boolean {
  return quality in CHORD_CATALOG && !(quality in TRIAD_LABEL)
}

export function formatPuzzleTitle(note: string, quality: ChordQuality | ScaleMode | IntervalGroup): string {
  if (quality in CHORD_CATALOG) {
    const def = CHORD_CATALOG[quality as ChordQuality]
    if (def.intervals.length === 3) {
      return `${note} ${TRIAD_LABEL[quality as ChordQuality] ?? def.symbol}`
    }
    const symbol = def.symbol.replace(/([b#]\d+)/g, '($1)')
    return `${note}${symbol}`
  }
  if (quality in INTERVAL_CATALOG) {
    return `${note} ${INTERVAL_CATALOG[quality as IntervalGroup].label}`
  }
  return `${note} ${SCALE_LABEL[quality as ScaleMode] ?? quality}`
}
