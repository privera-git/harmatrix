import { describe, it, expect, beforeEach, afterEach, assert, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import IdleView from '@/components/IdleView.vue'
import { useProgressStore } from '@/stores/progress'
import { useGameStore } from '@/stores/game'

function freshStorage() {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => {
      store[key] = val
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach((k) => {
        delete store[k]
      })
    },
  }
}

function mountView() {
  return mount(IdleView)
}

describe('IdleView', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', freshStorage())
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('static content', () => {
    it('renders the title HARMATRIX', () => {
      const wrapper = mountView()
      expect(wrapper.find('h1').text()).toBe('HARMATRIX')
    })

    it('renders the sub-stage progress bar', () => {
      const wrapper = mountView()
      expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
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
    it('shows stage name on fresh store', () => {
      const wrapper = mountView()
      expect(wrapper.text()).toContain('Interval Basics')
    })

    it('shows quality matching current learning position', () => {
      const wrapper = mountView()
      // Default position is stage 1, subStage 1 → 'seconds' (Interval Basics SS-1)
      expect(wrapper.text()).toContain('seconds')
    })

    it('shows updated quality when learning position advances', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 1, subStage: 2 }
      const wrapper = mountView()
      // stage 1, subStage 2 → 'thirds' (Interval Basics SS-2)
      expect(wrapper.text()).toContain('thirds')
    })

    it('shows lowercase m7 label and disables the capitalize transform', async () => {
      const progress = useProgressStore()
      // Stage 3 (Tetrads), subStage 3 → 'm7'
      progress.state.learning = { stage: 3, subStage: 3 }
      const wrapper = mountView()
      expect(wrapper.find('.quality-label').text()).toContain('m7')
      expect(wrapper.find('.quality-label').classes()).toContain('quality-label--symbol')
    })

    it('shows the formatted mΔ7 label instead of leaking the raw mMaj7 key', async () => {
      const progress = useProgressStore()
      // Stage 3 (Tetrads), subStage 4 → 'mMaj7'
      progress.state.learning = { stage: 3, subStage: 4 }
      const wrapper = mountView()
      expect(wrapper.find('.quality-label').text()).toContain('mΔ7')
      expect(wrapper.find('.quality-label').text()).not.toContain('mMaj7')
      expect(wrapper.find('.quality-label').classes()).toContain('quality-label--symbol')
    })

    it('reflects accumulatedScore progress in the progress bar', async () => {
      const progress = useProgressStore()
      // Default position is stage 1, subStage 1 → 'seconds' (3 intervals → 6 non-given cells,
      // targetScore = 10 * 6 * 3 = 180); 90 is 50% of target.
      progress.state.accumulatedScore['seconds'] = 90
      const wrapper = mountView()
      expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('50')
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

  describe('skip button', () => {
    it('shows Skip button in learn mode at Stage 0 (Interval Basics, default)', () => {
      const wrapper = mountView()
      expect(wrapper.find('.skip-btn').exists()).toBe(true)
    })

    it('skip button text contains "Triads"', () => {
      const wrapper = mountView()
      expect(wrapper.find('.skip-btn').text()).toContain('Triads')
    })

    it('hides Skip button in learn mode when at Stage 2 (Triads)', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 }
      const wrapper = mountView()
      const skipBtns = wrapper.findAll('.skip-btn')
      expect(skipBtns.every((b) => !b.text().includes('Triads'))).toBe(true)
    })

    it('hides Skip button in free play mode', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      const wrapper = mountView()
      expect(wrapper.findAll('.skip-btn')).toHaveLength(0)
    })

    it('clicking Skip calls skipToTriads', async () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'skipToTriads')
      const wrapper = mountView()
      await wrapper.find('.skip-btn').trigger('click')
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('after skip, Skip to Triads button disappears', async () => {
      const wrapper = mountView()
      await wrapper.find('.skip-btn').trigger('click')
      await wrapper.vm.$nextTick()
      const skipBtns = wrapper.findAll('.skip-btn')
      expect(skipBtns.every((b) => !b.text().includes('Triads'))).toBe(true)
    })
  })

  describe('back to intervals button', () => {
    it('shows Back button in learn mode at Stage 2 (Triads)', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 }
      const wrapper = mountView()
      const btns = wrapper.findAll('.skip-btn')
      expect(btns.some((b) => b.text().includes('Interval Basics'))).toBe(true)
    })

    it('back button text contains "Interval Basics"', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 }
      const wrapper = mountView()
      const btns = wrapper.findAll('.skip-btn')
      const backBtn = btns.find((b) => b.text().includes('Interval Basics'))
      expect(backBtn).toBeDefined()
    })

    it('hides Back button at Stage 2 when Stage 0 was completed naturally', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 }
      progress.state.unlockedContent = ['seconds', 'thirds', 'fourthsFifths', 'sixths', 'sevenths', 'ninths', 'alteredExtensions', 'thirteenth']
      const wrapper = mountView()
      const btns = wrapper.findAll('.skip-btn')
      expect(btns.every((b) => !b.text().includes('Interval Basics'))).toBe(true)
    })

    it('hides Back button at Stage 1 (Interval Basics)', () => {
      const wrapper = mountView()
      const btns = wrapper.findAll('.skip-btn')
      expect(btns.every((b) => !b.text().includes('Interval Basics'))).toBe(true)
    })

    it('hides Back button at Stage 3+', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 3, subStage: 1 }
      const wrapper = mountView()
      const btns = wrapper.findAll('.skip-btn')
      expect(btns.every((b) => !b.text().includes('Interval Basics'))).toBe(true)
    })

    it('hides Back button in free play mode', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      progress.state.learning = { stage: 2, subStage: 1 }
      const wrapper = mountView()
      expect(wrapper.findAll('.skip-btn')).toHaveLength(0)
    })

    it('clicking Back calls jumpToPosition(1, 1)', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 }
      const spy = vi.spyOn(progress, 'jumpToPosition')
      const wrapper = mountView()
      const btns = wrapper.findAll('.skip-btn')
      const backBtn = btns.find((b) => b.text().includes('Interval Basics'))!
      await backBtn.trigger('click')
      expect(spy).toHaveBeenCalledWith(1, 1)
    })

    it('after clicking Back, Back button disappears', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 }
      const wrapper = mountView()
      const btns = wrapper.findAll('.skip-btn')
      const backBtn = btns.find((b) => b.text().includes('Interval Basics'))!
      await backBtn.trigger('click')
      await wrapper.vm.$nextTick()
      const remaining = wrapper.findAll('.skip-btn')
      expect(remaining.every((b) => !b.text().includes('Interval Basics'))).toBe(true)
    })
  })

  describe('mode toggle', () => {
    it('renders Learn and Free Play buttons', () => {
      const wrapper = mountView()
      const btns = wrapper.findAll('.mode-btn')
      expect(btns[0]!.text()).toBe('Learn')
      expect(btns[1]!.text()).toBe('Free Play')
    })

    it('defaults to learn mode', () => {
      const wrapper = mountView()
      expect(wrapper.findAll('.mode-btn')[0]!.classes()).toContain('mode-btn--active')
    })

    it('switches to free play mode on click and persists', async () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'setIdleMode')
      const wrapper = mountView()
      await wrapper.findAll('.mode-btn')[1]!.trigger('click')
      expect(spy).toHaveBeenCalledWith('freePlay')
    })

    it('reflects persisted idleMode on mount', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      const wrapper = mountView()
      expect(wrapper.findAll('.mode-btn')[1]!.classes()).toContain('mode-btn--active')
    })
  })

  describe('free play mode rendering', () => {
    it('hides the quality label in free play mode', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      const wrapper = mountView()
      expect(wrapper.find('.quality-label').exists()).toBe(false)
    })

    it('hides the Start button in free play mode', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      const wrapper = mountView()
      expect(wrapper.find('.start-btn').exists()).toBe(false)
    })

    it('shows FreePlayPicker in free play mode', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      progress.state.learning = { stage: 2, subStage: 2 }
      const wrapper = mountView()
      expect(wrapper.findComponent({ name: 'FreePlayPicker' }).exists()).toBe(true)
    })

    it('keeps difficulty checkboxes visible in free play mode', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      const wrapper = mountView()
      expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(2)
    })
  })

  describe('free play quality selection', () => {
    it('starts a free play session when FreePlayPicker emits play', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      progress.state.learning = { stage: 2, subStage: 2 }
      const game = useGameStore()
      const wrapper = mountView()
      const picker = wrapper.findComponent({ name: 'FreePlayPicker' })
      await picker.vm.$emit('play', 'major')
      assert(game.session.phase === 'playing')
      expect(game.session.isFreePlay).toBe(true)
      expect(game.session.puzzle.quality).toBe('major')
    })

    it('persists last free play stage when FreePlayPicker emits stageOpen', async () => {
      const progress = useProgressStore()
      progress.state.idleMode = 'freePlay'
      progress.state.learning = { stage: 2, subStage: 2 }
      const spy = vi.spyOn(progress, 'setLastFreePlayStage')
      const wrapper = mountView()
      const picker = wrapper.findComponent({ name: 'FreePlayPicker' })
      await picker.vm.$emit('stageOpen', 0)
      expect(spy).toHaveBeenCalledWith(0)
    })
  })
})
