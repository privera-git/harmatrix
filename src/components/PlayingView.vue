<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import { useProgressStore } from '@/stores/progress'
import { FEATURES } from '@/config/features'
import { formatPuzzleTitle } from '@/music/display'
import { CHORD_CATALOG } from '@/music/data/chords'
import type { ChordQuality } from '@/music/data/chords'
import { SCALE_CATALOG } from '@/music/data/scales'
import type { ScaleMode } from '@/music/data/scales'
import { INTERVAL_CATALOG } from '@/music/data/intervals'
import type { IntervalGroup } from '@/music/data/intervals'
import { Interval } from '@/music/tonal'
import MatrixGrid from '@/components/MatrixGrid.vue'
import SubStageProgressBar from '@/components/SubStageProgressBar.vue'
import NotePicker from '@/components/NotePicker.vue'
import PianoKeyboard from '@/components/PianoKeyboard.vue'
import TheoryModal from '@/components/TheoryModal.vue'
import { useAudio } from '@/composables/useAudio'
import type { MatrixCell } from '@/music/matrix'

const { playJingle } = useAudio()

const gameStore = useGameStore()
const progressStore = useProgressStore()
const { session } = storeToRefs(gameStore)

const progressRatio = computed(() => {
  if (session.value.phase !== 'playing' || session.value.isFreePlay) return 0
  return progressStore.progressRatio(session.value.puzzle.quality)
})
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
const showTheoryModal = ref(false)

const canRevealHint = computed(() => {
  if (guidanceLevel.value !== 'hint') return false
  if (!activeCell.value) return false
  const { row, col } = activeCell.value
  if (displayCells.value[row]?.[col]?.isGiven) return false
  return !revealedHints.value.includes(`${row},${col}`)
})

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

const puzzleIntervalSemitones = computed<number[]>(() => {
  if (session.value.phase !== 'playing') return []
  const q = session.value.puzzle.quality
  const entry =
    q in CHORD_CATALOG ? CHORD_CATALOG[q as ChordQuality] :
    q in SCALE_CATALOG ? SCALE_CATALOG[q as ScaleMode] :
    q in INTERVAL_CATALOG ? INTERVAL_CATALOG[q as IntervalGroup] : null
  return entry?.intervals.map((iv) => Interval.semitones(iv) ?? 0) ?? []
})

const puzzleTitle = computed(() => {
  if (session.value.phase !== 'playing') return ''
  return formatPuzzleTitle(session.value.puzzle.diagonalNote, session.value.puzzle.quality)
})

function revealActiveHint() {
  if (!activeCell.value) return
  gameStore.revealHint(activeCell.value.row, activeCell.value.col)
}

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
      <div class="playing-header__top">
        <span class="puzzle-label">{{ puzzleTitle }}</span>
        <button
          v-if="FEATURES.THEORY_MODAL"
          class="info-btn"
          @click="showTheoryModal = true"
        >ℹ</button>
        <button class="abandon-btn" @click="abandon">Abandon</button>
      </div>
      <SubStageProgressBar v-if="!session.isFreePlay" :ratio="progressRatio" />
    </header>
    <TheoryModal
      v-if="FEATURES.THEORY_MODAL && showTheoryModal"
      :quality="session.puzzle.quality"
      @close="showTheoryModal = false"
    />

    <main class="playing-main">
      <MatrixGrid
        :cells="displayCells"
        mode="input"
        :active-cell="activeCell ?? undefined"
        :show-degree-labels="showDegreeLabels"
        :degrees="session.puzzle.degrees"
        :interval-semitones="puzzleIntervalSemitones"
        :guidance-level="guidanceLevel"
        :revealed-hints="revealedHints"
        :guided-answers="guidedAnswers"
        @cell-click="onCellClick"
        @reveal-hint="gameStore.revealHint"
      />

      <div v-if="guidanceLevel === 'hint'" class="progress-indicator">
        <button
          class="hint-action-btn"
          :disabled="!canRevealHint"
          @click="revealActiveHint"
        >Hint</button>
      </div>

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
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
  border-bottom: 1px solid #ccc;
}

.playing-header__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.puzzle-label {
  font-weight: 600;
}

.info-btn {
  background: transparent;
  border: 1px solid #aaa;
  color: #888;
  font-size: 0.75rem;
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  flex-shrink: 0;
  font-style: normal;
}

.info-btn:hover {
  border-color: #0066cc;
  color: #0066cc;
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
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: #666;
}

.hint-action-btn {
  background: transparent;
  border: 1px solid #aaa;
  color: #888;
  font-size: 0.8rem;
  padding: 0.2rem 0.75rem;
  cursor: pointer;
}

.hint-action-btn:not(:disabled):hover {
  border-color: #0066cc;
  color: #0066cc;
}

.hint-action-btn:disabled {
  opacity: 0.35;
  cursor: default;
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
