import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotePicker from '@/components/NotePicker.vue'

function mountPicker(modelValue: string | null, disabled = false) {
  return mount(NotePicker, {
    props: { modelValue, disabled, 'onUpdate:modelValue': (_v: string | null | undefined) => {} },
  })
}

describe('NotePicker', () => {
  describe('initial render', () => {
    it('renders 7 letter buttons', () => {
      const wrapper = mountPicker(null)
      expect(wrapper.findAll('.letters-row .picker-btn')).toHaveLength(7)
    })

    it('renders 5 accidental buttons', () => {
      const wrapper = mountPicker(null)
      expect(wrapper.findAll('.accidentals-row .picker-btn')).toHaveLength(5)
    })

    it('highlights the active letter', () => {
      const wrapper = mountPicker('F#')
      const active = wrapper.findAll('.letters-row .picker-btn.active')
      expect(active).toHaveLength(1)
      expect(active[0]?.text()).toBe('F')
    })

    it('highlights the active accidental', () => {
      const wrapper = mountPicker('F#')
      const active = wrapper.findAll('.accidentals-row .picker-btn.active')
      expect(active).toHaveLength(1)
      expect(active[0]?.text()).toBe('#')
    })

    it('highlights ♮ when note has no accidental', () => {
      const wrapper = mountPicker('G')
      const active = wrapper.findAll('.accidentals-row .picker-btn.active')
      expect(active).toHaveLength(1)
      expect(active[0]?.text()).toBe('♮')
    })

    it('highlights no letter or accidental when modelValue is null', () => {
      const wrapper = mountPicker(null)
      expect(wrapper.findAll('.active')).toHaveLength(0)
    })
  })

  describe('letter selection', () => {
    it('emits natural note when selecting a letter with no prior value', async () => {
      const updates: (string | null)[] = []
      const wrapper = mount(NotePicker, {
        props: {
          modelValue: null,
          disabled: false,
          'onUpdate:modelValue': (v: string | null | undefined) => updates.push(v ?? null),
        },
      })
      await wrapper.findAll('.letters-row .picker-btn')[2]!.trigger('click') // E
      expect(updates).toEqual(['E'])
    })

    it('preserves accidental when switching letter to a valid note', async () => {
      const updates: (string | null)[] = []
      const wrapper = mount(NotePicker, {
        props: {
          modelValue: 'F#',
          disabled: false,
          'onUpdate:modelValue': (v: string | null | undefined) => updates.push(v ?? null),
        },
      })
      // Click G — G# is valid
      await wrapper.findAll('.letters-row .picker-btn')[4]!.trigger('click') // G
      expect(updates).toEqual(['G#'])
    })

    it('falls back to natural note when no prior accidental', async () => {
      const updates: (string | null)[] = []
      const wrapper = mount(NotePicker, {
        props: {
          modelValue: 'C',
          disabled: false,
          'onUpdate:modelValue': (v: string | null | undefined) => updates.push(v ?? null),
        },
      })
      await wrapper.findAll('.letters-row .picker-btn')[1]!.trigger('click') // D
      expect(updates).toEqual(['D'])
    })
  })

  describe('accidental selection', () => {
    it('emits updated note when selecting an accidental', async () => {
      const updates: (string | null)[] = []
      const wrapper = mount(NotePicker, {
        props: {
          modelValue: 'F',
          disabled: false,
          'onUpdate:modelValue': (v: string | null | undefined) => updates.push(v ?? null),
        },
      })
      // Click # (index 3)
      await wrapper.findAll('.accidentals-row .picker-btn')[3]!.trigger('click')
      expect(updates).toEqual(['F#'])
    })

    it('removes accidental when ♮ is clicked', async () => {
      const updates: (string | null)[] = []
      const wrapper = mount(NotePicker, {
        props: {
          modelValue: 'Bb',
          disabled: false,
          'onUpdate:modelValue': (v: string | null | undefined) => updates.push(v ?? null),
        },
      })
      // Click ♮ (index 2)
      await wrapper.findAll('.accidentals-row .picker-btn')[2]!.trigger('click')
      expect(updates).toEqual(['B'])
    })

    it('accidental buttons are disabled when no letter is selected', () => {
      const wrapper = mountPicker(null)
      const accBtns = wrapper.findAll('.accidentals-row .picker-btn')
      for (const btn of accBtns) {
        expect((btn.element as HTMLButtonElement).disabled).toBe(true)
      }
    })
  })

  describe('disabled prop', () => {
    it('applies disabled class to root element', () => {
      const wrapper = mountPicker('C', true)
      expect(wrapper.find('.note-picker').classes()).toContain('disabled')
    })

    it('all buttons are disabled when disabled prop is true', () => {
      const wrapper = mountPicker('C', true)
      for (const btn of wrapper.findAll('.picker-btn')) {
        expect((btn.element as HTMLButtonElement).disabled).toBe(true)
      }
    })
  })
})
