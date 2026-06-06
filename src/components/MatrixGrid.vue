<script setup lang="ts">
import { computed } from 'vue'
import type { MatrixCell } from '@/music/matrix'
import type { AnswerResult } from '@/music/scoring'

const props = defineProps<{
  cells: MatrixCell[][]
  mode: 'input' | 'results'
  results?: AnswerResult[][]
  activeCell?: { row: number; col: number }
  showDegreeLabels: boolean
}>()

const emit = defineEmits<{
  'cell-click': [row: number, col: number]
}>()

// Row 0 at bottom, row N-1 at top — diagonal ascends bottom-left to top-right
const displayRows = computed(() => [...props.cells].reverse())

const RESULT_SYMBOL: Record<AnswerResult, string> = {
  correct: '✓',
  enharmonic: '≈',
  wrong: '✗',
}

function resultFor(cell: MatrixCell): AnswerResult | undefined {
  return props.results?.[cell.row]?.[cell.col]
}

function isActive(cell: MatrixCell): boolean {
  return props.activeCell?.row === cell.row && props.activeCell?.col === cell.col
}

function handleClick(cell: MatrixCell) {
  if (props.mode !== 'input' || cell.isGiven) return
  emit('cell-click', cell.row, cell.col)
}
</script>

<template>
  <div class="matrix-grid">
    <div v-for="row in displayRows" :key="row[0]?.row ?? 0" class="matrix-row">
      <span v-if="showDegreeLabels" class="degree-label">{{ (row[0]?.row ?? 0) + 1 }}</span>
      <div
        v-for="cell in row"
        :key="cell.col"
        class="matrix-cell"
        :class="{
          given: cell.isGiven,
          active: mode === 'input' && isActive(cell),
          clickable: mode === 'input' && !cell.isGiven,
        }"
        @click="handleClick(cell)"
      >
        <span class="cell-note">{{ cell.note }}</span>
        <span v-if="mode === 'results' && !cell.isGiven && resultFor(cell)" class="cell-result">{{
          RESULT_SYMBOL[resultFor(cell) ?? 'wrong']
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matrix-grid {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
}

.matrix-row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.degree-label {
  width: 1.5rem;
  text-align: right;
  font-size: 0.75rem;
  color: #888;
}

.matrix-cell {
  width: 3rem;
  height: 3rem;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 0.9rem;
  user-select: none;
}

.matrix-cell.clickable {
  cursor: pointer;
}

.matrix-cell.given {
  background: #f0f0f0;
}

.matrix-cell.active {
  outline: 2px solid #0066cc;
}

.cell-result {
  font-size: 0.7rem;
}
</style>
