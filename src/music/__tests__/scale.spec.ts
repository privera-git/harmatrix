import { describe, it, expect } from 'vitest'
import { buildScale, degreeCount, SCALE_CATALOG } from '@/music/scale'
import type { ScaleMode } from '@/music/scale'

describe('SCALE_CATALOG', () => {
  it('contains all GDD scale types', () => {
    const required: ScaleMode[] = [
      // Major modes
      'ionian',
      'dorian',
      'phrygian',
      'lydian',
      'mixolydian',
      'aeolian',
      'locrian',
      // Harmonic minor modes
      'harmonicMinor',
      'locrianNat6',
      'ionianSharp5',
      'dorianSharp4',
      'phrygianDom',
      'lydianSharp2',
      'ultraLocrian',
      // Melodic minor modes
      'melodicMinor',
      'dorianFlat2',
      'lydianAug',
      'lydianDom',
      'mixolydianFlat6',
      'aeolianFlat5',
      'altered',
      // Pentatonics
      'majorPenta',
      'minorPenta',
      // Hexatonic
      'wholeTone',
      // Octatonic
      'wholeHalfDim',
      'halfWholeDim',
    ]
    for (const m of required) {
      expect(SCALE_CATALOG[m], `missing mode: ${m}`).toBeDefined()
    }
  })

  it('has 26 total scale types', () => {
    expect(Object.keys(SCALE_CATALOG)).toHaveLength(26)
  })
})

describe('degreeCount', () => {
  it('returns 7 for all major modes', () => {
    const modes: ScaleMode[] = [
      'ionian',
      'dorian',
      'phrygian',
      'lydian',
      'mixolydian',
      'aeolian',
      'locrian',
    ]
    for (const m of modes) expect(degreeCount(m)).toBe(7)
  })

  it('returns 7 for all harmonic minor modes', () => {
    const modes: ScaleMode[] = [
      'harmonicMinor',
      'locrianNat6',
      'ionianSharp5',
      'dorianSharp4',
      'phrygianDom',
      'lydianSharp2',
      'ultraLocrian',
    ]
    for (const m of modes) expect(degreeCount(m)).toBe(7)
  })

  it('returns 7 for all melodic minor modes', () => {
    const modes: ScaleMode[] = [
      'melodicMinor',
      'dorianFlat2',
      'lydianAug',
      'lydianDom',
      'mixolydianFlat6',
      'aeolianFlat5',
      'altered',
    ]
    for (const m of modes) expect(degreeCount(m)).toBe(7)
  })

  it('returns 5 for pentatonics', () => {
    expect(degreeCount('majorPenta')).toBe(5)
    expect(degreeCount('minorPenta')).toBe(5)
  })

  it('returns 6 for whole-tone', () => {
    expect(degreeCount('wholeTone')).toBe(6)
  })

  it('returns 8 for diminished scales', () => {
    expect(degreeCount('wholeHalfDim')).toBe(8)
    expect(degreeCount('halfWholeDim')).toBe(8)
  })
})

describe('buildScale — major modes', () => {
  it('ionian: natural major scale', () => {
    expect(buildScale('C', 'ionian')).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
    expect(buildScale('Bb', 'ionian')).toEqual(['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'])
  })

  it('dorian: natural 2 and 6', () => {
    expect(buildScale('D', 'dorian')).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C'])
    expect(buildScale('Bb', 'dorian')).toEqual(['Bb', 'C', 'Db', 'Eb', 'F', 'G', 'Ab'])
  })

  it('phrygian: flat 2', () => {
    expect(buildScale('E', 'phrygian')).toEqual(['E', 'F', 'G', 'A', 'B', 'C', 'D'])
  })

  it('lydian: sharp 4', () => {
    expect(buildScale('F', 'lydian')).toEqual(['F', 'G', 'A', 'B', 'C', 'D', 'E'])
    expect(buildScale('G', 'lydian')).toEqual(['G', 'A', 'B', 'C#', 'D', 'E', 'F#'])
  })

  it('mixolydian: flat 7', () => {
    expect(buildScale('G', 'mixolydian')).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F'])
  })

  it('aeolian: natural minor scale', () => {
    expect(buildScale('A', 'aeolian')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(buildScale('Bb', 'aeolian')).toEqual(['Bb', 'C', 'Db', 'Eb', 'F', 'Gb', 'Ab'])
  })

  it('locrian: flat 2 and diminished 5', () => {
    expect(buildScale('B', 'locrian')).toEqual(['B', 'C', 'D', 'E', 'F', 'G', 'A'])
  })
})

describe('buildScale — harmonic minor modes', () => {
  it('harmonicMinor: raised 7th', () => {
    expect(buildScale('A', 'harmonicMinor')).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G#'])
    expect(buildScale('C', 'harmonicMinor')).toEqual(['C', 'D', 'Eb', 'F', 'G', 'Ab', 'B'])
  })

  it('locrianNat6: Locrian with natural 6', () => {
    expect(buildScale('B', 'locrianNat6')).toEqual(['B', 'C', 'D', 'E', 'F', 'G#', 'A'])
  })

  it('ionianSharp5: Ionian with augmented 5', () => {
    expect(buildScale('C', 'ionianSharp5')).toEqual(['C', 'D', 'E', 'F', 'G#', 'A', 'B'])
  })

  it('dorianSharp4: Romanian scale', () => {
    expect(buildScale('C', 'dorianSharp4')).toEqual(['C', 'D', 'Eb', 'F#', 'G', 'A', 'Bb'])
  })

  it('phrygianDom: Phrygian with major 3rd', () => {
    expect(buildScale('G', 'phrygianDom')).toEqual(['G', 'Ab', 'B', 'C', 'D', 'Eb', 'F'])
    expect(buildScale('E', 'phrygianDom')).toEqual(['E', 'F', 'G#', 'A', 'B', 'C', 'D'])
  })

  it('lydianSharp2: Lydian with augmented 2nd', () => {
    expect(buildScale('C', 'lydianSharp2')).toEqual(['C', 'D#', 'E', 'F#', 'G', 'A', 'B'])
  })

  it('ultraLocrian: diminished 4, 5, and 7', () => {
    expect(buildScale('B', 'ultraLocrian')).toEqual(['B', 'C', 'D', 'Eb', 'F', 'G', 'Ab'])
  })
})

describe('buildScale — melodic minor modes', () => {
  it('melodicMinor: minor with raised 6 and 7', () => {
    expect(buildScale('C', 'melodicMinor')).toEqual(['C', 'D', 'Eb', 'F', 'G', 'A', 'B'])
    expect(buildScale('G', 'melodicMinor')).toEqual(['G', 'A', 'Bb', 'C', 'D', 'E', 'F#'])
  })

  it('dorianFlat2: Phrygian natural 6', () => {
    expect(buildScale('D', 'dorianFlat2')).toEqual(['D', 'Eb', 'F', 'G', 'A', 'B', 'C'])
  })

  it('lydianAug: Lydian with augmented 5', () => {
    expect(buildScale('C', 'lydianAug')).toEqual(['C', 'D', 'E', 'F#', 'G#', 'A', 'B'])
  })

  it('lydianDom: Lydian with flat 7 (overtone scale)', () => {
    expect(buildScale('Bb', 'lydianDom')).toEqual(['Bb', 'C', 'D', 'E', 'F', 'G', 'Ab'])
  })

  it('mixolydianFlat6: Aeolian dominant', () => {
    expect(buildScale('G', 'mixolydianFlat6')).toEqual(['G', 'A', 'B', 'C', 'D', 'Eb', 'F'])
  })

  it('aeolianFlat5: Locrian natural 2', () => {
    expect(buildScale('A', 'aeolianFlat5')).toEqual(['A', 'B', 'C', 'D', 'Eb', 'F', 'G'])
  })

  it('altered: super Locrian (dim 4, dim 5)', () => {
    expect(buildScale('C', 'altered')).toEqual(['C', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb'])
    expect(buildScale('G', 'altered')).toEqual(['G', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'])
  })
})

describe('buildScale — pentatonics, whole-tone, and diminished', () => {
  it('majorPenta: 5 notes, no 4 or 7', () => {
    expect(buildScale('C', 'majorPenta')).toEqual(['C', 'D', 'E', 'G', 'A'])
    expect(buildScale('G', 'majorPenta')).toEqual(['G', 'A', 'B', 'D', 'E'])
  })

  it('minorPenta: 5 notes, no 2 or 6', () => {
    expect(buildScale('A', 'minorPenta')).toEqual(['A', 'C', 'D', 'E', 'G'])
    expect(buildScale('C', 'minorPenta')).toEqual(['C', 'Eb', 'F', 'G', 'Bb'])
  })

  it('wholeTone: 6 notes, all whole steps', () => {
    expect(buildScale('C', 'wholeTone')).toEqual(['C', 'D', 'E', 'F#', 'G#', 'Bb'])
    expect(buildScale('D', 'wholeTone')).toEqual(['D', 'E', 'F#', 'G#', 'A#', 'C'])
  })

  it('wholeHalfDim: 8 notes, two sixths', () => {
    expect(buildScale('C', 'wholeHalfDim')).toEqual(['C', 'D', 'Eb', 'F', 'Gb', 'Ab', 'A', 'B'])
  })

  it('halfWholeDim: 8 notes, two thirds', () => {
    expect(buildScale('C', 'halfWholeDim')).toEqual(['C', 'Db', 'Eb', 'E', 'F#', 'G', 'A', 'Bb'])
  })
})

describe('buildScale — invariants', () => {
  it('first note always equals root', () => {
    const modes: ScaleMode[] = [
      'ionian',
      'harmonicMinor',
      'melodicMinor',
      'majorPenta',
      'wholeTone',
      'halfWholeDim',
    ]
    const roots = ['C', 'G#', 'Ab', 'Bb', 'F#']
    for (const root of roots) {
      for (const m of modes) {
        expect(buildScale(root, m)[0], `${root} ${m}`).toBe(root)
      }
    }
  })

  it('result length matches degreeCount', () => {
    const modes: ScaleMode[] = ['ionian', 'majorPenta', 'wholeTone', 'wholeHalfDim', 'altered']
    for (const m of modes) {
      expect(buildScale('C', m)).toHaveLength(degreeCount(m))
    }
  })

  it('returns empty array for invalid root', () => {
    expect(buildScale('X', 'ionian')).toEqual([])
    expect(buildScale('', 'ionian')).toEqual([])
  })
})
