import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'
import type { IntervalGroup } from '@/music/data/intervals'

export const SUB_STAGE_SESSION_SIZE = 10

// Progression-speed multipliers, decoupled from the score-display multipliers in music/scoring.ts.
export const PROGRESSION_MULTIPLIERS = {
  noHelp: 1.0,
  oneToggle: 1.2,
  hardMode: 1.5,
} as const

// 1-indexed stage number of the intro stage (Interval Basics); always accessible in Free Play.
export const INTRO_STAGE = 1

export const STAGE_NAMES = ['Interval Basics', 'Triads', 'Tetrads', 'Extended Dominant',
  'Common Scales', 'Symmetric Scales',
  'Major Scale Modes', 'Harmonic Minor Modes', 'Melodic Minor Modes'] as const

export const CURRICULUM: ReadonlyArray<ReadonlyArray<ChordQuality | ScaleMode | IntervalGroup>> = [
  ['seconds', 'thirds', 'fourthsFifths', 'sixths', 'sevenths', 'ninths', 'alteredExtensions', 'thirteenth'],
  ['major', 'minor', 'aug', 'dim', 'sus2', 'sus4'],
  ['maj7', 'dom7', 'm7', 'mMaj7', 'm7b5', 'dim7', 'maj6', 'dom7sus4'],
  ['dom9', 'dom7b9', 'dom7s9', 'dom7s11', 'dom13', 'alt'],
  ['ionian', 'aeolian', 'minorPenta', 'majorPenta'],
  ['wholeTone', 'wholeHalfDim', 'halfWholeDim'],
  ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'],
  ['harmonicMinor', 'locrianNat6', 'ionianSharp5', 'dorianSharp4', 'phrygianDom', 'lydianSharp2', 'ultraLocrian'],
  ['melodicMinor', 'dorianFlat2', 'lydianAug', 'lydianDom', 'mixolydianFlat6', 'aeolianFlat5', 'altered'],
] as const
