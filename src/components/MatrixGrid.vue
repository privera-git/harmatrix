<script setup lang="ts">
import { computed } from 'vue'
import type { MatrixCell } from '@/music/matrix'
import type { AnswerResult } from '@/music/scoring'
import { useAudio } from '@/composables/useAudio'
import { Note } from '@/music/tonal'

const { playNote } = useAudio()

const props = defineProps<{
  cells: MatrixCell[][]
  mode: 'input' | 'results'
  results?: AnswerResult[][]
  correctCells?: MatrixCell[][]
  activeCell?: { row: number; col: number }
  showDegreeLabels: boolean
  degrees?: string[]
  guidanceLevel?: 'full' | 'hint' | 'none'
  revealedHints?: string[]
  guidedAnswers?: string[][]
  intervalSemitones?: number[]
}>()

const emit = defineEmits<{
  'cell-click': [row: number, col: number]
  'reveal-hint': [row: number, col: number]
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

function correctNoteFor(cell: MatrixCell): string | undefined {
  return props.correctCells?.[cell.row]?.[cell.col]?.note
}

function tooltipFor(cell: MatrixCell): string | undefined {
  if (props.mode !== 'results' || cell.isGiven) return undefined
  const result = resultFor(cell)
  if (result !== 'wrong' && result !== 'enharmonic') return undefined
  const note = correctNoteFor(cell)
  return note ? `Expected: ${note}` : undefined
}

function isActive(cell: MatrixCell): boolean {
  return props.activeCell?.row === cell.row && props.activeCell?.col === cell.col
}

function noteForColumnPlayback(cell: MatrixCell): string {
  if (!cell.note || !props.intervalSemitones) return cell.note
  const givenRow = cell.col // diagonal: given is always at row === col
  const givenCell = props.cells[givenRow]?.[cell.col]
  if (!givenCell?.note) return cell.note
  const givenMidi = Note.midi(`${givenCell.note}4`) ?? 60
  const semDiff = (props.intervalSemitones[cell.row] ?? 0) - (props.intervalSemitones[givenRow] ?? 0)
  const targetMidi = givenMidi + semDiff
  const chroma = Note.get(cell.note).chroma
  const octave = Math.round((targetMidi - chroma) / 12) - 1
  return `${cell.note}${octave}`
}

function handleClick(cell: MatrixCell) {
  if (props.mode !== 'input') return
  if (cell.isGiven) {
    if (cell.note) playNote(noteForColumnPlayback(cell))
    return
  }
  emit('cell-click', cell.row, cell.col)
  if (cell.note) playNote(noteForColumnPlayback(cell))
}

function ghostNoteFor(cell: MatrixCell): string | undefined {
  if (props.mode !== 'input' || cell.isGiven || cell.note !== '') return undefined
  if (props.guidanceLevel === 'full') return props.guidedAnswers?.[cell.row]?.[cell.col]
  if (props.guidanceLevel === 'hint') {
    const key = `${cell.row},${cell.col}`
    if (props.revealedHints?.includes(key)) return props.guidedAnswers?.[cell.row]?.[cell.col]
  }
  return undefined
}

</script>

<template>
  <div class="matrix-grid">
    <div v-for="row in displayRows" :key="row[0]?.row ?? 0" class="matrix-row">
      <span v-if="showDegreeLabels" class="degree-label">{{
        degrees?.[row[0]?.row ?? 0] ?? String((row[0]?.row ?? 0) + 1)
      }}</span>
      <div
        v-for="cell in row"
        :key="cell.col"
        class="matrix-cell"
        :class="{
          given: cell.isGiven,
          active: mode === 'input' && isActive(cell),
          clickable: mode === 'input' && !cell.isGiven,
          'result-correct': mode === 'results' && !cell.isGiven && resultFor(cell) === 'correct',
          'result-enharmonic': mode === 'results' && !cell.isGiven && resultFor(cell) === 'enharmonic',
          'result-wrong': mode === 'results' && !cell.isGiven && resultFor(cell) === 'wrong',
        }"
        :data-tooltip="tooltipFor(cell)"
        :tabindex="tooltipFor(cell) ? 0 : undefined"
        @click="handleClick(cell)"
      >
        <span class="cell-note">{{ cell.note || (ghostNoteFor(cell) ?? '') }}</span>
        <span
          v-if="!cell.note && ghostNoteFor(cell)"
          class="cell-ghost-indicator"
        />
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
  position: relative;
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

.matrix-cell[data-tooltip]:hover::after,
.matrix-cell[data-tooltip]:focus::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 3px 7px;
  border-radius: 3px;
  font-size: 0.7rem;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  outline: none;
}

.matrix-cell.clickable {
  cursor: pointer;
}

.matrix-cell.given {
  background: repeating-linear-gradient(-45deg, #e8e8e8, #e8e8e8 4px, #f5f5f5 4px, #f5f5f5 8px);
  color: #333;
}

.matrix-cell.active {
  outline: 2px solid #0066cc;
}

.cell-result {
  font-size: 0.7rem;
}

.cell-ghost-indicator {
  display: none;
}

.matrix-cell:has(.cell-ghost-indicator) .cell-note {
  opacity: 0.35;
  font-style: italic;
}

.result-correct {
  background-color: rgba(0, 140, 60, 0.18);
}

.result-enharmonic {
  background-color: rgba(210, 100, 0, 0.18);
}

.result-wrong {
  background-color: rgba(180, 0, 0, 0.18);
}

@media (prefers-color-scheme: dark) {
  .result-correct {
    background-color: rgba(46, 204, 113, 0.2);
  }

  .result-enharmonic {
    background-color: rgba(243, 156, 18, 0.2);
  }

  .result-wrong {
    background-color: rgba(231, 76, 60, 0.2);
  }
}
</style>
