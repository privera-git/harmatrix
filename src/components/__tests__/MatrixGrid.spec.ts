import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MatrixGrid from '@/components/MatrixGrid.vue'
import type { MatrixCell } from '@/music/matrix'
import type { AnswerResult } from '@/music/scoring'

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
  })
})
