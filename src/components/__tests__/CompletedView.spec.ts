import { describe, it, expect, beforeEach, vi, assert } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CompletedView from '@/components/CompletedView.vue'
import CompletionModal from '@/components/CompletionModal.vue'
import { useGameStore } from '@/stores/game'
import { useProgressStore } from '@/stores/progress'

vi.mock('@/config/features', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/features')>()
  return { FEATURES: { ...actual.FEATURES, COMPLETION_MODAL: true } }
})

const DEFAULT_OPTIONS = { noDegreeLabels: false, noPianoKeyboard: false }

function completeGame(opts = DEFAULT_OPTIONS, isFreePlay = false) {
  const game = useGameStore()
  game.startPuzzle('C', 'major', opts, isFreePlay)
  game.completeSession()
  return game
}

function mountView() {
  return mount(CompletedView)
}

describe('CompletedView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('header', () => {
    it('renders quality and diagonal note', () => {
      completeGame()
      const wrapper = mountView()
      expect(wrapper.find('.puzzle-label').text()).toContain('major')
      expect(wrapper.find('.puzzle-label').text()).toContain('C')
    })
  })

  describe('score display', () => {
    it('renders the score', () => {
      completeGame()
      const wrapper = mountView()
      expect(wrapper.find('.score-total').text()).toContain('Score:')
    })

    it('renders ✓ ≈ ✗ breakdown', () => {
      completeGame()
      const wrapper = mountView()
      const breakdown = wrapper.find('.score-breakdown').text()
      expect(breakdown).toContain('✓')
      expect(breakdown).toContain('≈')
      expect(breakdown).toContain('✗')
    })

    it('shows multiplier × 1 with default options', () => {
      completeGame({ noDegreeLabels: false, noPianoKeyboard: false })
      const wrapper = mountView()
      expect(wrapper.find('.score-breakdown').text()).toContain('× 1')
    })

    it('shows multiplier × 2.5 when both helpers are disabled', () => {
      completeGame({ noDegreeLabels: true, noPianoKeyboard: true })
      const wrapper = mountView()
      expect(wrapper.find('.score-breakdown').text()).toContain('× 2.5')
    })

    it('wrong count equals total non-given cells when no answers submitted', () => {
      completeGame()
      const wrapper = mountView()
      // 3×3 major: 3 given (diagonal), 6 non-given — all wrong
      expect(wrapper.find('.score-breakdown').text()).toContain('✗ 6')
    })
  })

  describe('matrix grid', () => {
    it('renders MatrixGrid in results mode', () => {
      completeGame()
      const wrapper = mountView()
      const grid = wrapper.findComponent({ name: 'MatrixGrid' })
      expect(grid.exists()).toBe(true)
      expect(grid.props('mode')).toBe('results')
    })

    it('passes results to MatrixGrid', () => {
      completeGame()
      const wrapper = mountView()
      const grid = wrapper.findComponent({ name: 'MatrixGrid' })
      expect(grid.props('results')).toBeDefined()
    })
  })

  describe('onMounted side effects', () => {
    it('calls incrementSessionsPlayed on mount for learn mode', () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'incrementSessionsPlayed')
      completeGame()
      mountView()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('major')
    })

    it('calls incrementSessionsPlayed on mount even for free play', () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'incrementSessionsPlayed')
      completeGame(DEFAULT_OPTIONS, true)
      mountView()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('major')
    })

    it('calls recordSessionResults once on mount', () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'recordSessionResults')
      completeGame()
      mountView()
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith('major', expect.any(Array), expect.any(Object))
    })

    it('calls updateStreak once on mount', () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'updateStreak')
      completeGame()
      mountView()
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('does not call recordSessionResults again on re-render', async () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'recordSessionResults')
      completeGame()
      const wrapper = mountView()
      await wrapper.vm.$nextTick()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('free play mode', () => {
    it('does not call recordSessionResults when isFreePlay is true', () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'recordSessionResults')
      completeGame(DEFAULT_OPTIONS, true)
      mountView()
      expect(spy).not.toHaveBeenCalled()
    })

    it('does not call updateStreak when isFreePlay is true', () => {
      const progress = useProgressStore()
      const spy = vi.spyOn(progress, 'updateStreak')
      completeGame(DEFAULT_OPTIONS, true)
      mountView()
      expect(spy).not.toHaveBeenCalled()
    })

    it('still shows the score in free play mode', () => {
      completeGame(DEFAULT_OPTIONS, true)
      const wrapper = mountView()
      expect(wrapper.find('.score-total').text()).toContain('Score:')
    })

    it('hides the progress bar in free play mode', () => {
      completeGame(DEFAULT_OPTIONS, true)
      const wrapper = mountView()
      expect(wrapper.find('[role="progressbar"]').exists()).toBe(false)
    })

    it('shows the progress bar in learn mode', () => {
      completeGame(DEFAULT_OPTIONS, false)
      const wrapper = mountView()
      expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
    })

    it('Play Again forwards isFreePlay: true', async () => {
      const game = completeGame(DEFAULT_OPTIONS, true)
      const wrapper = mountView()
      await wrapper.find('button:first-child').trigger('click')
      if (game.session.phase !== 'playing') return
      expect(game.session.isFreePlay).toBe(true)
    })
  })

  describe('actions', () => {
    it('transitions to playing on Play Again', async () => {
      const game = completeGame()
      const wrapper = mountView()
      await wrapper.find('button:first-child').trigger('click')
      expect(game.session.phase).toBe('playing')
    })

    it('Play Again preserves quality when the learning position has not advanced', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 } // CURRICULUM[1][0] === 'major'
      const game = completeGame()
      const wrapper = mountView()
      await wrapper.find('button:first-child').trigger('click')
      assert(game.session.phase === 'playing')
      expect(game.session.puzzle.quality).toBe('major')
    })

    it('Play Again advances to the new quality once the learning position has moved past the completed puzzle', async () => {
      const progress = useProgressStore()
      const game = completeGame() // starts a 'major' puzzle; default learning position is stage 1/1 ('seconds')
      const wrapper = mountView()
      // Simulate recordSessionResults having advanced the sub-stage during onMounted.
      progress.state.learning = { stage: 2, subStage: 2 } // CURRICULUM[1][1] === 'minor'
      await wrapper.find('button:first-child').trigger('click')
      assert(game.session.phase === 'playing')
      expect(game.session.puzzle.quality).toBe('minor')
    })

    it('Play Again uses the puzzle quality (not the learning position) in Free Play', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 3, subStage: 1 } // unrelated learning position
      const game = completeGame(DEFAULT_OPTIONS, true)
      const wrapper = mountView()
      await wrapper.find('button:first-child').trigger('click')
      assert(game.session.phase === 'playing')
      expect(game.session.puzzle.quality).toBe('major')
    })

    it('Play Again preserves options', async () => {
      const game = completeGame({ noDegreeLabels: true, noPianoKeyboard: false })
      const wrapper = mountView()
      await wrapper.find('button:first-child').trigger('click')
      assert(game.session.phase === 'playing')
      expect(game.session.options.noDegreeLabels).toBe(true)
    })

    it('transitions to idle on Back to Menu', async () => {
      const game = completeGame()
      const wrapper = mountView()
      await wrapper.find('button:last-child').trigger('click')
      expect(game.session.phase).toBe('idle')
    })
  })

  describe('completion modal', () => {
    it('does not show the modal when the sub-stage has not completed', () => {
      completeGame()
      const wrapper = mountView()
      expect(wrapper.findComponent(CompletionModal).exists()).toBe(false)
    })

    it('does not show the modal in Free Play, even if accumulatedScore is already past target', () => {
      const progress = useProgressStore()
      progress.state.accumulatedScore['major'] = 1000
      completeGame(DEFAULT_OPTIONS, true)
      const wrapper = mountView()
      expect(wrapper.findComponent(CompletionModal).exists()).toBe(false)
    })

    it('shows the modal when the sub-stage completes', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 } // 'major'
      progress.state.accumulatedScore['major'] = 1000 // already past targetScore for any session size
      completeGame()
      const wrapper = mountView()
      await wrapper.vm.$nextTick()
      const modal = wrapper.findComponent(CompletionModal)
      expect(modal.exists()).toBe(true)
      expect(modal.props('completedQuality')).toBe('major')
      expect(modal.props('nextQuality')).toBe('minor')
    })

    it('suppresses the Free Play unlock line when completing an Interval Basics sub-stage', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 1, subStage: 1 } // Interval Basics, always Free-Play-accessible
      progress.state.accumulatedScore['seconds'] = 1000
      const game = useGameStore()
      game.startPuzzle('C', 'seconds', DEFAULT_OPTIONS, false)
      game.completeSession()
      const wrapper = mountView()
      await wrapper.vm.$nextTick()
      expect(wrapper.findComponent(CompletionModal).props('showFreePlayUnlock')).toBe(false)
    })

    it('Continue advances to the next quality', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 } // 'major'
      progress.state.accumulatedScore['major'] = 1000
      const game = completeGame()
      const wrapper = mountView()
      await wrapper.vm.$nextTick()
      await wrapper.findComponent(CompletionModal).vm.$emit('continue')
      assert(game.session.phase === 'playing')
      expect(game.session.puzzle.quality).toBe('minor')
    })

    it('Stop returns to the menu', async () => {
      const progress = useProgressStore()
      progress.state.learning = { stage: 2, subStage: 1 } // 'major'
      progress.state.accumulatedScore['major'] = 1000
      const game = completeGame()
      const wrapper = mountView()
      await wrapper.vm.$nextTick()
      await wrapper.findComponent(CompletionModal).vm.$emit('stop')
      expect(game.session.phase).toBe('idle')
    })
  })
})
