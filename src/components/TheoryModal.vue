<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Interval, Note } from '@/music/tonal'
import { CHORD_CATALOG } from '@/music/data/chords'
import type { ChordQuality } from '@/music/data/chords'
import { SCALE_CATALOG } from '@/music/data/scales'
import type { ScaleMode } from '@/music/data/scales'
import { INTERVAL_CATALOG } from '@/music/data/intervals'
import type { IntervalGroup } from '@/music/data/intervals'
import { SCALE_DESCRIPTIONS, MODE_PARENT } from '@/music/data/theory'
import { formatQualityLabel } from '@/music/display'
import { intervalToDegreeLabel } from '@/music/matrix'
import PianoKeyboard from '@/components/PianoKeyboard.vue'

const props = defineProps<{
  quality: ChordQuality | ScaleMode | IntervalGroup
}>()

const emit = defineEmits<{ close: [] }>()

const backdropRef = ref<HTMLElement | null>(null)

onMounted(() => {
  backdropRef.value?.focus()
})

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th'] as const

const SEMITONE_STEP_NAME: Record<number, string> = {
  1: 'Minor 2nd',
  2: 'Major 2nd',
  3: 'Minor 3rd',
  4: 'Major 3rd',
  5: 'Perfect 4th',
  6: 'Tritone',
  7: 'Perfect 5th',
  8: 'Minor 6th',
  9: 'Major 6th',
  10: 'Minor 7th',
  11: 'Major 7th',
}

function capitalize(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function capitalizeWords(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

const catalogEntry = computed(() => {
  if (props.quality in CHORD_CATALOG) return CHORD_CATALOG[props.quality as ChordQuality]
  if (props.quality in SCALE_CATALOG) return SCALE_CATALOG[props.quality as ScaleMode]
  if (props.quality in INTERVAL_CATALOG) return INTERVAL_CATALOG[props.quality as IntervalGroup]
  return null
})

const intervals = computed<string[]>(() => catalogEntry.value?.intervals ?? [])

const title = computed(() => capitalize(formatQualityLabel(props.quality)))

const subtitle = computed<string | null>(() => {
  const meta = MODE_PARENT[props.quality as ScaleMode]
  if (!meta) return null
  const ordinal = ORDINALS[meta.modePosition - 1] ?? `${meta.modePosition}th`
  return `${ordinal} mode of ${capitalizeWords(meta.parentScale)}`
})

const description = computed<string>(() => {
  const scaleDesc = SCALE_DESCRIPTIONS[props.quality as ScaleMode]
  if (scaleDesc) return scaleDesc

  const modeMeta = MODE_PARENT[props.quality as ScaleMode]
  if (modeMeta) {
    const ordinal = ORDINALS[modeMeta.modePosition - 1] ?? `${modeMeta.modePosition}th`
    return `This is the ${ordinal} mode of the ${modeMeta.parentScale} scale.`
  }

  if (props.quality in INTERVAL_CATALOG) {
    const def = INTERVAL_CATALOG[props.quality as IntervalGroup]
    const semitones = def.intervals
      .map((iv) => (Interval.semitones(iv) ?? 0) % 12)
      .filter((s) => s > 0)
    const unit = semitones.length === 1 ? 'semitone' : 'semitones'
    return `The ${def.label} group contains intervals at ${semitones.join(', ')} ${unit} from the root.`
  }

  if (props.quality in CHORD_CATALOG) {
    const semValues = intervals.value.map((iv) => Interval.semitones(iv) ?? 0)
    const stacked = semValues.slice(1).map((s, i) => s - (semValues[i] ?? 0))
    if (stacked.length === 0) return `A ${title.value}.`
    const parts = stacked.map((n) => {
      const name = SEMITONE_STEP_NAME[n] ?? `${n} semitone${n === 1 ? '' : 's'}`
      const unit = n === 1 ? 'semitone' : 'semitones'
      return `${name} (${n} ${unit})`
    })
    const label = title.value
    const article = /^[AEIOUaeiou]/.test(label) ? 'An' : 'A'
    if (parts.length === 1) return `${article} ${label} is composed of a ${parts[0]!} above it.`
    const last = parts[parts.length - 1]!
    const rest = parts.slice(0, -1)
    return `${article} ${label} is composed of a ${rest.join(', a ')} and a ${last} above it.`
  }

  return ''
})

const formulaDegrees = computed(() => intervals.value.map(intervalToDegreeLabel))

const formulaSymbols = computed(() => intervals.value.join(' · '))

const semitoneDotSet = computed(
  () => new Set(intervals.value.map((iv) => (Interval.semitones(iv) ?? 0) % 12)),
)

const semitoneMax = computed(() => Math.max(...semitoneDotSet.value, 0))

const semitoneRange = computed(() =>
  Array.from({ length: semitoneMax.value + 1 }, (_, i) => i),
)

const pianoNotes = computed(() => intervals.value.map((iv) => Note.transpose('C4', iv)))
</script>

<template>
  <div
    ref="backdropRef"
    class="theory-backdrop"
    tabindex="0"
    @click="emit('close')"
    @keydown.escape="emit('close')"
  >
    <div class="theory-modal" @click.stop>
      <div class="modal-header">
        <div class="modal-titles">
          <h2 class="modal-title">{{ title }}</h2>
          <span v-if="subtitle" class="modal-subtitle">{{ subtitle }}</span>
        </div>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <p class="modal-description">{{ description }}</p>

      <section class="modal-section">
        <div class="section-label">Formula</div>
        <div class="formula-degrees">
          <span v-for="deg in formulaDegrees" :key="deg" class="degree">{{ deg }}</span>
        </div>
        <div class="formula-symbols">{{ formulaSymbols }}</div>
      </section>

      <section class="modal-section">
        <div class="section-label">Semitones</div>
        <div class="semitone-row">
          <span
            v-for="n in semitoneRange"
            :key="n"
            class="semitone-num"
            :class="{ 'semitone-active': semitoneDotSet.has(n) }"
          >{{ semitoneDotSet.has(n) ? `[${n}]` : n }}</span>
        </div>
      </section>

      <PianoKeyboard :active-notes="pianoNotes" :active-only="true" />
    </div>
  </div>
</template>

<style scoped>
.theory-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
  outline: none;
}

.theory-modal {
  background: #fff;
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 8px 8px 0 0;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modal-titles {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.modal-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.modal-subtitle {
  font-size: 0.8rem;
  color: #888;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}

.close-btn:hover {
  color: #333;
}

.modal-description {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #444;
}

.modal-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.section-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #999;
}

.formula-degrees {
  display: flex;
  gap: 0.9rem;
  font-size: 0.95rem;
  font-weight: 600;
}

.degree {
  min-width: 1.5rem;
  text-align: center;
}

.formula-symbols {
  font-size: 0.8rem;
  color: #666;
  font-family: monospace;
}

.semitone-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-family: monospace;
}

.semitone-num {
  color: #bbb;
}

.semitone-active {
  color: #111;
  font-weight: 700;
}

@media (prefers-color-scheme: dark) {
  .theory-modal {
    background: #1e1e1e;
  }

  .modal-description {
    color: #ccc;
  }

  .modal-subtitle {
    color: #888;
  }

  .close-btn {
    color: #aaa;
  }

  .close-btn:hover {
    color: #fff;
  }

  .formula-symbols {
    color: #aaa;
  }

  .semitone-num {
    color: #555;
  }

  .semitone-active {
    color: #fff;
  }
}
</style>
