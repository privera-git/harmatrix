import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { CURRICULUM, SUB_STAGE_SESSION_SIZE } from '@/config/game'
import { randomDiagonalNote } from '@/music/note'
import type { AnswerResult } from '@/music/scoring'
import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'

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
  learning: LearningPosition
  currentSubStageSession: SubStageSession
  unlockedContent: Array<ChordQuality | ScaleMode>
  stats: Partial<Record<ChordQuality | ScaleMode, QualityStats>>
  practiceStreak: number
  lastPracticeDate: string
  diagonalNoteHistory: string[]
}

export type { ProgressState, QualityStats }

const STORAGE_KEY = 'harmatrix:progress'

function makeDefaultState(): ProgressState {
  return {
    learning: { stage: 1, subStage: 1 },
    currentSubStageSession: { perfectStreak: 0 },
    unlockedContent: [],
    stats: {},
    practiceStreak: 0,
    lastPracticeDate: '',
    diagonalNoteHistory: [],
  }
}

function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return makeDefaultState()
    const parsed = JSON.parse(raw) as ProgressState
    // Migrate from block-session model (puzzlesPlayed/perfectPuzzles → perfectStreak)
    if (!('perfectStreak' in (parsed.currentSubStageSession ?? {}))) {
      parsed.currentSubStageSession = { perfectStreak: 0 }
    }
    return parsed
  } catch {
    return makeDefaultState()
  }
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

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
    quality: ChordQuality | ScaleMode,
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

  function unlockContent(quality: ChordQuality | ScaleMode): void {
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

  function nextDiagonalNote(): string {
    const history = state.value.diagonalNoteHistory ?? []
    const note = randomDiagonalNote(history)
    state.value.diagonalNoteHistory = [...history, note].slice(-3)
    return note
  }

  function resetProgress(): void {
    state.value = makeDefaultState()
  }

  return { state, recordSessionResults, advanceLearning, unlockContent, updateStreak, nextDiagonalNote, resetProgress }
})
