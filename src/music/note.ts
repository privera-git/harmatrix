import { Note } from '@/music/tonal'

export type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
export type Accidental = 'bb' | 'b' | '' | '#' | '##'

export interface NoteSpelling {
  letter: NoteLetter
  accidental: Accidental
  name: string // pitch class, e.g. 'Ab'
  chroma: number // 0–11
}

const ALT_TO_ACC: Record<number, Accidental> = {
  [-2]: 'bb',
  [-1]: 'b',
  [0]: '',
  [1]: '#',
  [2]: '##',
}

const LETTERS: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const ACCIDENTALS: Accidental[] = ['bb', 'b', '', '#', '##']

// All 35 standard pitch classes (7 letters × 5 accidentals)
const ALL_PCS = LETTERS.flatMap((l) => ACCIDENTALS.map((a) => l + a))

export function parseNote(str: string): NoteSpelling | null {
  const n = Note.get(str)
  if (n.empty) return null
  const acc = ALT_TO_ACC[n.alt]
  if (acc === undefined) return null // triple accidentals not supported
  return {
    letter: n.letter as NoteLetter,
    accidental: acc,
    name: n.pc,
    chroma: n.chroma,
  }
}

// Pitch equality: G# and Ab are the same pitch (chroma 8)
export function isSamePitch(a: string, b: string): boolean {
  const na = Note.get(a)
  const nb = Note.get(b)
  if (na.empty || nb.empty) return false
  return na.chroma === nb.chroma
}

// Spelling equality: G# and Ab are NOT the same spelling
export function isSameSpelling(a: string, b: string): boolean {
  const na = Note.get(a)
  const nb = Note.get(b)
  if (na.empty || nb.empty) return false
  return na.pc === nb.pc
}

const DIAGONAL_ACCIDENTALS: Accidental[] = ['b', '', '#']
const DIAGONAL_POOL = LETTERS.flatMap((l) => DIAGONAL_ACCIDENTALS.map((a) => l + a))

export const NATURAL_DIAGONAL_POOL = LETTERS.map((l) => l as string)
export const ALTERED_DIAGONAL_POOL = LETTERS.flatMap((l) => (['b', '#'] as const).map((a) => l + a))

export type DiagonalPool = 'natural' | 'full' | 'altered'

export function randomDiagonalNote(exclude: string[] = [], pool: DiagonalPool = 'full'): string {
  const base =
    pool === 'natural' ? NATURAL_DIAGONAL_POOL
    : pool === 'altered' ? ALTERED_DIAGONAL_POOL
    : DIAGONAL_POOL
  const candidates = base.filter((n) => !exclude.includes(n))
  const final = candidates.length > 0 ? candidates : base
  return final[Math.floor(Math.random() * final.length)]!
}

export function enharmonicsOf(note: string): string[] {
  const n = Note.get(note)
  if (n.empty) return []
  return ALL_PCS.filter((pc) => {
    if (pc === n.pc) return false
    const c = Note.get(pc)
    return !c.empty && c.chroma === n.chroma
  })
}
