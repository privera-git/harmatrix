<script setup lang="ts">
const WHITE_KEY_WIDTH = 36
const BLACK_KEY_WIDTH = 22

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

// offset in white-key-width units; left px = offset * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2
const BLACK_KEYS = [
  { note: 'C#', offset: 0.7 },
  { note: 'D#', offset: 1.7 },
  { note: 'F#', offset: 3.7 },
  { note: 'G#', offset: 4.7 },
  { note: 'A#', offset: 5.7 },
] as const

function blackKeyLeft(offset: number): string {
  return `${offset * WHITE_KEY_WIDTH - BLACK_KEY_WIDTH / 2}px`
}
</script>

<template>
  <div class="piano-keyboard">
    <div class="keys-container">
      <div v-for="note in WHITE_NOTES" :key="note" class="key white-key">
        <span class="white-key-label">{{ note }}</span>
      </div>
      <div
        v-for="key in BLACK_KEYS"
        :key="key.note"
        class="key black-key"
        :style="{ left: blackKeyLeft(key.offset) }"
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
  gap: 2px;
}

.key {
  border-radius: 0 0 3px 3px;
}

.white-key {
  width: v-bind('WHITE_KEY_WIDTH + "px"');
  height: 80px;
  border: 1px solid #aaa;
  background: #fff;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
}

.white-key-label {
  font-size: 0.65rem;
  color: #666;
}

.black-key {
  position: absolute;
  width: v-bind('BLACK_KEY_WIDTH + "px"');
  height: 50px;
  background: #222;
  top: 0;
  z-index: 1;
}
</style>
