import { describe, it, expect, beforeEach, vi, assert } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import PlayingView from '@/components/PlayingView.vue'
import { useGameStore } from '@/stores/game'

const mockPlayNote = vi.fn<(note: string) => void>()
vi.mock('@/composables/useAudio', () => ({
  useAudio: () => ({ playNote: mockPlayNote, playJingle: vi.fn<() => void>() }),
}))

const DEFAULT_OPTIONS = { noDegreeLabels: false, noPianoKeyboard: false }

function startGame(opts = DEFAULT_OPTIONS) {
  const game = useGameStore()
  game.startPuzzle('C', 'major', opts)
  return game
}

function mountView() {
  return mount(PlayingView)
}

describe('PlayingView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('header', () => {
    it('renders quality and diagonal note', () => {
      startGame()
      const wrapper = mountView()
      expect(wrapper.find('.puzzle-label').text()).toContain('major')
      expect(wrapper.find('.puzzle-label').text()).toContain('C')
    })

    it('renders the Abandon button', () => {
      startGame()
      const wrapper = mountView()
      expect(wrapper.find('.abandon-btn').exists()).toBe(true)
    })
  })

  describe('matrix grid', () => {
    it('renders the MatrixGrid component', () => {
      startGame()
      const wrapper = mountView()
      expect(wrapper.findComponent({ name: 'MatrixGrid' }).exists()).toBe(true)
    })

    it('passes mode="input" to MatrixGrid', () => {
      startGame()
      const wrapper = mountView()
      expect(wrapper.findComponent({ name: 'MatrixGrid' }).props('mode')).toBe('input')
    })

    it('shows degree labels when noDegreeLabels is false', () => {
      startGame({ noDegreeLabels: false, noPianoKeyboard: false })
      const wrapper = mountView()
      expect(wrapper.findComponent({ name: 'MatrixGrid' }).props('showDegreeLabels')).toBe(true)
    })

    it('hides degree labels when noDegreeLabels is true', () => {
      startGame({ noDegreeLabels: true, noPianoKeyboard: false })
      const wrapper = mountView()
      expect(wrapper.findComponent({ name: 'MatrixGrid' }).props('showDegreeLabels')).toBe(false)
    })
  })

  describe('note picker', () => {
    it('renders the NotePicker component', () => {
      startGame()
      const wrapper = mountView()
      expect(wrapper.findComponent({ name: 'NotePicker' }).exists()).toBe(true)
    })

    it('NotePicker is disabled when no cell is active', () => {
      startGame()
      const wrapper = mountView()
      expect(wrapper.findComponent({ name: 'NotePicker' }).props('disabled')).toBe(true)
    })

    it('NotePicker is enabled after clicking a non-given cell', async () => {
      startGame()
      const wrapper = mountView()
      const nonGivenCell = wrapper.find('.matrix-cell.clickable')
      await nonGivenCell.trigger('click')
      expect(wrapper.findComponent({ name: 'NotePicker' }).props('disabled')).toBe(false)
    })

    it('active cell is highlighted after click', async () => {
      startGame()
      const wrapper = mountView()
      const nonGivenCell = wrapper.find('.matrix-cell.clickable')
      await nonGivenCell.trigger('click')
      expect(wrapper.find('.matrix-cell.active').exists()).toBe(true)
    })
  })

  describe('piano keyboard', () => {
    it('sets the active cell when a given cell is clicked', async () => {
      startGame()
      const wrapper = mountView()
      const givenCell = wrapper.find('.matrix-cell.given')
      await givenCell.trigger('click')
      expect(wrapper.find('.matrix-cell.active').exists()).toBe(true)
    })

    it("highlights the given cell's note on the piano keyboard after clicking it", async () => {
      startGame()
      const wrapper = mountView()
      const givenCell = wrapper.find('.matrix-cell.given')
      const expectedNote = givenCell.text()
      await givenCell.trigger('click')
      expect(wrapper.findComponent({ name: 'PianoKeyboard' }).props('activeNote')).toBe(expectedNote)
    })
  })

  describe('piano keyboard / note picker playback (issue #122)', () => {
    beforeEach(() => {
      mockPlayNote.mockClear()
    })

    it('does not play a note when no cell is active', async () => {
      startGame()
      const wrapper = mountView()
      await wrapper.findComponent({ name: 'PianoKeyboard' }).vm.$emit('note-click', 'C')
      expect(mockPlayNote).not.toHaveBeenCalled()
    })

    it("plays a piano key note in the given cell's own octave when a given cell is active", async () => {
      useGameStore().startPuzzle('C', 'dom9', DEFAULT_OPTIONS)
      const wrapper = mountView()

      await wrapper.find('.matrix-cell.given').trigger('click')
      await wrapper.findComponent({ name: 'PianoKeyboard' }).vm.$emit('note-click', 'G')

      // Given cells always yield a zero semitone offset from themselves, so any
      // clicked note is placed in the same octave register as the given C4.
      expect(mockPlayNote).toHaveBeenCalledWith('G3')
    })

    it('plays the octave-correct note when clicking a piano key with a non-given cell active', async () => {
      useGameStore().startPuzzle('C', 'dom9', DEFAULT_OPTIONS)
      const wrapper = mountView()

      // Reversed row order puts row 4 (the 9th-degree row) first in the DOM;
      // its non-given col-0 cell is the "D" (9th) of the C dom9 chord, 14 semitones above C4.
      await wrapper.findAll('.matrix-cell')[0]!.trigger('click')
      await wrapper.findComponent({ name: 'PianoKeyboard' }).vm.$emit('note-click', 'D')

      expect(mockPlayNote).toHaveBeenCalledWith('D5')
    })

    it('plays the octave-correct note when NotePicker emits note-click', async () => {
      useGameStore().startPuzzle('C', 'dom9', DEFAULT_OPTIONS)
      const wrapper = mountView()

      await wrapper.findAll('.matrix-cell')[0]!.trigger('click') // row4/col0, the 9th
      await wrapper.findComponent({ name: 'NotePicker' }).vm.$emit('note-click', 'D')

      expect(mockPlayNote).toHaveBeenCalledWith('D5')
    })
  })

  describe('answer submission flow', () => {
    it('stores the answer when NotePicker emits a note', async () => {
      const game = startGame()
      const wrapper = mountView()

      // Activate a non-given cell (first clickable cell in display order)
      await wrapper.find('.matrix-cell.clickable').trigger('click')

      // Emit a note from the NotePicker
      await wrapper.findComponent({ name: 'NotePicker' }).vm.$emit('update:modelValue', 'F')

      // The answer must have been written to the store
      assert(game.session.phase === 'playing')
      const hasF = game.session.answers.some((row) => row.includes('F'))
      expect(hasF).toBe(true)
    })
  })

  describe('abandon', () => {
    it('resets session to idle when Abandon is clicked', async () => {
      const game = startGame()
      const wrapper = mountView()
      await wrapper.find('.abandon-btn').trigger('click')
      expect(game.session.phase).toBe('idle')
    })
  })

  describe('submit', () => {
    it('completes session when all cells are filled and Submit is clicked', async () => {
      const game = startGame()
      const wrapper = mountView()

      // Fill every non-given cell via the store so we bypass the UI
      if (game.session.phase === 'playing') {
        game.session.puzzle.cells.forEach((row, r) => {
          row.forEach((cell, c) => {
            if (!cell.isGiven) game.submitAnswer(r, c, 'C')
          })
        })
      }

      await wrapper.find('.submit-btn').trigger('click')
      expect(game.session.phase).toBe('completed')
    })

    it('calls window.confirm when cells are empty on Submit', async () => {
      startGame()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const wrapper = mountView()
      await wrapper.find('.submit-btn').trigger('click')
      expect(confirmSpy).toHaveBeenCalled()
      confirmSpy.mockRestore()
    })

    it('does not complete session when confirm is cancelled', async () => {
      const game = startGame()
      vi.spyOn(window, 'confirm').mockReturnValue(false)
      const wrapper = mountView()
      await wrapper.find('.submit-btn').trigger('click')
      expect(game.session.phase).toBe('playing')
      vi.restoreAllMocks()
    })
  })
})
