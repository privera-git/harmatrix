<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import { useProgressStore } from '@/stores/progress'
import { FEATURES } from '@/config/features'
import { SUB_STAGE_SESSION_SIZE } from '@/config/game'
import { formatPuzzleTitle } from '@/music/display'
import MatrixGrid from '@/components/MatrixGrid.vue'
import NotePicker from '@/components/NotePicker.vue'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import { useAudio } from '@/composables/useAudio'
import type { MatrixCell } from '@/music/matrix'

const { playJingle } = useAudio()

const gameStore = useGameStore()
const progressStore = useProgressStore()
const { session } = storeToRefs(gameStore)
const { state: progressState } = storeToRefs(progressStore)

const perfectStreak = computed(() => progressState.value.currentSubStageSession.perfectStreak)
const guidanceLevel = computed(() =>
  session.value.phase === 'playing' ? session.value.guidanceLevel : 'none',
)
const revealedHints = computed(() =>
  session.value.phase === 'playing' ? session.value.revealedHints : [],
)
const guidedAnswers = computed<string[][]>(() => {
  if (session.value.phase !== 'playing') return []
  return session.value.puzzle.cells.map((row) => row.map((cell) => cell.note))
})

const activeCell = ref<{ row: number; col: number } | null>(null)

const displayCells = computed<MatrixCell[][]>(() => {
  if (session.value.phase !== 'playing') return []
  const { puzzle, answers } = session.value
  return puzzle.cells.map((row, r) =>
    row.map(
      (cell, c): MatrixCell => ({
        ...cell,
        note: cell.isGiven ? cell.note : (answers[r]?.[c] ?? ''),
      }),
    ),
  )
})

const activeCellNote = computed<string | null>({
  get() {
    if (!activeCell.value || session.value.phase !== 'playing') return null
    return session.value.answers[activeCell.value.row]?.[activeCell.value.col] ?? null
  },
  set(note: string | null) {
    if (!activeCell.value || note === null || session.value.phase !== 'playing') return
    gameStore.submitAnswer(activeCell.value.row, activeCell.value.col, note)
  },
})

const showDegreeLabels = computed(
  () => session.value.phase === 'playing' && !session.value.options.noDegreeLabels,
)

const showPiano = computed(
  () =>
    FEATURES.PIANO_KEYBOARD &&
    session.value.phase === 'playing' &&
    !session.value.options.noPianoKeyboard,
)

function onCellClick(row: number, col: number) {
  activeCell.value = { row, col }
}

const puzzleTitle = computed(() => {
  if (session.value.phase !== 'playing') return ''
  return formatPuzzleTitle(session.value.puzzle.diagonalNote, session.value.puzzle.quality)
})

function abandon() {
  activeCell.value = null
  gameStore.resetSession()
}

function resultJingle(): 'perfect' | 'enharmonic' | 'wrong' | null {
  const s = session.value
  if (s.phase !== 'completed') return null
  const nonGiven = s.results.flatMap((row, r) =>
    row.filter((_, c) => !s.puzzle.cells[r]?.[c]?.isGiven),
  )
  if (nonGiven.some((r) => r === 'wrong')) return 'wrong'
  if (nonGiven.some((r) => r === 'enharmonic')) return 'enharmonic'
  return 'perfect'
}

function submit() {
  if (session.value.phase !== 'playing') return
  const { puzzle, answers } = session.value
  const hasEmpty = puzzle.cells.some((row, r) =>
    row.some((cell, c) => !cell.isGiven && !answers[r]?.[c]),
  )
  if (hasEmpty && !window.confirm('Some cells are still empty. Submit anyway?')) return
  gameStore.completeSession()
  const jingle = resultJingle()
  if (jingle) playJingle(jingle)
}
</script>

<template>
  <div v-if="session.phase === 'playing'" class="playing-view">
    <header class="playing-header">
      <span class="puzzle-label">{{ puzzleTitle }}</span>
      <button class="abandon-btn" @click="abandon">Abandon</button>
    </header>

    <main class="playing-main">
      <MatrixGrid
        :cells="displayCells"
        mode="input"
        :active-cell="activeCell ?? undefined"
        :show-degree-labels="showDegreeLabels"
        :degrees="session.puzzle.degrees"
        :guidance-level="guidanceLevel"
        :revealed-hints="revealedHints"
        :guided-answers="guidedAnswers"
        @cell-click="onCellClick"
        @reveal-hint="gameStore.revealHint"
      />

      <div class="progress-indicator">({{ perfectStreak }} / {{ SUB_STAGE_SESSION_SIZE }})</div>

      <PianoKeyboard v-if="showPiano" :active-note="activeCellNote" />

      <NotePicker v-model="activeCellNote" :disabled="activeCell === null" />

      <button class="submit-btn" @click="submit">Submit</button>
    </main>
  </div>
</template>

<style scoped>
.playing-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 1rem;
}

.playing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #ccc;
}

.puzzle-label {
  font-weight: 600;
}

.abandon-btn {
  padding: 0.3rem 0.9rem;
  font-size: 0.85rem;
  cursor: pointer;
  border: 1px solid #333;
  background: #333;
  color: #fff;
}

.abandon-btn:hover {
  background: #555;
  border-color: #555;
}

.playing-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 0;
}

.progress-indicator {
  font-size: 0.85rem;
  color: #666;
}

.submit-btn {
  padding: 0.6rem 2.5rem;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #333;
  background: #333;
  color: #fff;
}

.submit-btn:hover {
  background: #555;
  border-color: #555;
}
</style>
