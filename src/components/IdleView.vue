<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import { useProgressStore } from '@/stores/progress'
import { CURRICULUM, SUB_STAGE_SESSION_SIZE } from '@/config/game'

const gameStore = useGameStore()
const { state } = storeToRefs(useProgressStore())

const noDegreeLabels = ref(false)
const noPianoKeyboard = ref(false)

const learning = computed(() => state.value.learning)
const puzzlesPlayed = computed(() => state.value.currentSubStageSession.puzzlesPlayed)
const streak = computed(() => state.value.practiceStreak)

const quality = computed(() => {
  const stageQualities = CURRICULUM[learning.value.stage - 1]
  return stageQualities?.[learning.value.subStage - 1] ?? 'major'
})

function start() {
  gameStore.startPuzzle('C', quality.value, {
    noDegreeLabels: noDegreeLabels.value,
    noPianoKeyboard: noPianoKeyboard.value,
  })
}
</script>

<template>
  <div class="idle-view">
    <header class="idle-header">
      <h1>HARMATRIX</h1>
    </header>

    <main class="idle-main">
      <div class="learning-position">
        Stage {{ learning.stage }} · Sub-stage {{ learning.subStage }} ({{ puzzlesPlayed }} /
        {{ SUB_STAGE_SESSION_SIZE }})
      </div>
      <div class="quality-label">Quality: {{ quality }}</div>

      <section class="difficulty-section">
        <div class="difficulty-title">Difficulty</div>
        <label class="toggle-label">
          <input v-model="noDegreeLabels" type="checkbox" />
          Hide degree labels
        </label>
        <label class="toggle-label">
          <input v-model="noPianoKeyboard" type="checkbox" />
          Hide piano keyboard
        </label>
      </section>

      <button class="start-btn" @click="start">Start</button>
    </main>

    <footer class="idle-footer">Streak: {{ streak }} day{{ streak !== 1 ? 's' : '' }}</footer>
  </div>
</template>

<style scoped>
.idle-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 1rem;
}

.idle-header {
  padding: 1.5rem 0 1rem;
  border-bottom: 1px solid #ccc;
}

.idle-header h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
}

.idle-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem 0;
}

.learning-position {
  font-size: 0.95rem;
  color: #555;
}

.quality-label {
  font-size: 1rem;
  font-weight: 600;
  text-transform: capitalize;
}

.difficulty-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.difficulty-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
  margin-bottom: 0.25rem;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  user-select: none;
}

.start-btn {
  align-self: center;
  padding: 0.6rem 2.5rem;
  font-size: 1rem;
  cursor: pointer;
  border: 1px solid #333;
  background: #333;
  color: #fff;
}

.start-btn:hover {
  background: #555;
  border-color: #555;
}

.idle-footer {
  padding: 1rem 0;
  border-top: 1px solid #ccc;
  font-size: 0.85rem;
  color: #666;
}
</style>
