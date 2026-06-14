import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { CURRICULUM, SUB_STAGE_SESSION_SIZE, INTRO_STAGE } from '@/config/game'
import { randomDiagonalNote } from '@/music/note'
import type { DiagonalPool } from '@/music/note'
import type { AnswerResult } from '@/music/scoring'
import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'
import type { IntervalGroup } from '@/music/data/intervals'

type Quality = ChordQuality | ScaleMode | IntervalGroup

interface LearningPosition {
  stage: number
  subStage: number
}

interface SubStageSession {
  perfectStreak: number
}

interface QualityStats {
  correct: number
  enharmonic: number
  wrong: number
  total: number
}

interface ProgressState {
  storageVersion: number
  learning: LearningPosition
  currentSubStageSession: SubStageSession
  unlockedContent: Array<Quality>
  stats: Partial<Record<Quality, QualityStats>>
  sessionsPlayed: Partial<Record<Quality, number>>
  practiceStreak: number
  lastPracticeDate: string
  diagonalNoteHistory: string[]
  lastFreePlayStage: number | null
  idleMode: 'learn' | 'freePlay'
}

interface FreePlaySubStageAccess {
  accessible: boolean
  quality: Quality
}

interface FreePlayStageAccess {
  accessible: boolean
  subStages: FreePlaySubStageAccess[]
}

export type { ProgressState, QualityStats, FreePlayStageAccess, FreePlaySubStageAccess }

const STORAGE_KEY = 'harmatrix:progress'

function makeDefaultState(): ProgressState {
  return {
    storageVersion: 2,
    learning: { stage: 1, subStage: 1 },
    currentSubStageSession: { perfectStreak: 0 },
    unlockedContent: [],
    stats: {},
    sessionsPlayed: {},
    practiceStreak: 0,
    lastPracticeDate: '',
    diagonalNoteHistory: [],
    lastFreePlayStage: null,
    idleMode: 'learn',
  }
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return makeDefaultState()
    const persisted = JSON.parse(raw) as Partial<ProgressState>
    const merged: ProgressState = { ...makeDefaultState(), ...persisted }
    // Migrate from block-session model (puzzlesPlayed/perfectPuzzles → perfectStreak)
    if (!('perfectStreak' in (merged.currentSubStageSession ?? {}))) {
      merged.currentSubStageSession = { perfectStreak: 0 }
    }
    // storageVersion 1→2: Stage 0 (Interval Basics) prepended — shift existing stage by 1
    if ((merged.storageVersion ?? 1) < 2) {
      merged.learning = { stage: merged.learning.stage + 1, subStage: merged.learning.subStage }
      merged.storageVersion = 2
    }
    return merged
  } catch {
    return makeDefaultState()
  }
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

let devGuidanceOverride: 'full' | 'hint' | 'none' | null = null

export const useProgressStore = defineStore('progress', () => {
  const state = ref<ProgressState>(loadState())

  watch(
    state,
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch {
        // localStorage unavailable (e.g. private browsing quota exceeded)
      }
    },
    { deep: true, flush: 'sync' },
  )

  function recordSessionResults(
    quality: Quality,
    results: AnswerResult[],
  ): void {
    const existing = state.value.stats[quality] ?? { correct: 0, enharmonic: 0, wrong: 0, total: 0 }
    state.value.stats[quality] = {
      correct: existing.correct + results.filter((r) => r === 'correct').length,
      enharmonic: existing.enharmonic + results.filter((r) => r === 'enharmonic').length,
      wrong: existing.wrong + results.filter((r) => r === 'wrong').length,
      total: existing.total + results.length,
    }

    const isPerfect = results.length > 0 && results.every((r) => r === 'correct')
    if (isPerfect) {
      state.value.currentSubStageSession.perfectStreak++
      if (state.value.currentSubStageSession.perfectStreak === SUB_STAGE_SESSION_SIZE) {
        state.value.currentSubStageSession = { perfectStreak: 0 }
        advanceLearning()
      }
    } else {
      state.value.currentSubStageSession = { perfectStreak: 0 }
    }
  }

  function advanceLearning(): void {
    const { stage, subStage } = state.value.learning
    const stageQualities = CURRICULUM[stage - 1]
    if (!stageQualities) return

    if (subStage < stageQualities.length) {
      state.value.learning.subStage++
    } else {
      for (const quality of stageQualities) {
        unlockContent(quality)
      }
      state.value.learning = { stage: stage + 1, subStage: 1 }
    }
  }

  function unlockContent(quality: Quality): void {
    if (!state.value.unlockedContent.includes(quality)) {
      state.value.unlockedContent.push(quality)
    }
  }

  function updateStreak(): void {
    const today = new Date().toISOString().slice(0, 10)
    const { lastPracticeDate } = state.value

    if (lastPracticeDate === today) return

    if (lastPracticeDate === '') {
      state.value.practiceStreak = 1
    } else {
      const diff = daysBetween(lastPracticeDate, today)
      state.value.practiceStreak = diff === 1 ? state.value.practiceStreak + 1 : 1
    }

    state.value.lastPracticeDate = today
  }

  function poolForStreak(streak: number): DiagonalPool {
    if (streak <= 4) return 'natural'
    if (streak <= 7) return 'full'
    return 'altered'
  }

  function nextDiagonalNote(quality: Quality, isFreePlay: boolean): string {
    const history = state.value.diagonalNoteHistory ?? []
    let note: string

    if (isFreePlay) {
      note = randomDiagonalNote(history, 'full')
    } else if ((state.value.sessionsPlayed[quality] ?? 0) === 0) {
      note = 'C'
    } else {
      const pool = poolForStreak(state.value.currentSubStageSession.perfectStreak)
      note = randomDiagonalNote(history, pool)
    }

    state.value.diagonalNoteHistory = [...history, note].slice(-3)
    return note
  }

  function jumpToPosition(stage: number, subStage: number): void {
    const stageQualities = CURRICULUM[stage - 1]
    const valid = stageQualities !== undefined && subStage >= 1 && subStage <= stageQualities.length
    state.value.learning = valid ? { stage, subStage } : { stage: 1, subStage: 1 }
    state.value.currentSubStageSession = { perfectStreak: 0 }
  }

  const freePlayAccess = computed<FreePlayStageAccess[]>(() => {
    const { stage, subStage } = state.value.learning
    return CURRICULUM.map((subStages, stageIndex) => {
      const stageNum = stageIndex + 1
      if (stageNum === INTRO_STAGE) {
        return {
          accessible: true,
          subStages: subStages.map((quality) => ({ accessible: true, quality })),
        }
      }
      const stageAccessible = stageNum < stage || (stageNum === stage && subStage >= 2)
      const subStagesList = subStages.map((quality, ssIndex) => ({
        accessible: stageAccessible && (stageNum < stage || ssIndex <= subStage - 1),
        quality,
      }))
      return { accessible: stageAccessible, subStages: subStagesList }
    })
  })

  function incrementSessionsPlayed(quality: Quality): void {
    state.value.sessionsPlayed[quality] = (state.value.sessionsPlayed[quality] ?? 0) + 1
  }

  function guidanceLevelFor(quality: Quality): 'full' | 'hint' | 'none' {
    if (devGuidanceOverride !== null) return devGuidanceOverride
    const n = state.value.sessionsPlayed[quality] ?? 0
    if (n < 3) return 'full'
    if (n < 6) return 'hint'
    return 'none'
  }

  function setGuidanceOverride(level: 'full' | 'hint' | 'none' | null): void {
    devGuidanceOverride = level
  }

  function skipToTriads(): void {
    state.value.learning = { stage: INTRO_STAGE + 1, subStage: 1 }
    state.value.currentSubStageSession = { perfectStreak: 0 }
  }

  function setLastFreePlayStage(stage: number): void {
    state.value.lastFreePlayStage = stage
  }

  function setIdleMode(mode: 'learn' | 'freePlay'): void {
    state.value.idleMode = mode
  }

  function resetProgress(): void {
    state.value = makeDefaultState()
  }

  return {
    state,
    freePlayAccess,
    recordSessionResults,
    incrementSessionsPlayed,
    guidanceLevelFor,
    advanceLearning,
    unlockContent,
    updateStreak,
    nextDiagonalNote,
    resetProgress,
    jumpToPosition,
    skipToTriads,
    setLastFreePlayStage,
    setIdleMode,
    setGuidanceOverride,
  }
})
