import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/stores/game'

const DEFAULT_OPTIONS = { noDegreeLabels: false, noPianoKeyboard: false }

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('initial state', () => {
  it('starts in idle phase', () => {
    const store = useGameStore()
    expect(store.session.phase).toBe('idle')
  })
})

describe('startPuzzle', () => {
  it('transitions idle → playing', () => {
    const store = useGameStore()
    const ok = store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    expect(ok).toBe(true)
    expect(store.session.phase).toBe('playing')
  })

  it('stores the generated puzzle and options', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    if (store.session.phase !== 'playing') return
    expect(store.session.puzzle.diagonalNote).toBe('C')
    expect(store.session.puzzle.quality).toBe('major')
    expect(store.session.options).toEqual(DEFAULT_OPTIONS)
  })

  it('initializes all answers as null', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    if (store.session.phase !== 'playing') return
    for (const row of store.session.answers) {
      for (const cell of row) {
        expect(cell).toBeNull()
      }
    }
  })

  it('returns false for invalid note', () => {
    const store = useGameStore()
    expect(store.startPuzzle('X', 'major', DEFAULT_OPTIONS)).toBe(false)
    expect(store.session.phase).toBe('idle')
  })
})

describe('submitAnswer', () => {
  it('stores a valid answer', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    const ok = store.submitAnswer(1, 0, 'E')
    expect(ok).toBe(true)
    if (store.session.phase !== 'playing') return
    expect(store.session.answers[1]?.[0]).toBe('E')
  })

  it('rejects diagonal (isGiven) cells', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    const ok = store.submitAnswer(0, 0, 'C')
    expect(ok).toBe(false)
  })

  it('rejects when not in playing phase', () => {
    const store = useGameStore()
    expect(store.submitAnswer(0, 1, 'E')).toBe(false)
  })

  it('does not change phase', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    store.submitAnswer(1, 0, 'E')
    expect(store.session.phase).toBe('playing')
  })
})

describe('completeSession', () => {
  it('transitions playing → completed', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    store.completeSession()
    expect(store.session.phase).toBe('completed')
  })

  it('returns false when not in playing phase', () => {
    const store = useGameStore()
    expect(store.completeSession()).toBe(false)
  })

  it('marks unanswered cells as wrong', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    store.completeSession()
    if (store.session.phase !== 'completed') return
    const nonGiven = store.session.results
      .flat()
      .filter((_, i) => {
        const size = store.session.phase === 'completed' ? store.session.puzzle.size : 0
        return Math.floor(i / size) !== i % size
      })
    expect(nonGiven.every((r) => r === 'wrong')).toBe(true)
  })

  it('scores a fully correct session (×1 multiplier)', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    // C major 3×3: diagonal is [0,0]=C, [1,1]=C, [2,2]=C
    // Non-diagonal cells: [1,0]=E, [2,0]=G, [0,1]=Ab, [2,1]=Eb, [0,2]=F, [1,2]=A
    store.submitAnswer(1, 0, 'E')
    store.submitAnswer(2, 0, 'G')
    store.submitAnswer(0, 1, 'Ab')
    store.submitAnswer(2, 1, 'Eb')
    store.submitAnswer(0, 2, 'F')
    store.submitAnswer(1, 2, 'A')
    store.completeSession()
    if (store.session.phase !== 'completed') return
    expect(store.session.score).toBe(18) // 6 correct × 3pts × ×1
  })

  it('scores an enharmonic answer correctly', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    store.submitAnswer(0, 1, 'G#') // expected Ab → enharmonic = 1pt
    store.completeSession()
    if (store.session.phase !== 'completed') return
    const result = store.session.results[0]?.[1]
    expect(result).toBe('enharmonic')
  })

  it('applies multiplier when helpers are disabled', () => {
    const store = useGameStore()
    const noHelpers = { noDegreeLabels: true, noPianoKeyboard: true }
    store.startPuzzle('C', 'major', noHelpers)
    store.submitAnswer(1, 0, 'E')
    store.submitAnswer(2, 0, 'G')
    store.submitAnswer(0, 1, 'Ab')
    store.submitAnswer(2, 1, 'Eb')
    store.submitAnswer(0, 2, 'F')
    store.submitAnswer(1, 2, 'A')
    store.completeSession()
    if (store.session.phase !== 'completed') return
    expect(store.session.score).toBe(45) // 6 × 3pts × ×2.5
  })
})

describe('resetSession', () => {
  it('transitions completed → idle', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    store.completeSession()
    store.resetSession()
    expect(store.session.phase).toBe('idle')
  })

  it('transitions playing → idle', () => {
    const store = useGameStore()
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    store.resetSession()
    expect(store.session.phase).toBe('idle')
  })
})

describe('full lifecycle: idle → playing → completed → idle', () => {
  it('completes a full round trip', () => {
    const store = useGameStore()
    expect(store.session.phase).toBe('idle')
    store.startPuzzle('C', 'major', DEFAULT_OPTIONS)
    expect(store.session.phase).toBe('playing')
    store.completeSession()
    expect(store.session.phase).toBe('completed')
    store.resetSession()
    expect(store.session.phase).toBe('idle')
  })
})
