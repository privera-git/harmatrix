import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PianoKeyboard from '@/components/PianoKeyboard.vue'

describe('PianoKeyboard', () => {
  it('renders 7 white keys', () => {
    const wrapper = mount(PianoKeyboard)
    expect(wrapper.findAll('.white-key')).toHaveLength(7)
  })

  it('renders 5 black keys', () => {
    const wrapper = mount(PianoKeyboard)
    expect(wrapper.findAll('.black-key')).toHaveLength(5)
  })

  it('renders labels for all 7 white keys', () => {
    const wrapper = mount(PianoKeyboard)
    const labels = wrapper.findAll('.white-key-label').map((el) => el.text())
    expect(labels).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
  })

  it('renders 12 keys total', () => {
    const wrapper = mount(PianoKeyboard)
    expect(wrapper.findAll('.key')).toHaveLength(12)
  })

  it('black keys have inline left style for positioning', () => {
    const wrapper = mount(PianoKeyboard)
    for (const key of wrapper.findAll('.black-key')) {
      expect((key.element as HTMLElement).style.left).toBeTruthy()
    }
  })

  describe('note-click emit', () => {
    it('emits note-click with the bare pitch class when a white key is clicked', async () => {
      const wrapper = mount(PianoKeyboard)
      await wrapper.findAll('.white-key')[2]!.trigger('click') // E
      expect(wrapper.emitted('note-click')).toEqual([['E']])
    })

    it('emits note-click with the bare pitch class when a black key is clicked', async () => {
      const wrapper = mount(PianoKeyboard)
      await wrapper.findAll('.black-key')[0]!.trigger('click') // C#
      expect(wrapper.emitted('note-click')).toEqual([['C#']])
    })

    it('does not emit note-click for an inactive key when activeOnly is set', async () => {
      const wrapper = mount(PianoKeyboard, { props: { activeOnly: true, activeNote: 'C' } })
      await wrapper.findAll('.white-key')[2]!.trigger('click') // E, not active
      expect(wrapper.emitted('note-click')).toBeUndefined()
    })

    it('emits note-click for the active key when activeOnly is set', async () => {
      const wrapper = mount(PianoKeyboard, { props: { activeOnly: true, activeNote: 'C' } })
      await wrapper.findAll('.white-key')[0]!.trigger('click') // C, active
      expect(wrapper.emitted('note-click')).toEqual([['C']])
    })
  })
})
