import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'

export const SUB_STAGE_SESSION_SIZE = 10

export const STAGE_NAMES = ['Triads', 'Seventh Chords'] as const

export const CURRICULUM: ReadonlyArray<ReadonlyArray<ChordQuality | ScaleMode>> = [
  ['major', 'minor', 'aug', 'dim', 'sus2', 'sus4'],
  ['maj7', 'dom7', 'm7', 'mMaj7', 'm7b5', 'dim7', 'maj6', 'dom7sus4', 'dom9', 'dom7b9', 'dom7s9', 'dom7s11', 'dom13', 'alt'],
] as const
