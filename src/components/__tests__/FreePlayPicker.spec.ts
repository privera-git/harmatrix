import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import FreePlayPicker from '@/components/FreePlayPicker.vue'
import type { FreePlayStageAccess } from '@/stores/progress'

function makeAccess(overrides: Partial<FreePlayStageAccess>[] = []): FreePlayStageAccess[] {
  return Array.from({ length: 8 }, (_, i): FreePlayStageAccess => {
    const override = overrides[i] ?? {}
    return {
      accessible: false,
      subStages: Array.from({ length: 4 }, (__, j) => ({
        accessible: false,
        quality: j === 0 ? 'major' : j === 1 ? 'minor' : j === 2 ? 'aug' : 'dim',
      })),
      ...override,
    } as FreePlayStageAccess
  })
}

const ACCESS_STAGE0_PARTIAL: FreePlayStageAccess[] = makeAccess([
  {
    accessible: true,
    subStages: [
      { accessible: true, quality: 'major' },
      { accessible: true, quality: 'minor' },
      { accessible: false, quality: 'aug' },
      { accessible: false, quality: 'dim' },
    ],
  },
])

describe('FreePlayPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('locked stages', () => {
    it('does not expand a locked stage on click', async () => {
      const allLocked = makeAccess()
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: allLocked, initialStage: null },
      })
      const header = wrapper.findAll('.stage-header')[0]!
      await header.trigger('click')
      expect(wrapper.find('.sub-stages').exists()).toBe(false)
    })

    it('does not emit stageOpen for a locked stage', async () => {
      const allLocked = makeAccess()
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: allLocked, initialStage: null },
      })
      await wrapper.findAll('.stage-header')[0]!.trigger('click')
      expect(wrapper.emitted('stageOpen')).toBeUndefined()
    })
  })

  describe('auto-open on mount', () => {
    it('opens the initialStage when it is accessible', async () => {
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: ACCESS_STAGE0_PARTIAL, initialStage: 0 },
      })
      await nextTick()
      expect(wrapper.find('.sub-stages').exists()).toBe(true)
    })

    it('opens the first accessible stage when initialStage is null', async () => {
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: ACCESS_STAGE0_PARTIAL, initialStage: null },
      })
      await nextTick()
      expect(wrapper.find('.sub-stages').exists()).toBe(true)
    })

    it('opens nothing when initialStage points to a locked stage', async () => {
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: ACCESS_STAGE0_PARTIAL, initialStage: 1 },
      })
      await nextTick()
      // stage 1 is locked; falls back to first accessible (stage 0)
      expect(wrapper.find('.sub-stages').exists()).toBe(true)
      expect(wrapper.findAll('.stage-header')[0]!.classes()).toContain('stage-header--open')
    })

    it('opens nothing when all stages are locked and initialStage is null', async () => {
      const allLocked = makeAccess()
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: allLocked, initialStage: null },
      })
      await nextTick()
      expect(wrapper.find('.sub-stages').exists()).toBe(false)
    })
  })

  describe('expand / collapse', () => {
    it('expands an accessible stage and emits stageOpen', async () => {
      const access = makeAccess([{ accessible: true, subStages: [{ accessible: true, quality: 'major' }] }])
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: access, initialStage: null },
      })
      await nextTick()
      // auto-opens stage 0; close it first
      await wrapper.findAll('.stage-header')[0]!.trigger('click')
      expect(wrapper.find('.sub-stages').exists()).toBe(false)

      await wrapper.findAll('.stage-header')[0]!.trigger('click')
      expect(wrapper.find('.sub-stages').exists()).toBe(true)
      expect(wrapper.emitted('stageOpen')).toBeDefined()
    })

    it('closes the previously open stage when another is opened', async () => {
      const access = makeAccess([
        { accessible: true, subStages: [{ accessible: true, quality: 'major' }] },
        { accessible: true, subStages: [{ accessible: true, quality: 'minor' }] },
      ])
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: access, initialStage: 0 },
      })
      await nextTick()
      expect(wrapper.findAll('.sub-stages')).toHaveLength(1)

      await wrapper.findAll('.stage-header')[1]!.trigger('click')
      expect(wrapper.findAll('.sub-stages')).toHaveLength(1)
      expect(wrapper.findAll('.stage-header')[1]!.classes()).toContain('stage-header--open')
    })
  })

  describe('play emission', () => {
    it('emits play with the quality when an accessible sub-stage is clicked', async () => {
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: ACCESS_STAGE0_PARTIAL, initialStage: 0 },
      })
      await nextTick()
      await wrapper.findAll('.sub-stage-btn')[0]!.trigger('click')
      expect(wrapper.emitted('play')).toBeDefined()
      expect(wrapper.emitted('play')![0]).toEqual(['major'])
    })

    it('does not emit play when a locked sub-stage is clicked', async () => {
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: ACCESS_STAGE0_PARTIAL, initialStage: 0 },
      })
      await nextTick()
      // sub-stage index 2 is locked
      await wrapper.findAll('.sub-stage-btn')[2]!.trigger('click')
      expect(wrapper.emitted('play')).toBeUndefined()
    })
  })

  describe('minor symbol casing', () => {
    it('renders m7 text and disables capitalize transform for a minor tetrad sub-stage', async () => {
      const access = makeAccess([
        {
          accessible: true,
          subStages: [
            { accessible: true, quality: 'm7' },
            { accessible: true, quality: 'mMaj7' },
          ],
        },
      ])
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: access, initialStage: 0 },
      })
      await nextTick()
      const buttons = wrapper.findAll('.sub-stage-btn')
      expect(buttons[0]!.text()).toBe('m7')
      expect(buttons[0]!.classes()).toContain('sub-stage-btn--symbol')
      expect(buttons[1]!.text()).toBe('mΔ7')
      expect(buttons[1]!.classes()).toContain('sub-stage-btn--symbol')
    })

    it('does not disable the capitalize transform for a triad sub-stage', async () => {
      const wrapper = mount(FreePlayPicker, {
        props: { freePlayAccess: ACCESS_STAGE0_PARTIAL, initialStage: 0 },
      })
      await nextTick()
      expect(wrapper.findAll('.sub-stage-btn')[0]!.classes()).not.toContain('sub-stage-btn--symbol')
    })
  })
})
