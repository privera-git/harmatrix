import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import CompletionModal from '@/components/CompletionModal.vue'

const mockPlayJingle = vi.fn<(type: string) => void>()
vi.mock('@/composables/useAudio', () => ({
  useAudio: () => ({ playNote: vi.fn<(note: string) => void>(), playJingle: mockPlayJingle }),
}))

const BASE_PROPS = {
  completedQuality: 'major' as const,
  nextQuality: 'minor' as const,
  showFreePlayUnlock: true,
  score: 42,
  breakdown: { correct: 5, enharmonic: 1, wrong: 0 },
  multiplier: 1,
}

describe('CompletionModal', () => {
  it('announces the completed quality', () => {
    const wrapper = mount(CompletionModal, { props: BASE_PROPS })
    expect(wrapper.find('.completion-summary').text()).toContain('major triad')
  })

  it('shows the next quality to learn when provided', () => {
    const wrapper = mount(CompletionModal, { props: BASE_PROPS })
    expect(wrapper.text()).toContain('minor triad')
    expect(wrapper.text()).toContain('is now available to learn')
  })

  it('shows a curriculum-complete message when nextQuality is null', () => {
    const wrapper = mount(CompletionModal, { props: { ...BASE_PROPS, nextQuality: null } })
    expect(wrapper.text()).toContain('completed the entire curriculum')
  })

  it('shows the Free Play unlock line when showFreePlayUnlock is true', () => {
    const wrapper = mount(CompletionModal, { props: BASE_PROPS })
    expect(wrapper.text()).toContain('Free Play')
  })

  it('hides the Free Play unlock line when showFreePlayUnlock is false', () => {
    const wrapper = mount(CompletionModal, { props: { ...BASE_PROPS, showFreePlayUnlock: false } })
    expect(wrapper.text()).not.toContain('Free Play')
  })

  it('renders session stats', () => {
    const wrapper = mount(CompletionModal, { props: BASE_PROPS })
    expect(wrapper.find('.stats-total').text()).toContain('42')
    const breakdown = wrapper.find('.stats-breakdown').text()
    expect(breakdown).toContain('✓ 5')
    expect(breakdown).toContain('≈ 1')
    expect(breakdown).toContain('✗ 0')
  })

  it('plays the fanfare jingle on mount', () => {
    mount(CompletionModal, { props: BASE_PROPS })
    expect(mockPlayJingle).toHaveBeenCalledWith('fanfare')
  })

  it('emits continue when the Continue button is clicked', async () => {
    const wrapper = mount(CompletionModal, { props: BASE_PROPS })
    await wrapper.find('.completion-actions .action-btn').trigger('click')
    expect(wrapper.emitted('continue')).toHaveLength(1)
  })

  it('emits stop when the Stop button is clicked', async () => {
    const wrapper = mount(CompletionModal, { props: BASE_PROPS })
    await wrapper.find('.action-btn--secondary').trigger('click')
    expect(wrapper.emitted('stop')).toHaveLength(1)
  })
})
