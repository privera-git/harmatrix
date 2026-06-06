<script setup lang="ts">
import { computed } from 'vue'
import { parseNote } from '@/music/note'
import type { NoteLetter, Accidental } from '@/music/note'

const model = defineModel<string | null>()

defineProps<{
  disabled: boolean
}>()

const LETTERS: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const ACCIDENTALS: { value: Accidental; label: string }[] = [
  { value: 'bb', label: 'bb' },
  { value: 'b', label: 'b' },
  { value: '', label: '♮' },
  { value: '#', label: '#' },
  { value: '##', label: '##' },
]

const parsed = computed(() => (model.value ? parseNote(model.value) : null))

const activeLetter = computed(() => parsed.value?.letter ?? null)
const activeAccidental = computed<Accidental | null>(() => parsed.value?.accidental ?? null)

function selectLetter(letter: NoteLetter) {
  if (activeAccidental.value !== null && activeAccidental.value !== '') {
    const candidate = letter + activeAccidental.value
    if (parseNote(candidate)) {
      model.value = candidate
      return
    }
  }
  model.value = letter
}

function selectAccidental(acc: Accidental) {
  if (activeLetter.value === null) return
  const candidate = activeLetter.value + acc
  if (parseNote(candidate)) {
    model.value = candidate
  }
}
</script>

<template>
  <div class="note-picker" :class="{ disabled }">
    <div class="picker-row letters-row">
      <button
        v-for="letter in LETTERS"
        :key="letter"
        class="picker-btn"
        :class="{ active: activeLetter === letter }"
        :disabled="disabled"
        @click="selectLetter(letter)"
      >
        {{ letter }}
      </button>
    </div>
    <div class="picker-row accidentals-row">
      <button
        v-for="acc in ACCIDENTALS"
        :key="acc.value"
        class="picker-btn"
        :class="{ active: activeAccidental === acc.value }"
        :disabled="disabled || activeLetter === null"
        @click="selectAccidental(acc.value)"
      >
        {{ acc.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.note-picker {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.note-picker.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.picker-row {
  display: flex;
  gap: 4px;
}

.picker-btn {
  min-width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
}

.picker-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.picker-btn.active {
  background: #0066cc;
  color: #fff;
  border-color: #0066cc;
}
</style>
