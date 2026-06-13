import { ref } from 'vue'
import { defineStore } from 'pinia'
import { generateMatrix } from '@/music/matrix'
import { validateAnswer, scoreSession } from '@/music/scoring'
import type { MatrixPuzzle } from '@/music/matrix'
import type { AnswerResult, ScoringOptions } from '@/music/scoring'
import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'
import type { IntervalGroup } from '@/music/data/intervals'

type Quality = ChordQuality | ScaleMode | IntervalGroup

type GameSession =
  | { phase: 'idle' }
  | {
      phase: 'playing'
      puzzle: MatrixPuzzle
      answers: (string | null)[][]
      options: ScoringOptions
      isFreePlay: boolean
    }
  | {
      phase: 'completed'
      puzzle: MatrixPuzzle
      answers: (string | null)[][]
      results: AnswerResult[][]
      score: number
      options: ScoringOptions
      isFreePlay: boolean
    }

export type { GameSession }

export const useGameStore = defineStore('game', () => {
  const session = ref<GameSession>({ phase: 'idle' })

  function startPuzzle(
    diagonalNote: string,
    quality: Quality,
    options: ScoringOptions,
    isFreePlay = false,
  ): boolean {
    const puzzle = generateMatrix(diagonalNote, quality)
    if (!puzzle) return false

    const answers: (string | null)[][] = Array.from({ length: puzzle.size }, () =>
      Array.from({ length: puzzle.size }, (): string | null => null),
    )

    session.value = { phase: 'playing', puzzle, answers, options, isFreePlay }
    return true
  }

  function submitAnswer(row: number, col: number, note: string): boolean {
    if (session.value.phase !== 'playing') return false
    const { puzzle, answers } = session.value

    const cell = puzzle.cells[row]?.[col]
    if (!cell || cell.isGiven) return false

    const rowAnswers = answers[row]
    if (!rowAnswers) return false
    rowAnswers[col] = note
    return true
  }

  function completeSession(): boolean {
    if (session.value.phase !== 'playing') return false
    const { puzzle, answers, options } = session.value

    const results: AnswerResult[][] = puzzle.cells.map((rowCells, row) =>
      rowCells.map((cell, col) => {
        if (cell.isGiven) return 'correct'
        const answer = answers[row]?.[col] ?? null
        return answer !== null ? validateAnswer(cell.note, answer) : 'wrong'
      }),
    )

    const nonGivenResults = puzzle.cells.flatMap((rowCells, row) =>
      rowCells.flatMap((cell, col) => {
        if (cell.isGiven) return []
        const answer = answers[row]?.[col] ?? null
        const result: AnswerResult = answer !== null ? validateAnswer(cell.note, answer) : 'wrong'
        return [result]
      }),
    )

    session.value = {
      phase: 'completed',
      puzzle,
      answers,
      results,
      score: scoreSession(nonGivenResults, options),
      options,
      isFreePlay: session.value.isFreePlay,
    }
    return true
  }

  function resetSession(): void {
    session.value = { phase: 'idle' }
  }

  return { session, startPuzzle, submitAnswer, completeSession, resetSession }
})
