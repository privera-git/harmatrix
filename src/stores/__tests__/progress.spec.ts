import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProgressStore } from '@/stores/progress'
import { SUB_STAGE_SESSION_SIZE } from '@/config/game'

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

const PERFECT = Array<'correct'>(6).fill('correct')
const IMPERFECT: ('correct' | 'wrong')[] = [...Array<'correct'>(5).fill('correct'), 'wrong']

describe('initial state', () => {
  it('starts at stage 1, sub-stage 1', () => {
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
})

describe('recordSessionResults', () => {
  it('accumulates stats for a quality', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', ['correct', 'enharmonic', 'wrong'])
    expect(store.state.stats['major']).toEqual({ correct: 1, enharmonic: 1, wrong: 1, total: 3 })
  })

  it('accumulates stats across multiple calls', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', ['correct', 'correct'])
    store.recordSessionResults('major', ['wrong'])
    expect(store.state.stats['major']).toEqual({ correct: 2, enharmonic: 0, wrong: 1, total: 3 })
  })

  it('increments perfectStreak on each consecutive perfect puzzle', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', PERFECT)
    expect(store.state.currentSubStageSession.perfectStreak).toBe(1)
    store.recordSessionResults('major', PERFECT)
    expect(store.state.currentSubStageSession.perfectStreak).toBe(2)
  })

  it('resets perfectStreak to 0 on imperfect puzzle', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', PERFECT)
    store.recordSessionResults('major', IMPERFECT)
    expect(store.state.currentSubStageSession.perfectStreak).toBe(0)
  })

  it('advances sub-stage after N perfect puzzles', () => {
    const store = useProgressStore()
    for (let i = 0; i < SUB_STAGE_SESSION_SIZE; i++) {
      store.recordSessionResults('major', PERFECT)
    }
    expect(store.state.learning.subStage).toBe(2)
  })

  it('any imperfect puzzle resets streak to 0 and does not advance', () => {
    const store = useProgressStore()
    for (let i = 0; i < SUB_STAGE_SESSION_SIZE - 1; i++) {
      store.recordSessionResults('major', PERFECT)
    }
    store.recordSessionResults('major', IMPERFECT)
    expect(store.state.currentSubStageSession.perfectStreak).toBe(0)
    expect(store.state.learning.subStage).toBe(1)
  })

  it('streak resets to 0 after advancing and must reach N again', () => {
    const store = useProgressStore()
    for (let i = 0; i < SUB_STAGE_SESSION_SIZE; i++) {
      store.recordSessionResults('major', PERFECT)
    }
    expect(store.state.learning.subStage).toBe(2)
    expect(store.state.currentSubStageSession.perfectStreak).toBe(0)
  })
})

describe('advanceLearning', () => {
  it('advances to next sub-stage within the same stage', () => {
    const store = useProgressStore()
    store.advanceLearning()
    expect(store.state.learning).toEqual({ stage: 1, subStage: 2 })
  })

  it('advances to next stage after last sub-stage of Triads (6 sub-stages)', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 1, subStage: 6 }
    store.advanceLearning()
    expect(store.state.learning).toEqual({ stage: 2, subStage: 1 })
  })

  it('unlocks all Triads qualities when completing stage 1', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 1, subStage: 6 }
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

  it('jumps to stage 1 sub-stage 5 when valid (Triads has 6 sub-stages)', () => {
    const store = useProgressStore()
    store.jumpToPosition(1, 5)
    expect(store.state.learning).toEqual({ stage: 1, subStage: 5 })
  })

  it('resets perfectStreak to 0 on jump', () => {
    const store = useProgressStore()
    store.recordSessionResults('major', PERFECT)
    store.jumpToPosition(1, 2)
    expect(store.state.currentSubStageSession.perfectStreak).toBe(0)
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
  it('locks everything when user is on sub-stage 1 of stage 1', () => {
    const store = useProgressStore()
    const access = store.freePlayAccess
    expect(access.every((s) => !s.accessible)).toBe(true)
    expect(access.every((s) => s.subStages.every((ss) => !ss.accessible))).toBe(true)
  })

  it('makes stage 1 (Triads) partially accessible when user is on subStage 2 of stage 1', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 1, subStage: 2 }
    const access = store.freePlayAccess
    expect(access[0]!.accessible).toBe(true)
    expect(access[0]!.subStages[0]!.accessible).toBe(true)
    expect(access[0]!.subStages[1]!.accessible).toBe(true)
    expect(access[0]!.subStages[2]!.accessible).toBe(false)
    expect(access.slice(1).every((s) => !s.accessible)).toBe(true)
  })

  it('makes stage 1 fully accessible and stage 2 locked when user starts stage 2', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 2, subStage: 1 }
    const access = store.freePlayAccess
    expect(access[0]!.accessible).toBe(true)
    expect(access[0]!.subStages.every((ss) => ss.accessible)).toBe(true)
    expect(access[1]!.accessible).toBe(false)
  })

  it('includes the quality for each sub-stage of Triads', () => {
    const store = useProgressStore()
    store.state.learning = { stage: 1, subStage: 2 }
    expect(store.freePlayAccess[0]!.subStages[0]!.quality).toBe('major')
    expect(store.freePlayAccess[0]!.subStages[1]!.quality).toBe('minor')
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

})
