import { describe, it, expect, beforeEach, assert } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import IdleView from '@/components/IdleView.vue'
import { useProgressStore } from '@/stores/progress'
import { useGameStore } from '@/stores/game'
import { SUB_STAGE_SESSION_SIZE } from '@/config/game'

function mountView() {
  return mount(IdleView)
}

describe('IdleView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('static content', () => {
    it('renders the title HARMATRIX', () => {
      const wrapper = mountView()
      expect(wrapper.find('h1').text()).toBe('HARMATRIX')
    })

    it('renders the session size denominator', () => {
      const wrapper = mountView()
      expect(wrapper.text()).toContain(`/ ${SUB_STAGE_SESSION_SIZE}`)
    })

    it('renders two difficulty checkboxes', () => {
      const wrapper = mountView()
      expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(2)
    })

    it('renders a Start button', () => {
      const wrapper = mountView()
      expect(wrapper.find('.start-btn').exists()).toBe(true)
    })
  })

  describe('learning position', () => {
    it('shows default stage 1 · sub-stage 1 on fresh store', () => {
      const wrapper = mountView()
      expect(wrapper.text()).toContain('Stage 1')
      expect(wrapper.text()).toContain('Sub-stage 1')
    })

    it('shows quality matching current learning position', () => {
      const wrapper = mountView()
      // Default position is stage 1, subStage 1 → 'major'
      expect(wrapper.text()).toContain('major')
    })

    it('shows updated quality when learning position advances', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 1, subStage: 2 }
      const wrapper = mountView()
      // stage 1, subStage 2 → 'minor'
      expect(wrapper.text()).toContain('minor')
    })

    it('shows perfect streak from store', async () => {
      const progress = useProgressStore()
      progress.state.currentSubStageSession.perfectStreak = 4
      const wrapper = mountView()
      expect(wrapper.text()).toContain('4 /')
    })
  })

  describe('streak footer', () => {
    it('shows streak from progress store', async () => {
      const progress = useProgressStore()
      progress.state.practiceStreak = 5
      const wrapper = mountView()
      expect(wrapper.text()).toContain('5 days')
    })

    it('uses singular "day" for streak of 1', async () => {
      const progress = useProgressStore()
      progress.state.practiceStreak = 1
      const wrapper = mountView()
      expect(wrapper.text()).toContain('1 day')
      expect(wrapper.text()).not.toContain('1 days')
    })
  })

  describe('start action', () => {
    it('transitions to playing phase when Start is clicked', async () => {
      const game = useGameStore()
      const wrapper = mountView()
      await wrapper.find('.start-btn').trigger('click')
      expect(game.session.phase).toBe('playing')
    })

    it('passes noDegreeLabels option when toggle is checked', async () => {
      const game = useGameStore()
      const wrapper = mountView()
      await wrapper.findAll('input[type="checkbox"]')[0]!.setValue(true)
      await wrapper.find('.start-btn').trigger('click')
      assert(game.session.phase === 'playing')
      expect(game.session.options.noDegreeLabels).toBe(true)
    })

    it('passes noPianoKeyboard option when toggle is checked', async () => {
      const game = useGameStore()
      const wrapper = mountView()
      await wrapper.findAll('input[type="checkbox"]')[1]!.setValue(true)
      await wrapper.find('.start-btn').trigger('click')
      assert(game.session.phase === 'playing')
      expect(game.session.options.noPianoKeyboard).toBe(true)
    })

    it('defaults both options to false', async () => {
      const game = useGameStore()
      const wrapper = mountView()
      await wrapper.find('.start-btn').trigger('click')
      assert(game.session.phase === 'playing')
      expect(game.session.options.noDegreeLabels).toBe(false)
      expect(game.session.options.noPianoKeyboard).toBe(false)
    })
  })
})
