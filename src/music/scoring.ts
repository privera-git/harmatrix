import { isSamePitch, isSameSpelling } from '@/music/note'

export type AnswerResult = 'correct' | 'enharmonic' | 'wrong'

export interface ScoringOptions {
  noDegreeLabels: boolean
  noPianoKeyboard: boolean
}

export function validateAnswer(expected: string, actual: string): AnswerResult {
  if (isSameSpelling(expected, actual)) return 'correct'
  if (isSamePitch(expected, actual)) return 'enharmonic'
  return 'wrong'
}

export function scoreCell(result: AnswerResult): 0 | 1 | 3 {
  if (result === 'correct') return 3
  if (result === 'enharmonic') return 1
  return 0
}

export function sessionMultiplier(options: ScoringOptions): number {
  if (options.noDegreeLabels && options.noPianoKeyboard) return 2.5
  if (options.noDegreeLabels || options.noPianoKeyboard) return 1.5
  return 1
}

export function scoreSession(cells: AnswerResult[], options: ScoringOptions): number {
  const raw = cells.reduce((sum, r) => sum + scoreCell(r), 0)
  return raw * sessionMultiplier(options)
}
