<script setup lang="ts">
import { computed } from 'vue'
import { parseNote } from '@/music/note'
import { useAudio } from '@/composables/useAudio'

const { playNote } = useAudio()

const props = defineProps<{
  activeNote?: string | null
}>()

const activeChroma = computed<number | null>(() => {
  if (!props.activeNote) return null
  return parseNote(props.activeNote)?.chroma ?? null
})

const WHITE_KEY_WIDTH = 36

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

// leftPx = (n+1) * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH * 0.6, where n = index of white key to the left
const BLACK_KEYS = [
  { note: 'C#', leftPx: 23 },
  { note: 'D#', leftPx: 59 },
  { note: 'F#', leftPx: 131 },
  { note: 'G#', leftPx: 167 },
  { note: 'A#', leftPx: 203 },
] as const
</script>

<template>
  <div class="piano-keyboard">
    <div class="keys-container">
      <div
        v-for="note in WHITE_NOTES"
        :key="note"
        class="key white-key"
        :class="{ active: parseNote(note)?.chroma === activeChroma }"
        @click="playNote(note)"
      >
        <span class="white-key-label">{{ note }}</span>
      </div>
      <div
        v-for="key in BLACK_KEYS"
        :key="key.note"
        class="key black-key"
        :class="{ active: parseNote(key.note)?.chroma === activeChroma }"
        :style="{ left: key.leftPx + 'px' }"
        @click="playNote(key.note)"
      />
    </div>
  </div>
</template>

<style scoped>
.piano-keyboard {
  user-select: none;
}

.keys-container {
  position: relative;
  display: flex;
}

.key {
  border-radius: 0 0 3px 3px;
}

.white-key {
  width: v-bind('WHITE_KEY_WIDTH + "px"');
  height: 80px;
  border: 1px solid #aaa;
  border-right: 2px solid #ccc;
  background: #fff;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
}

.white-key.active {
  background: #0066cc;
}

.white-key-label {
  font-size: 0.65rem;
  color: #666;
}

.white-key.active .white-key-label {
  color: #fff;
}

.black-key {
  position: absolute;
  width: 22px;
  height: 50px;
  background: #222;
  top: 0;
  z-index: 1;
}

.black-key.active {
  background: #0066cc;
}
</style>
