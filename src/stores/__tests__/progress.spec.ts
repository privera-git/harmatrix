import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProgressStore } from '@/stores/progress'
import type { ScoringOptions } from '@/music/scoring'

function freshStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((k) => {
        delete store[k]
      })
    },
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', freshStorage())
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

// 'major' is a 3x3 matrix (3 intervals) → 6 non-given cells, MAX_CELL_SCORE 3 → 18 pts/perfect session.
// targetScore = SUB_STAGE_SESSION_SIZE(10) * numCells(6) * 3 = 180, so 10 perfect sessions advance.
const PERFECT = Array<'correct'>(6).fill('correct')
const IMPERFECT: ('correct' | 'wrong')[] = [...Array<'correct'>(5).fill('correct'), 'wrong']
const PERFECT_SESSION_SCORE = 18
const TARGET_SCORE = 180
const NO_HELP: ScoringOptions = { noDegreeLabels: false, noPianoKeyboard: false }

describe('initial state', () => {
  it('starts at stage 1, sub-stage 1 (Interval Basics)', () => {
    const store = useProgressStore()
    expect(store.state.learning).toEqual({ stage: 1, subStage: 1 })
  })

  it('starts with empty unlocked content and stats', () => {
    const store = useProgressStore()
    expect(store.state.unlockedContent).toEqual([])
    expect(store.state.stats).toEqual({})
  })

  it('starts with zero streak', () => {
    const store = useProgressStore()
    expect(store.state.practiceStreak).toBe(0)
  })

  it('starts with lastFreePlayStage null', () => {
    const store = useProgressStore()
    expect(store.state.lastFreePlayStage).toBeNull()
  })

  it('starts in learn idleMode', () => {
    const store = useProgressStore()
    expect(store.state.idleMode).toBe('learn')
  })

  it('starts with empty sessionsPlayed', () => {
    const store = useProgressStore()
    expect(store.state.sessionsPlayed).toEqual({})
  })
})

describe('recordSessionResults', () => {
  it('accumulates stats for a quality', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', ['correct', 'enharmonic', 'wrong'], NO_HELP)
    expect(store.state.stats['major']).toEqual({ correct: 1, enharmonic: 1, wrong: 1, total: 3 })
  })

  it('accumulates stats across multiple calls', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', ['correct', 'correct'], NO_HELP)
    store.recordSessionResults('major', ['wrong'], NO_HELP)
    expect(store.state.stats['major']).toEqual({ correct: 2, enharmonic: 0, wrong: 1, total: 3 })
  })

  it('accumulates score on each perfect session', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', PERFECT, NO_HELP)
    expect(store.state.accumulatedScore['major']).toBe(PERFECT_SESSION_SCORE)
    store.recordSessionResults('major', PERFECT, NO_HELP)
    expect(store.state.accumulatedScore['major']).toBe(PERFECT_SESSION_SCORE * 2)
  })

  it('does not lose accumulated score on an imperfect session — mistakes slow progress, never erase it', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', PERFECT, NO_HELP)
    store.recordSessionResults('major', IMPERFECT, NO_HELP)
    // IMPERFECT = 5 correct + 1 wrong = 5*3 = 15 pts, added on top of the perfect session's 18
    expect(store.state.accumulatedScore['major']).toBe(PERFECT_SESSION_SCORE + 15)
  })

  it('applies the hard-mode progression multiplier to session score', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', PERFECT, { noDegreeLabels: true, noPianoKeyboard: true })
    expect(store.state.accumulatedScore['major']).toBe(PERFECT_SESSION_SCORE * 1.5)
  })

  it('advances sub-stage once accumulatedScore reaches targetScore', () => {
    const store = useProgressStore()
    const sessionsToTarget = TARGET_SCORE / PERFECT_SESSION_SCORE
    for (let i = 0; i < sessionsToTarget; i++) {
      store.recordSessionResults('major', PERFECT, NO_HELP)
    }
    expect(store.state.learning.subStage).toBe(2)
  })

  it('a lower-scoring session slows progress but does not block advancing eventually', () => {
    const store = useProgressStore()
    for (let i = 0; i < 11; i++) {
      store.recordSessionResults('major', IMPERFECT, NO_HELP)
    }
    // IMPERFECT contributes 15 pts/session; 11 * 15 = 165 < 180, one more session needed to cross it
    expect(store.state.learning.subStage).toBe(1)
    store.recordSessionResults('major', IMPERFECT, NO_HELP)
    expect(store.state.learning.subStage).toBe(2)
  })

  it('accumulatedScore resets to 0 after advancing and must reach targetScore again', () => {
    const store = useProgressStore()
    const sessionsToTarget = TARGET_SCORE / PERFECT_SESSION_SCORE
    for (let i = 0; i < sessionsToTarget; i++) {
      store.recordSessionResults('major', PERFECT, NO_HELP)
    }
    expect(store.state.learning.subStage).toBe(2)
    expect(store.state.accumulatedScore['major']).toBe(0)
  })

  it('does not let stale accumulatedScore from an earlier stage auto-complete a later substage reusing the same quality', () => {
    const store = useProgressStore()
    // 'ionian' appears in both Stage 5 (Common Scales) and Stage 7 (Major Scale Modes).
    // recordSessionResults derives targetScore from results.length, not the real puzzle size,
    // so a 6-cell PERFECT session is used here purely for test simplicity — one perfect session
    // always contributes 1/10 of whatever target that session implies, regardless of quality.
    store.state.learning = { stage: 5, subStage: 1 }
    for (let i = 0; i < TARGET_SCORE / PERFECT_SESSION_SCORE; i++) {
      store.recordSessionResults('ionian', PERFECT, NO_HELP)
    }
    expect(store.state.accumulatedScore['ionian']).toBe(0)

    store.state.learning = { stage: 7, subStage: 1 }
    expect(store.state.accumulatedScore['ionian']).toBe(0)
    store.recordSessionResults('ionian', PERFECT, NO_HELP)
    expect(store.state.learning.subStage).toBe(1)
  })
})

describe('currentLearningQuality', () => {
  it('returns the quality at the current stage/subStage', () => {
    const store = useProgressStore()
    expect(store.currentLearningQuality()).toBe('seconds')
  })

  it('returns the correct quality after moving within a stage', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 2, subStage: 2 }
    expect(store.currentLearningQuality()).toBe('minor')
  })

  it('returns null when the stage is beyond CURRICULUM', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 99, subStage: 1 }
    expect(store.currentLearningQuality()).toBeNull()
  })
})

describe('incrementSessionsPlayed', () => {
  it('increments sessionsPlayed for a quality', () => {
    const store = useProgressStore()
    store.incrementSessionsPlayed('major')
    expect(store.state.sessionsPlayed['major']).toBe(1)
  })

  it('accumulates across multiple calls', () => {
    const store = useProgressStore()
    store.incrementSessionsPlayed('major')
    store.incrementSessionsPlayed('major')
    store.incrementSessionsPlayed('major')
    expect(store.state.sessionsPlayed['major']).toBe(3)
  })

  it('tracks different qualities independently', () => {
    const store = useProgressStore()
    store.incrementSessionsPlayed('major')
    store.incrementSessionsPlayed('seconds')
    expect(store.state.sessionsPlayed['major']).toBe(1)
    expect(store.state.sessionsPlayed['seconds']).toBe(1)
  })
})

describe('guidanceLevelFor', () => {
  it('returns full for an unplayed quality', () => {
    const store = useProgressStore()
    expect(store.guidanceLevelFor('major')).toBe('full')
  })

  it('returns full for sessions 0, 1, 2', () => {
    const store = useProgressStore()
    for (let i = 0; i < 3; i++) {
      expect(store.guidanceLevelFor('major')).toBe('full')
      store.incrementSessionsPlayed('major')
    }
  })

  it('returns hint for sessions 3, 4, 5', () => {
    const store = useProgressStore()
    for (let i = 0; i < 3; i++) store.incrementSessionsPlayed('major')
    for (let i = 0; i < 3; i++) {
      expect(store.guidanceLevelFor('major')).toBe('hint')
      store.incrementSessionsPlayed('major')
    }
  })

  it('returns none for session 6 and beyond', () => {
    const store = useProgressStore()
    for (let i = 0; i < 6; i++) store.incrementSessionsPlayed('major')
    expect(store.guidanceLevelFor('major')).toBe('none')
    store.incrementSessionsPlayed('major')
    expect(store.guidanceLevelFor('major')).toBe('none')
  })

  it('works for IntervalGroup qualities', () => {
    const store = useProgressStore()
    expect(store.guidanceLevelFor('seconds')).toBe('full')
    store.incrementSessionsPlayed('seconds')
    store.incrementSessionsPlayed('seconds')
    store.incrementSessionsPlayed('seconds')
    expect(store.guidanceLevelFor('seconds')).toBe('hint')
  })
})

describe('advanceLearning', () => {
  it('advances to next sub-stage within the same stage', () => {
    const store = useProgressStore()
    store.advanceLearning()
    expect(store.state.learning).toEqual({ stage: 1, subStage: 2 })
  })

  it('advances to next stage after last sub-stage of Stage 0 (Interval Basics, 8 sub-stages)', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 1, subStage: 8 }
    store.advanceLearning()
    expect(store.state.learning).toEqual({ stage: 2, subStage: 1 })
  })

  it('unlocks all Stage 0 qualities when completing it', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 1, subStage: 8 }
    store.advanceLearning()
    expect(store.state.unlockedContent).toContain('seconds')
    expect(store.state.unlockedContent).toContain('thirds')
    expect(store.state.unlockedContent).toContain('fourthsFifths')
    expect(store.state.unlockedContent).toContain('sixths')
    expect(store.state.unlockedContent).toContain('sevenths')
    expect(store.state.unlockedContent).toContain('ninths')
    expect(store.state.unlockedContent).toContain('alteredExtensions')
    expect(store.state.unlockedContent).toContain('thirteenth')
  })

  it('advances to next stage after last sub-stage of Triads (stage 2, 6 sub-stages)', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 2, subStage: 6 }
    store.advanceLearning()
    expect(store.state.learning).toEqual({ stage: 3, subStage: 1 })
  })

  it('unlocks all Triads qualities when completing stage 2', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 2, subStage: 6 }
    store.advanceLearning()
    expect(store.state.unlockedContent).toContain('major')
    expect(store.state.unlockedContent).toContain('minor')
    expect(store.state.unlockedContent).toContain('aug')
    expect(store.state.unlockedContent).toContain('dim')
    expect(store.state.unlockedContent).toContain('sus2')
    expect(store.state.unlockedContent).toContain('sus4')
  })

  it('does not unlock content when advancing within a stage', () => {
    const store = useProgressStore()
    store.advanceLearning()
    expect(store.state.unlockedContent).toHaveLength(0)
  })

  it('does nothing if current stage is beyond CURRICULUM', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 99, subStage: 1 }
    expect(() => store.advanceLearning()).not.toThrow()
    expect(store.state.learning).toEqual({ stage: 99, subStage: 1 })
  })
})

describe('unlockContent', () => {
  it('adds a quality to unlockedContent', () => {
    const store = useProgressStore()
    store.unlockContent('major')
    expect(store.state.unlockedContent).toContain('major')
  })

  it('does not duplicate an already unlocked quality', () => {
    const store = useProgressStore()
    store.unlockContent('major')
    store.unlockContent('major')
    expect(store.state.unlockedContent).toHaveLength(1)
  })
})

describe('skipToTriads', () => {
  it('sets learning to stage 2 (Triads), subStage 1', () => {
    const store = useProgressStore()
    store.skipToTriads()
    expect(store.state.learning).toEqual({ stage: 2, subStage: 1 })
  })

  it('resets accumulatedScore for the destination quality (Triads sub-stage 1 is major)', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', PERFECT, NO_HELP)
    store.skipToTriads()
    expect(store.state.accumulatedScore['major']).toBe(0)
  })
})

describe('updateStreak', () => {
  it('sets streak to 1 on first practice', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05'))
    const store = useProgressStore()
    store.updateStreak()
    expect(store.state.practiceStreak).toBe(1)
    expect(store.state.lastPracticeDate).toBe('2026-06-05')
  })

  it('does not change streak if called twice on the same day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05'))
    const store = useProgressStore()
    store.updateStreak()
    store.updateStreak()
    expect(store.state.practiceStreak).toBe(1)
  })

  it('increments streak on consecutive day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05'))
    const store = useProgressStore()
    store.updateStreak()

    vi.setSystemTime(new Date('2026-06-06'))
    store.updateStreak()
    expect(store.state.practiceStreak).toBe(2)
  })

  it('resets streak after a gap', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-05'))
    const store = useProgressStore()
    store.updateStreak()

    vi.setSystemTime(new Date('2026-06-08'))
    store.updateStreak()
    expect(store.state.practiceStreak).toBe(1)
  })
})

describe('jumpToPosition', () => {
  it('jumps to a valid stage and sub-stage', () => {
    const store = useProgressStore()
    store.jumpToPosition(1, 3)
    expect(store.state.learning).toEqual({ stage: 1, subStage: 3 })
  })

  it('jumps to stage 1 sub-stage 5 when valid (Stage 0 has 8 sub-stages)', () => {
    const store = useProgressStore()
    store.jumpToPosition(1, 5)
    expect(store.state.learning).toEqual({ stage: 1, subStage: 5 })
  })

  it('jumps to stage 2 sub-stage 4 when valid (Triads has 6 sub-stages)', () => {
    const store = useProgressStore()
    store.jumpToPosition(2, 4)
    expect(store.state.learning).toEqual({ stage: 2, subStage: 4 })
  })

  it('resets accumulatedScore for the destination quality on jump', () => {
    const store = useProgressStore()
    // stage 1, sub-stage 2 = 'thirds' in CURRICULUM
    store.recordSessionResults('thirds', PERFECT, NO_HELP)
    store.jumpToPosition(1, 2)
    expect(store.state.accumulatedScore['thirds']).toBe(0)
  })

  it('falls back to 1,1 when stage does not exist in curriculum', () => {
    const store = useProgressStore()
    store.jumpToPosition(99, 1)
    expect(store.state.learning).toEqual({ stage: 1, subStage: 1 })
  })

  it('falls back to 1,1 when sub-stage is out of range', () => {
    const store = useProgressStore()
    store.jumpToPosition(1, 99)
    expect(store.state.learning).toEqual({ stage: 1, subStage: 1 })
  })

  it('falls back to 1,1 for stage 0', () => {
    const store = useProgressStore()
    store.jumpToPosition(0, 1)
    expect(store.state.learning).toEqual({ stage: 1, subStage: 1 })
  })

  it('falls back to 1,1 for sub-stage 0', () => {
    const store = useProgressStore()
    store.jumpToPosition(1, 0)
    expect(store.state.learning).toEqual({ stage: 1, subStage: 1 })
  })
})

describe('freePlayAccess', () => {
  it('Stage 0 (Interval Basics) is always fully accessible regardless of progress', () => {
    const store = useProgressStore()
    const access = store.freePlayAccess
    expect(access[0]!.accessible).toBe(true)
    expect(access[0]!.subStages.every((ss) => ss.accessible)).toBe(true)
  })

  it('Stage 0 always-accessible even for a brand-new player at stage 1, subStage 1', () => {
    const store = useProgressStore()
    const access = store.freePlayAccess
    // access[0] = Stage 0, always open
    expect(access[0]!.accessible).toBe(true)
    // Stages 1+ (index 1+) are all locked
    expect(access.slice(1).every((s) => !s.accessible)).toBe(true)
    expect(access.slice(1).every((s) => s.subStages.every((ss) => !ss.accessible))).toBe(true)
  })

  it('makes Triads (stage 2, index 1) partially accessible when user is on subStage 2 of stage 2', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 2, subStage: 2 }
    const access = store.freePlayAccess
    // Stage 0 still always accessible
    expect(access[0]!.accessible).toBe(true)
    // Triads (stage 2, index 1) is accessible
    expect(access[1]!.accessible).toBe(true)
    expect(access[1]!.subStages[0]!.accessible).toBe(true)
    expect(access[1]!.subStages[1]!.accessible).toBe(true)
    expect(access[1]!.subStages[2]!.accessible).toBe(false)
    // Stage 2+ (index 2+) locked
    expect(access.slice(2).every((s) => !s.accessible)).toBe(true)
  })

  it('makes Triads fully accessible and Tetrads locked when user starts stage 3', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 3, subStage: 1 }
    const access = store.freePlayAccess
    expect(access[0]!.accessible).toBe(true)
    expect(access[1]!.accessible).toBe(true)
    expect(access[1]!.subStages.every((ss) => ss.accessible)).toBe(true)
    expect(access[2]!.accessible).toBe(false)
  })

  it('includes Stage 0 qualities and marks them all accessible', () => {
    const store = useProgressStore()
    expect(store.freePlayAccess[0]!.subStages[0]!.quality).toBe('seconds')
    expect(store.freePlayAccess[0]!.subStages[0]!.accessible).toBe(true)
  })

  it('includes Triads qualities at index 1', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 2, subStage: 2 }
    expect(store.freePlayAccess[1]!.subStages[0]!.quality).toBe('major')
    expect(store.freePlayAccess[1]!.subStages[1]!.quality).toBe('minor')
  })
})

describe('setLastFreePlayStage', () => {
  it('updates lastFreePlayStage', () => {
    const store = useProgressStore()
    store.setLastFreePlayStage(2)
    expect(store.state.lastFreePlayStage).toBe(2)
  })
})

describe('setIdleMode', () => {
  it('updates idleMode to freePlay', () => {
    const store = useProgressStore()
    store.setIdleMode('freePlay')
    expect(store.state.idleMode).toBe('freePlay')
  })

  it('updates idleMode back to learn', () => {
    const store = useProgressStore()
    store.setIdleMode('freePlay')
    store.setIdleMode('learn')
    expect(store.state.idleMode).toBe('learn')
  })
})

describe('persistence', () => {
  it('saves state to localStorage on mutation', () => {
    const store = useProgressStore()
    store.unlockContent('major')
    const saved = JSON.parse(localStorage.getItem('harmatrix:progress') ?? '{}') as {
      unlockedContent: string[]
    }
    expect(saved.unlockedContent).toContain('major')
  })

  it('loads persisted state on store init', () => {
    const initial = useProgressStore()
    initial.unlockContent('minor')

    setActivePinia(createPinia())
    const reloaded = useProgressStore()
    expect(reloaded.state.unlockedContent).toContain('minor')
  })

  it('persists lastFreePlayStage', () => {
    const store = useProgressStore()
    store.setLastFreePlayStage(3)

    setActivePinia(createPinia())
    const reloaded = useProgressStore()
    expect(reloaded.state.lastFreePlayStage).toBe(3)
  })

  it('persists idleMode', () => {
    const store = useProgressStore()
    store.setIdleMode('freePlay')

    setActivePinia(createPinia())
    const reloaded = useProgressStore()
    expect(reloaded.state.idleMode).toBe('freePlay')
  })

  it('persists sessionsPlayed', () => {
    const store = useProgressStore()
    store.incrementSessionsPlayed('major')
    store.incrementSessionsPlayed('major')

    setActivePinia(createPinia())
    const reloaded = useProgressStore()
    expect(reloaded.state.sessionsPlayed['major']).toBe(2)
  })


  it('migrates storageVersion 1 data by incrementing stage by 1, cascading through to the current version', () => {
    localStorage.setItem(
      'harmatrix:progress',
      JSON.stringify({ storageVersion: 1, learning: { stage: 2, subStage: 3 } }),
    )
    setActivePinia(createPinia())
    const store = useProgressStore()
    expect(store.state.learning).toEqual({ stage: 3, subStage: 3 })
    expect(store.state.storageVersion).toBe(3)
  })

  it('migrates storageVersion 2 data (perfectStreak model) to accumulatedScore', () => {
    localStorage.setItem(
      'harmatrix:progress',
      JSON.stringify({
        storageVersion: 2,
        learning: { stage: 2, subStage: 3 },
        currentSubStageSession: { perfectStreak: 4 },
      }),
    )
    setActivePinia(createPinia())
    const store = useProgressStore()
    expect(store.state.learning).toEqual({ stage: 2, subStage: 3 })
    expect(store.state.accumulatedScore).toEqual({})
    expect(store.state.storageVersion).toBe(3)
  })

  it('does not migrate data that already has storageVersion 3', () => {
    localStorage.setItem(
      'harmatrix:progress',
      JSON.stringify({ storageVersion: 3, learning: { stage: 2, subStage: 3 }, accumulatedScore: { major: 42 } }),
    )
    setActivePinia(createPinia())
    const store = useProgressStore()
    expect(store.state.learning).toEqual({ stage: 2, subStage: 3 })
    expect(store.state.accumulatedScore).toEqual({ major: 42 })
  })
})

describe('nextDiagonalNote', () => {
  it('returns C on the very first session for a quality', () => {
    const store = useProgressStore()
    // sessionsPlayed['major'] is 0 by default
    expect(store.nextDiagonalNote('major', false)).toBe('C')
  })

  it('returns C in learn mode regardless of progress when sessionsPlayed is 0', () => {
    const store = useProgressStore()
    store.state.accumulatedScore['major'] = TARGET_SCORE * 0.9
    expect(store.nextDiagonalNote('major', false)).toBe('C')
  })

  it('returns a natural note for progress ratio 0-40% after first session', () => {
    const store = useProgressStore()
    store.state.sessionsPlayed['major'] = 1
    const naturals = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    for (const ratio of [0, 0.1, 0.2, 0.3, 0.4]) {
      store.state.accumulatedScore['major'] = TARGET_SCORE * ratio
      store.state.diagonalNoteHistory = []
      for (let i = 0; i < 10; i++) {
        const note = store.nextDiagonalNote('major', false)
        expect(naturals).toContain(note)
        store.state.diagonalNoteHistory = []
      }
    }
  })

  it('returns any note (full pool) for progress ratio 40-70% after first session', () => {
    const store = useProgressStore()
    store.state.sessionsPlayed['major'] = 1
    for (const ratio of [0.5, 0.6, 0.7]) {
      store.state.accumulatedScore['major'] = TARGET_SCORE * ratio
      store.state.diagonalNoteHistory = []
      const notes = new Set(
        Array.from({ length: 20 }, () => {
          store.state.diagonalNoteHistory = []
          return store.nextDiagonalNote('major', false)
        }),
      )
      expect(notes.size).toBeGreaterThan(1)
    }
  })

  it('returns an altered note for progress ratio 80-90% after first session', () => {
    const store = useProgressStore()
    store.state.sessionsPlayed['major'] = 1
    const naturals = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
    for (const ratio of [0.8, 0.9]) {
      store.state.accumulatedScore['major'] = TARGET_SCORE * ratio
      store.state.diagonalNoteHistory = []
      for (let i = 0; i < 10; i++) {
        const note = store.nextDiagonalNote('major', false)
        expect(naturals).not.toContain(note)
        store.state.diagonalNoteHistory = []
      }
    }
  })

  it('ignores progress rules in free play mode', () => {
    const store = useProgressStore()
    store.state.sessionsPlayed['major'] = 0
    store.state.accumulatedScore['major'] = 0
    // Should not return C every time — free play uses full pool
    const notes = new Set(Array.from({ length: 40 }, () => {
      store.state.diagonalNoteHistory = []
      return store.nextDiagonalNote('major', true)
    }))
    expect(notes.size).toBeGreaterThan(1)
  })

  it('appends note to diagonalNoteHistory and limits to last 3', () => {
    const store = useProgressStore()
    store.state.sessionsPlayed['major'] = 1
    store.nextDiagonalNote('major', false)
    store.nextDiagonalNote('major', false)
    store.nextDiagonalNote('major', false)
    store.nextDiagonalNote('major', false)
    expect(store.state.diagonalNoteHistory).toHaveLength(3)
  })
})
