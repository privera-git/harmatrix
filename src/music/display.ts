import { CHORD_CATALOG } from './data/chords'
import type { ChordQuality } from './data/chords'
import type { ScaleMode } from './data/scales'

const TRIAD_LABEL: Partial<Record<ChordQuality, string>> = {
  major: 'major triad',
  minor: 'minor triad',
  aug: 'augmented triad',
  dim: 'diminished triad',
  sus2: 'sus2',
  sus4: 'sus4',
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
  majorPenta: 'major pentatonic scale',
  minorPenta: 'pentatonic minor scale',
  wholeTone: 'whole tone scale',
  wholeHalfDim: 'whole-half diminished scale',
  halfWholeDim: 'half-whole diminished scale',
}

export function formatPuzzleTitle(note: string, quality: ChordQuality | ScaleMode): string {
  if (quality in CHORD_CATALOG) {
    const def = CHORD_CATALOG[quality as ChordQuality]
    if (def.intervals.length === 3) {
      return `${note} ${TRIAD_LABEL[quality as ChordQuality] ?? quality}`
    }
    // Wrap alteration suffixes like b9, #9, #11 in parens: "7b9" → "7(b9)"
    const symbol = def.symbol.replace(/([b#]\d+)/g, '($1)')
    return `${note}${symbol}`
  }
  return `${note} ${SCALE_LABEL[quality as ScaleMode] ?? quality}`
}
