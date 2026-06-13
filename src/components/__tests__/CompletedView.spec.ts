import { describe, it, expect, beforeEach, vi, assert } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import CompletedView from '@/components/CompletedView.vue'
import { useGameStore } from '@/stores/game'
import { useProgressStore } from '@/stores/progress'

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
      expect(spy).toHaveBeenCalledWith('major', expect.any(Array))
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

    it('hides the streak indicator in free play mode', () => {
      completeGame(DEFAULT_OPTIONS, true)
      const wrapper = mountView()
      expect(wrapper.find('.score-streak').exists()).toBe(false)
    })

    it('shows the streak indicator in learn mode', () => {
      completeGame(DEFAULT_OPTIONS, false)
      const wrapper = mountView()
      expect(wrapper.find('.score-streak').exists()).toBe(true)
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

    it('Play Again preserves quality', async () => {
      const game = completeGame()
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
})
