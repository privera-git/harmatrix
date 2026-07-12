import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { CURRICULUM, SUB_STAGE_SESSION_SIZE, PROGRESSION_MULTIPLIERS, INTRO_STAGE } from '@/config/game'
import { randomDiagonalNote } from '@/music/note'
import type { DiagonalPool } from '@/music/note'
import { puzzleSize } from '@/music/matrix'
import { scoreCell } from '@/music/scoring'
import type { AnswerResult, ScoringOptions } from '@/music/scoring'
import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'
import type { IntervalGroup } from '@/music/data/intervals'

type Quality = ChordQuality | ScaleMode | IntervalGroup

interface LearningPosition {
  stage: number
  subStage: number
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
  accumulatedScore: Partial<Record<Quality, number>>
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
    storageVersion: 3,
    learning: { stage: 1, subStage: 1 },
    accumulatedScore: {},
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
    // storageVersion 1→2: Stage 0 (Interval Basics) prepended — shift existing stage by 1
    if ((merged.storageVersion ?? 1) < 2) {
      merged.learning = { stage: merged.learning.stage + 1, subStage: merged.learning.subStage }
      merged.storageVersion = 2
    }
    // storageVersion 2→3: perfectStreak model replaced by accumulatedScore (GDR-001)
    if (merged.storageVersion < 3) {
      merged.accumulatedScore = {}
      merged.storageVersion = 3
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

  function progressionMultiplier(options: ScoringOptions): number {
    if (options.noDegreeLabels && options.noPianoKeyboard) return PROGRESSION_MULTIPLIERS.hardMode
    if (options.noDegreeLabels || options.noPianoKeyboard) return PROGRESSION_MULTIPLIERS.oneToggle
    return PROGRESSION_MULTIPLIERS.noHelp
  }

  function targetScoreFor(numCells: number): number {
    return SUB_STAGE_SESSION_SIZE * numCells * 3
  }

  function recordSessionResults(
    quality: Quality,
    results: AnswerResult[],
    options: ScoringOptions,
  ): void {
    const existing = state.value.stats[quality] ?? { correct: 0, enharmonic: 0, wrong: 0, total: 0 }
    state.value.stats[quality] = {
      correct: existing.correct + results.filter((r) => r === 'correct').length,
      enharmonic: existing.enharmonic + results.filter((r) => r === 'enharmonic').length,
      wrong: existing.wrong + results.filter((r) => r === 'wrong').length,
      total: existing.total + results.length,
    }

    const rawScore = results.reduce((sum, r) => sum + scoreCell(r), 0)
    const contribution = rawScore * progressionMultiplier(options)
    const accumulated = (state.value.accumulatedScore[quality] ?? 0) + contribution
    state.value.accumulatedScore[quality] = accumulated

    if (accumulated >= targetScoreFor(results.length)) {
      state.value.accumulatedScore[quality] = 0
      advanceLearning()
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

  function poolForProgress(ratio: number): DiagonalPool {
    if (ratio <= 0.4) return 'natural'
    if (ratio <= 0.7) return 'full'
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
      const pool = poolForProgress(progressRatio(quality))
      note = randomDiagonalNote(history, pool)
    }

    state.value.diagonalNoteHistory = [...history, note].slice(-3)
    return note
  }

  function progressRatio(quality: Quality): number {
    const numCells = puzzleSize(quality) * (puzzleSize(quality) - 1)
    return (state.value.accumulatedScore[quality] ?? 0) / targetScoreFor(numCells)
  }

  function jumpToPosition(stage: number, subStage: number): void {
    const stageQualities = CURRICULUM[stage - 1]
    const valid = stageQualities !== undefined && subStage >= 1 && subStage <= stageQualities.length
    state.value.learning = valid ? { stage, subStage } : { stage: 1, subStage: 1 }
    const destinationQuality = CURRICULUM[state.value.learning.stage - 1]?.[state.value.learning.subStage - 1]
    if (destinationQuality !== undefined) {
      state.value.accumulatedScore[destinationQuality] = 0
    }
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
    const destinationQuality = CURRICULUM[state.value.learning.stage - 1]?.[0]
    if (destinationQuality !== undefined) {
      state.value.accumulatedScore[destinationQuality] = 0
    }
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
    progressRatio,
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
