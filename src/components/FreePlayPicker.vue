<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { STAGE_NAMES } from '@/config/game'
import { formatQualityLabel, isChordSymbolQuality } from '@/music/display'
import type { FreePlayStageAccess } from '@/stores/progress'
import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'
import type { IntervalGroup } from '@/music/data/intervals'

const props = defineProps<{
  freePlayAccess: FreePlayStageAccess[]
  initialStage: number | null
}>()

const emit = defineEmits<{
  play: [quality: ChordQuality | ScaleMode | IntervalGroup]
  stageOpen: [stageIndex: number]
}>()

const openStageIndex = ref<number | null>(null)

onMounted(() => {
  if (
    props.initialStage !== null &&
    props.freePlayAccess[props.initialStage]?.accessible
  ) {
    openStageIndex.value = props.initialStage
  } else {
    const first = props.freePlayAccess.findIndex((s) => s.accessible)
    openStageIndex.value = first >= 0 ? first : null
  }
})

function toggleStage(index: number): void {
  if (!props.freePlayAccess[index]?.accessible) return
  if (openStageIndex.value === index) {
    openStageIndex.value = null
  } else {
    openStageIndex.value = index
    emit('stageOpen', index)
  }
}

function selectSubStage(quality: ChordQuality | ScaleMode | IntervalGroup, accessible: boolean): void {
  if (!accessible) return
  emit('play', quality)
}

function subStageLabel(quality: ChordQuality | ScaleMode | IntervalGroup): string {
  const label = formatQualityLabel(quality)
  return isChordSymbolQuality(quality) ? label : label.replace(/\b\w/g, (c) => c.toUpperCase())
}
</script>

<template>
  <div class="free-play-picker">
    <div
      v-for="(stage, stageIndex) in freePlayAccess"
      :key="stageIndex"
      class="stage-item"
      :class="{ 'stage-item--locked': !stage.accessible }"
    >
      <button
        class="stage-header"
        :class="{ 'stage-header--open': openStageIndex === stageIndex }"
        :disabled="!stage.accessible"
        @click="toggleStage(stageIndex)"
      >
        <span class="stage-name">{{ STAGE_NAMES[stageIndex] }}</span>
        <span v-if="stage.accessible" class="stage-chevron">
          {{ openStageIndex === stageIndex ? '▲' : '▼' }}
        </span>
        <span v-else class="stage-lock">🔒</span>
      </button>

      <div v-if="openStageIndex === stageIndex" class="sub-stages">
        <button
          v-for="(subStage, ssIndex) in stage.subStages"
          :key="ssIndex"
          class="sub-stage-btn"
          :class="{ 'sub-stage-btn--locked': !subStage.accessible }"
          :disabled="!subStage.accessible"
          @click="selectSubStage(subStage.quality, subStage.accessible)"
        >
          {{ subStageLabel(subStage.quality) }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.free-play-picker {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-self: stretch;
}

.stage-item {
  border: 1px solid #ddd;
}

.stage-item--locked {
  opacity: 0.5;
}

.stage-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
}

.stage-header:disabled {
  cursor: default;
}

.stage-header--open {
  background: #f5f5f5;
}

.stage-name {
  flex: 1;
}

.stage-chevron,
.stage-lock {
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.sub-stages {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #eee;
}

.sub-stage-btn {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
}

.sub-stage-btn:last-child {
  border-bottom: none;
}

.sub-stage-btn:hover:not(:disabled) {
  background: #f9f9f9;
}

.sub-stage-btn--locked {
  opacity: 0.45;
  cursor: default;
}

@media (prefers-color-scheme: dark) {
  .stage-item {
    border-color: #444;
  }

  .stage-header {
    color: #ccc;
  }

  .stage-header--open {
    background: #2a2a2a;
  }

  .sub-stages {
    border-top-color: #333;
  }

  .sub-stage-btn {
    color: #ccc;
    border-bottom-color: #333;
  }

  .sub-stage-btn:hover:not(:disabled) {
    background: #252525;
  }
}
</style>
