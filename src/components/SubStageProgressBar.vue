<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ ratio: number }>()

const percent = computed(() => `${Math.min(Math.max(props.ratio, 0), 1) * 100}%`)
</script>

<template>
  <div class="substage-progress-bar" role="progressbar" :aria-valuenow="Math.round(ratio * 100)">
    <div class="substage-progress-bar__fill" :style="{ width: percent }" />
  </div>
</template>

<style scoped>
.substage-progress-bar {
  width: 100%;
  height: 0.4rem;
  background: #eee;
  border-radius: 999px;
  overflow: hidden;
}

.substage-progress-bar__fill {
  height: 100%;
  background: #1a7a3a;
  border-radius: 999px;
  transition: width 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .substage-progress-bar {
    background: #2a2a2a;
  }

  .substage-progress-bar__fill {
    background: #2ecc71;
  }
}
</style>
