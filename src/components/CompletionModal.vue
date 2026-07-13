<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { formatQualityLabel } from '@/music/display'
import { useAudio } from '@/composables/useAudio'
import type { ChordQuality } from '@/music/data/chords'
import type { ScaleMode } from '@/music/data/scales'
import type { IntervalGroup } from '@/music/data/intervals'

type Quality = ChordQuality | ScaleMode | IntervalGroup

const props = defineProps<{
  completedQuality: Quality
  nextQuality: Quality | null
  showFreePlayUnlock: boolean
  score: number
  breakdown: { correct: number; enharmonic: number; wrong: number }
  multiplier: number
}>()

const emit = defineEmits<{ continue: []; stop: [] }>()

const backdropRef = ref<HTMLElement | null>(null)

const { playJingle } = useAudio()

onMounted(() => {
  backdropRef.value?.focus()
  playJingle('fanfare')
})

const CONFETTI_COUNT = 14
const confettiPieces = Array.from({ length: CONFETTI_COUNT }, (_, i) => i)
</script>

<template>
  <div ref="backdropRef" class="completion-backdrop" tabindex="0">
    <div class="completion-modal">
      <div class="confetti" aria-hidden="true">
        <span v-for="i in confettiPieces" :key="i" class="confetti-piece" :style="{ '--i': i }" />
      </div>

      <h2 class="completion-title">Congratulations!</h2>
      <p class="completion-summary">
        You've completed {{ formatQualityLabel(props.completedQuality) }}.
      </p>

      <div class="completion-stats">
        <div class="stats-total">Score: {{ props.score }}</div>
        <div class="stats-breakdown">
          <span class="breakdown-correct">✓ {{ props.breakdown.correct }}</span>
          <span class="breakdown-enharmonic">≈ {{ props.breakdown.enharmonic }}</span>
          <span class="breakdown-wrong">✗ {{ props.breakdown.wrong }}</span>
          <span>× {{ props.multiplier }}</span>
        </div>
      </div>

      <p v-if="props.nextQuality" class="completion-unlock">
        {{ formatQualityLabel(props.nextQuality) }} is now available to learn.
      </p>
      <p v-else class="completion-unlock">
        You've completed the entire curriculum!
      </p>

      <p v-if="props.showFreePlayUnlock" class="completion-unlock">
        You can now play {{ formatQualityLabel(props.completedQuality) }} puzzles in Free Play.
      </p>

      <div class="completion-actions">
        <button class="action-btn" @click="emit('continue')">Continue</button>
        <button class="action-btn action-btn--secondary" @click="emit('stop')">Stop here</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.completion-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  outline: none;
}

.completion-modal {
  position: relative;
  background: #fff;
  width: 100%;
  max-width: 420px;
  margin: 0 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 8px;
  overflow: hidden;
}

.completion-title {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
}

.completion-summary {
  margin: 0;
  text-align: center;
  font-size: 0.95rem;
  color: #444;
}

.completion-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.stats-total {
  font-size: 1.05rem;
  font-weight: 600;
  text-align: center;
}

.stats-breakdown {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #555;
}

.breakdown-correct {
  color: #1a7a3a;
}

.breakdown-enharmonic {
  color: #b35c00;
}

.breakdown-wrong {
  color: #a02020;
}

.completion-unlock {
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
  color: #333;
}

.completion-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
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

.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  top: -10%;
  left: calc(var(--i) * 7.2%);
  width: 0.5rem;
  height: 0.9rem;
  background: hsl(calc(var(--i) * 26deg), 80%, 55%);
  animation: confetti-fall 1.6s ease-in calc(var(--i) * 0.06s) 1 both;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(320px) rotate(360deg);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .confetti-piece {
    animation: none;
    opacity: 0;
  }
}

@media (prefers-color-scheme: dark) {
  .completion-modal {
    background: #1e1e1e;
  }

  .completion-summary {
    color: #ccc;
  }

  .completion-stats {
    border-color: #333;
  }

  .stats-breakdown {
    color: #aaa;
  }

  .breakdown-correct {
    color: #2ecc71;
  }

  .breakdown-enharmonic {
    color: #f39c12;
  }

  .breakdown-wrong {
    color: #e74c3c;
  }

  .completion-unlock {
    color: #ccc;
  }

  .action-btn--secondary {
    color: #ccc;
  }

  .action-btn--secondary:hover {
    background: #2a2a2a;
  }
}
</style>
