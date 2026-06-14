import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TheoryModal from '@/components/TheoryModal.vue'

describe('TheoryModal', () => {
  it('shows capitalized quality title for a chord', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'major' } })
    expect(wrapper.find('.modal-title').text()).toBe('Major triad')
  })

  it('shows subtitle for a derived mode', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'dorian' } })
    expect(wrapper.find('.modal-subtitle').text()).toBe('2nd mode of Major')
  })

  it('shows no subtitle for authored scale descriptions', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'ionian' } })
    expect(wrapper.find('.modal-subtitle').exists()).toBe(false)
  })

  it('shows no subtitle for chords', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'major' } })
    expect(wrapper.find('.modal-subtitle').exists()).toBe(false)
  })

  it('shows interval group label as title', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'thirds' } })
    expect(wrapper.find('.modal-title').text()).toBe('Thirds')
    expect(wrapper.find('.modal-subtitle').exists()).toBe(false)
  })

  it('emits close when ✕ button is clicked', async () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'major' } })
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close when backdrop is clicked', async () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'major' } })
    await wrapper.find('.theory-backdrop').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows formula degree labels for major triad', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'major' } })
    const degrees = wrapper.findAll('.degree').map((d) => d.text())
    expect(degrees).toEqual(['1', '3', '5'])
  })

  it('shows active semitones for major triad', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'major' } })
    const active = wrapper.findAll('.semitone-active').map((s) => s.text())
    expect(active).toEqual(['[0]', '[4]', '[7]'])
  })

  it('shows harmonic minor authored description', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'harmonicMinor' } })
    expect(wrapper.find('.modal-description').text()).toContain('minor scale with a major 7th')
  })

  it('shows phrygianDom mode subtitle and description', () => {
    const wrapper = mount(TheoryModal, { props: { quality: 'phrygianDom' } })
    expect(wrapper.find('.modal-subtitle').text()).toBe('5th mode of Harmonic Minor')
    expect(wrapper.find('.modal-description').text()).toContain(
      '5th mode of the harmonic minor scale',
    )
  })
})
