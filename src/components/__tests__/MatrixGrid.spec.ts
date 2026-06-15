import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MatrixGrid from '@/components/MatrixGrid.vue'
import type { MatrixCell } from '@/music/matrix'
import type { AnswerResult } from '@/music/scoring'

const mockPlayNote = vi.fn<(note: string) => void>()
vi.mock('@/composables/useAudio', () => ({
  useAudio: () => ({ playNote: mockPlayNote, playJingle: vi.fn<() => void>() }),
}))

function makeCell(row: number, col: number): MatrixCell {
  return { note: `N${row}${col}`, isGiven: row === col, row, col }
}

function makeCells(size: number): MatrixCell[][] {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => makeCell(row, col)),
  )
}

const RESULTS_3: AnswerResult[][] = [
  ['correct', 'correct', 'enharmonic'],
  ['correct', 'correct', 'correct'],
  ['wrong', 'correct', 'correct'],
]

describe('MatrixGrid', () => {
  describe('cell count', () => {
    it('renders 9 cells for a 3×3 matrix', () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: false },
      })
      expect(wrapper.findAll('.matrix-cell')).toHaveLength(9)
    })

    it('renders 64 cells for an 8×8 matrix', () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(8), mode: 'input', showDegreeLabels: false },
      })
      expect(wrapper.findAll('.matrix-cell')).toHaveLength(64)
    })
  })

  describe('row inversion', () => {
    it('renders row 0 at the bottom (last DOM row)', () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: false },
      })
      const rows = wrapper.findAll('.matrix-row')
      // Last DOM row contains row 0 — given cell (0,0) has note N00
      expect(rows[rows.length - 1]?.text()).toContain('N00')
    })

    it('renders row N-1 at the top (first DOM row)', () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: false },
      })
      const rows = wrapper.findAll('.matrix-row')
      // First DOM row contains row 2 — given cell (2,2) has note N22
      expect(rows[0]?.text()).toContain('N22')
    })
  })

  describe('input mode', () => {
    it('emits cell-click with correct row/col when a non-given cell is clicked', async () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: false },
      })
      // Rendered order: row2, row1, row0. First cell is (2,0) — not given.
      await wrapper.findAll('.matrix-cell')[0]!.trigger('click')
      expect(wrapper.emitted('cell-click')).toEqual([[2, 0]])
    })

    it('does not emit cell-click when a given cell is clicked', async () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: false },
      })
      // Cell at DOM index 2 is (2,2) — on the diagonal, given.
      await wrapper.findAll('.matrix-cell')[2]!.trigger('click')
      expect(wrapper.emitted('cell-click')).toBeUndefined()
    })

    it('applies active class to the active cell', () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: makeCells(3),
          mode: 'input',
          showDegreeLabels: false,
          activeCell: { row: 0, col: 1 },
        },
      })
      expect(wrapper.findAll('.active')).toHaveLength(1)
    })

    it('applies no active class when activeCell is absent', () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: false },
      })
      expect(wrapper.findAll('.active')).toHaveLength(0)
    })
  })

  describe('results mode', () => {
    it('shows ✓ for correct cells', () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: makeCells(3),
          mode: 'results',
          results: RESULTS_3,
          showDegreeLabels: false,
        },
      })
      expect(wrapper.text()).toContain('✓')
    })

    it('shows ≈ for enharmonic cells', () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: makeCells(3),
          mode: 'results',
          results: RESULTS_3,
          showDegreeLabels: false,
        },
      })
      expect(wrapper.text()).toContain('≈')
    })

    it('shows ✗ for wrong cells', () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: makeCells(3),
          mode: 'results',
          results: RESULTS_3,
          showDegreeLabels: false,
        },
      })
      expect(wrapper.text()).toContain('✗')
    })

    it('does not show result indicator on given cells', () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: makeCells(3),
          mode: 'results',
          results: RESULTS_3,
          showDegreeLabels: false,
        },
      })
      for (const cell of wrapper.findAll('.given')) {
        expect(cell.find('.cell-result').exists()).toBe(false)
      }
    })

    it('does not emit cell-click in results mode', async () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: makeCells(3),
          mode: 'results',
          results: RESULTS_3,
          showDegreeLabels: false,
        },
      })
      await wrapper.findAll('.matrix-cell')[0]!.trigger('click')
      expect(wrapper.emitted('cell-click')).toBeUndefined()
    })
  })

  describe('ascending column playback', () => {
    // F major chord: semitones [0,4,7], diagonal note F
    // cell(r,c) = F + semitones[r] - semitones[c]
    // Col 0 (given F at row0): F(given), A(row1), C(row2)
    // Col 2 (given F at row2): Bb(row0), D(row1), F(given)
    const fMajorCells: MatrixCell[][] = [
      [
        { note: 'F', isGiven: true, row: 0, col: 0 },
        { note: 'Db', isGiven: false, row: 0, col: 1 },
        { note: 'Bb', isGiven: false, row: 0, col: 2 },
      ],
      [
        { note: 'A', isGiven: false, row: 1, col: 0 },
        { note: 'F', isGiven: true, row: 1, col: 1 },
        { note: 'D', isGiven: false, row: 1, col: 2 },
      ],
      [
        { note: 'C', isGiven: false, row: 2, col: 0 },
        { note: 'A', isGiven: false, row: 2, col: 1 },
        { note: 'F', isGiven: true, row: 2, col: 2 },
      ],
    ]
    const fMajorSemitones = [0, 4, 7]

    // displayRows reverses cells: [row2, row1, row0]
    // DOM cell indices:
    //   0:(r2,c0)=C  1:(r2,c1)=A  2:(r2,c2)=F(given)
    //   3:(r1,c0)=A  4:(r1,c1)=F(given)  5:(r1,c2)=D
    //   6:(r0,c0)=F(given)  7:(r0,c1)=Db  8:(r0,c2)=Bb

    beforeEach(() => {
      mockPlayNote.mockClear()
    })

    it('plays A4 when clicking A above the given F4 in col 0', async () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: fMajorCells,
          mode: 'input',
          showDegreeLabels: false,
          intervalSemitones: fMajorSemitones,
        },
      })
      await wrapper.findAll('.matrix-cell')[3]!.trigger('click') // (row1, col0) = A
      expect(mockPlayNote).toHaveBeenCalledWith('A4')
    })

    it('plays C5 when clicking C above A4 in col 0', async () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: fMajorCells,
          mode: 'input',
          showDegreeLabels: false,
          intervalSemitones: fMajorSemitones,
        },
      })
      await wrapper.findAll('.matrix-cell')[0]!.trigger('click') // (row2, col0) = C
      expect(mockPlayNote).toHaveBeenCalledWith('C5')
    })

    it('plays Bb3 when clicking Bb below the given F4 in col 2', async () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: fMajorCells,
          mode: 'input',
          showDegreeLabels: false,
          intervalSemitones: fMajorSemitones,
        },
      })
      await wrapper.findAll('.matrix-cell')[8]!.trigger('click') // (row0, col2) = Bb
      expect(mockPlayNote).toHaveBeenCalledWith('Bb3')
    })

    it('plays D4 when clicking D below F4 in col 2', async () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: fMajorCells,
          mode: 'input',
          showDegreeLabels: false,
          intervalSemitones: fMajorSemitones,
        },
      })
      await wrapper.findAll('.matrix-cell')[5]!.trigger('click') // (row1, col2) = D
      expect(mockPlayNote).toHaveBeenCalledWith('D4')
    })

    it('plays F4 when clicking the given cell', async () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: fMajorCells,
          mode: 'input',
          showDegreeLabels: false,
          intervalSemitones: fMajorSemitones,
        },
      })
      await wrapper.findAll('.matrix-cell')[6]!.trigger('click') // (row0, col0) = F given
      expect(mockPlayNote).toHaveBeenCalledWith('F4')
    })

    it('falls back to bare note when intervalSemitones is absent', async () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: fMajorCells, mode: 'input', showDegreeLabels: false },
      })
      await wrapper.findAll('.matrix-cell')[0]!.trigger('click') // (row2, col0) = C
      expect(mockPlayNote).toHaveBeenCalledWith('C')
    })
  })

  describe('degree labels', () => {
    it('renders one label per row when showDegreeLabels is true', () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: true },
      })
      expect(wrapper.findAll('.degree-label')).toHaveLength(3)
    })

    it('renders no labels when showDegreeLabels is false', () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: false },
      })
      expect(wrapper.findAll('.degree-label')).toHaveLength(0)
    })

    it('uses degrees prop values when provided', () => {
      const wrapper = mount(MatrixGrid, {
        props: {
          cells: makeCells(3),
          mode: 'input',
          showDegreeLabels: true,
          degrees: ['1', '3', '5'],
        },
      })
      const labels = wrapper.findAll('.degree-label').map((el) => el.text())
      // displayRows reverses: row2 → top, row1 → middle, row0 → bottom
      expect(labels).toEqual(['5', '3', '1'])
    })

    it('falls back to row+1 when degrees prop is absent', () => {
      const wrapper = mount(MatrixGrid, {
        props: { cells: makeCells(3), mode: 'input', showDegreeLabels: true },
      })
      const labels = wrapper.findAll('.degree-label').map((el) => el.text())
      expect(labels).toEqual(['3', '2', '1'])
    })
  })
})
