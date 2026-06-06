<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import { useProgressStore } from '@/stores/progress'
import { sessionMultiplier } from '@/music/scoring'
import { formatPuzzleTitle } from '@/music/display'
import MatrixGrid from '@/components/MatrixGrid.vue'

const gameStore = useGameStore()
const progressStore = useProgressStore()
const { session } = storeToRefs(gameStore)

const breakdown = computed(() => {
  if (session.value.phase !== 'completed') return { correct: 0, enharmonic: 0, wrong: 0 }
  const { puzzle, results } = session.value
  let correct = 0
  let enharmonic = 0
  let wrong = 0
  puzzle.cells.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell.isGiven) return
      const result = results[r]?.[c]
      if (result === 'correct') correct++
      else if (result === 'enharmonic') enharmonic++
      else wrong++
    })
  })
  return { correct, enharmonic, wrong }
})

const puzzleTitle = computed(() => {
  if (session.value.phase !== 'completed') return ''
  return formatPuzzleTitle(session.value.puzzle.diagonalNote, session.value.puzzle.quality)
})

const multiplier = computed(() => {
  if (session.value.phase !== 'completed') return 1
  return sessionMultiplier(session.value.options)
})

onMounted(() => {
  if (session.value.phase !== 'completed') return
  const { puzzle, results } = session.value
  const flatResults = puzzle.cells.flatMap((row, r) =>
    row.flatMap((cell, c) => (cell.isGiven ? [] : [results[r]?.[c] ?? 'wrong'])),
  )
  progressStore.recordSessionResults(puzzle.quality, flatResults)
  progressStore.updateStreak()
})

function playAgain() {
  if (session.value.phase !== 'completed') return
  const { puzzle, options } = session.value
  gameStore.startPuzzle(puzzle.diagonalNote, puzzle.quality, options)
}

function backToMenu() {
  gameStore.resetSession()
}
</script>

<template>
  <div v-if="session.phase === 'completed'" class="completed-view">
    <header class="completed-header">
      <span class="puzzle-label">{{ puzzleTitle }}</span>
    </header>

    <main class="completed-main">
      <div class="score-section">
        <div class="score-total">Score: {{ session.score }}</div>
        <div class="score-breakdown">
          <span>✓ {{ breakdown.correct }}</span>
          <span>≈ {{ breakdown.enharmonic }}</span>
          <span>✗ {{ breakdown.wrong }}</span>
          <span>× {{ multiplier }}</span>
        </div>
      </div>

      <MatrixGrid
        :cells="session.puzzle.cells"
        mode="results"
        :results="session.results"
        :show-degree-labels="true"
      />

      <div class="action-row">
        <button class="action-btn" @click="playAgain">Play Again</button>
        <button class="action-btn action-btn--secondary" @click="backToMenu">Back to Menu</button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.completed-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 1rem;
}

.completed-header {
  padding: 1rem 0;
  border-bottom: 1px solid #ccc;
}

.puzzle-label {
  font-weight: 600;
}

.completed-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 0;
}

.score-section {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.score-total {
  font-size: 1.1rem;
  font-weight: 600;
}

.score-breakdown {
  display: flex;
  gap: 1rem;
  font-size: 0.95rem;
  color: #555;
}

.action-row {
  display: flex;
  gap: 1rem;
}

.action-btn {
  padding: 0.6rem 1.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  border: 1px solid #333;
  background: #333;
  color: #fff;
}

.action-btn:hover {
  background: #555;
  border-color: #555;
}

.action-btn--secondary {
  background: transparent;
  color: #333;
}

.action-btn--secondary:hover {
  background: #f0f0f0;
}
</style>
