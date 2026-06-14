import type { ScaleMode } from './scales'

export const SCALE_DESCRIPTIONS: Partial<Record<ScaleMode, string>> = {
  ionian: 'Major scale or Ionian mode.',
  aeolian:
    'Minor scale or Aeolian mode. You can find its structure starting a major scale from the 6th degree.',
  harmonicMinor:
    'You can find its structure playing a minor scale with a major 7th. This scale and all its modes are recognizable because of the augmented 2nd (3 semitones) interval.',
  melodicMinor:
    'You can find its structure playing a harmonic minor scale with a major 6th, or a major scale with a minor 3rd.',
  majorPenta: 'A subset of 5 notes from the major scale, removing the 4th and 7th degrees.',
  minorPenta: 'A subset of 5 notes from the minor scale, removing the 2nd and 6th degrees.',
  wholeTone: 'A 6-note scale built entirely from whole tones.',
  wholeHalfDim:
    'An 8-note scale built from a repeating whole-tone / half-tone sequence (WH).',
  halfWholeDim:
    'An 8-note scale built from a repeating half-tone / whole-tone sequence (HW).',
}

export interface ModeMeta {
  parentScale: string
  modePosition: number
}

export const MODE_PARENT: Partial<Record<ScaleMode, ModeMeta>> = {
  dorian: { parentScale: 'major', modePosition: 2 },
  phrygian: { parentScale: 'major', modePosition: 3 },
  lydian: { parentScale: 'major', modePosition: 4 },
  mixolydian: { parentScale: 'major', modePosition: 5 },
  locrian: { parentScale: 'major', modePosition: 7 },

  locrianNat6: { parentScale: 'harmonic minor', modePosition: 2 },
  ionianSharp5: { parentScale: 'harmonic minor', modePosition: 3 },
  dorianSharp4: { parentScale: 'harmonic minor', modePosition: 4 },
  phrygianDom: { parentScale: 'harmonic minor', modePosition: 5 },
  lydianSharp2: { parentScale: 'harmonic minor', modePosition: 6 },
  ultraLocrian: { parentScale: 'harmonic minor', modePosition: 7 },

  dorianFlat2: { parentScale: 'melodic minor', modePosition: 2 },
  lydianAug: { parentScale: 'melodic minor', modePosition: 3 },
  lydianDom: { parentScale: 'melodic minor', modePosition: 4 },
  mixolydianFlat6: { parentScale: 'melodic minor', modePosition: 5 },
  aeolianFlat5: { parentScale: 'melodic minor', modePosition: 6 },
  altered: { parentScale: 'melodic minor', modePosition: 7 },
}
