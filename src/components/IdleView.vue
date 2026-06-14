<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import { useProgressStore } from '@/stores/progress'
import { CURRICULUM, SUB_STAGE_SESSION_SIZE, STAGE_NAMES, INTRO_STAGE } from '@/config/game'
import FreePlayPicker from '@/components/FreePlayPicker.vue'
import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'
import type { IntervalGroup } from '@/music/data/intervals'

const gameStore = useGameStore()
const progressStore = useProgressStore()
const { state, freePlayAccess } = storeToRefs(progressStore)

const noDegreeLabels = ref(false)
const noPianoKeyboard = ref(false)

const learning = computed(() => state.value.learning)
const perfectStreak = computed(() => state.value.currentSubStageSession.perfectStreak)
const stageName = computed(() => STAGE_NAMES[learning.value.stage - 1] ?? `Stage ${learning.value.stage}`)
const streak = computed(() => state.value.practiceStreak)
const idleMode = computed(() => state.value.idleMode)
const isIntroStage = computed(() => learning.value.stage === INTRO_STAGE)
const isTriadsStage = computed(
  () => learning.value.stage === INTRO_STAGE + 1 && !state.value.unlockedContent.includes('seconds'),
)

const quality = computed(() => {
  const stageQualities = CURRICULUM[learning.value.stage - 1]
  return stageQualities?.[learning.value.subStage - 1] ?? 'major'
})

function setMode(mode: 'learn' | 'freePlay'): void {
  progressStore.setIdleMode(mode)
}

function start() {
  const opts = { noDegreeLabels: noDegreeLabels.value, noPianoKeyboard: noPianoKeyboard.value }
  gameStore.startPuzzle(
    progressStore.nextDiagonalNote(quality.value, false),
    quality.value,
    opts,
    false,
    progressStore.guidanceLevelFor(quality.value),
  )
}

function skipToTriads(): void {
  progressStore.skipToTriads()
}

function backToIntervals(): void {
  progressStore.jumpToPosition(1, 1)
}

function onFreePlaySelect(selectedQuality: ChordQuality | ScaleMode | IntervalGroup): void {
  const opts = { noDegreeLabels: noDegreeLabels.value, noPianoKeyboard: noPianoKeyboard.value }
  gameStore.startPuzzle(
    progressStore.nextDiagonalNote(selectedQuality, true),
    selectedQuality,
    opts,
    true,
    progressStore.guidanceLevelFor(selectedQuality),
  )
}

function onStageOpen(stageIndex: number): void {
  progressStore.setLastFreePlayStage(stageIndex)
}
</script>

<template>
  <div class="idle-view">
    <header class="idle-header">
      <h1>HARMATRIX</h1>
      <div class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ 'mode-btn--active': idleMode === 'learn' }"
          @click="setMode('learn')"
        >
          Learn
        </button>
        <button
          class="mode-btn"
          :class="{ 'mode-btn--active': idleMode === 'freePlay' }"
          @click="setMode('freePlay')"
        >
          Free Play
        </button>
      </div>
    </header>

    <main class="idle-main">
      <template v-if="idleMode === 'learn'">
        <div class="learning-position">{{ stageName }}</div>
        <div class="quality-label">
          <span>Quality: {{ quality }}</span>
          <span class="quality-progress">({{ perfectStreak }} / {{ SUB_STAGE_SESSION_SIZE }})</span>
        </div>
      </template>

      <FreePlayPicker
        v-if="idleMode === 'freePlay'"
        :free-play-access="freePlayAccess"
        :initial-stage="state.lastFreePlayStage"
        @play="onFreePlaySelect"
        @stage-open="onStageOpen"
      />

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

      <div v-if="idleMode === 'learn'" class="learn-actions">
        <button class="start-btn" @click="start">Start</button>
        <button v-if="isIntroStage" class="skip-btn" @click="skipToTriads">
          Skip to Triads →
        </button>
        <button v-if="isTriadsStage" class="skip-btn" @click="backToIntervals">
          ← Back to Interval Basics
        </button>
      </div>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.idle-header h1 {
  margin: 0;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
}

.mode-toggle {
  display: flex;
  gap: 0;
  border: 1px solid #333;
}

.mode-btn {
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  border: none;
  background: transparent;
  color: #333;
}

.mode-btn--active {
  background: #333;
  color: #fff;
}

.mode-btn:hover:not(.mode-btn--active) {
  background: #f0f0f0;
}

@media (prefers-color-scheme: dark) {
  .mode-toggle {
    border-color: #ccc;
  }

  .mode-btn {
    color: #ccc;
  }

  .mode-btn--active {
    background: #ccc;
    color: #111;
  }

  .mode-btn:hover:not(.mode-btn--active) {
    background: #2a2a2a;
  }
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
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-size: 1rem;
  font-weight: 600;
  text-transform: capitalize;
}

.quality-progress {
  font-size: 0.85rem;
  font-weight: 400;
  color: #666;
  text-transform: none;
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

.learn-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
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

.skip-btn {
  background: transparent;
  border: none;
  color: #888;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0;
}

.skip-btn:hover {
  color: #333;
}

@media (prefers-color-scheme: dark) {
  .skip-btn:hover {
    color: #ccc;
  }
}

.idle-footer {
  padding: 1rem 0;
  border-top: 1px solid #ccc;
  font-size: 0.85rem;
  color: #666;
}
</style>
