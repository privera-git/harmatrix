export type IntervalGroup =
  | 'seconds'
  | 'thirds'
  | 'fourthsFifths'
  | 'sixths'
  | 'sevenths'
  | 'ninths'
  | 'alteredExtensions'
  | 'thirteenth'

export interface IntervalGroupDef {
  group: IntervalGroup
  label: string
  intervals: string[]
}

export const INTERVAL_CATALOG: Record<IntervalGroup, IntervalGroupDef> = {
  seconds:           { group: 'seconds',           label: 'seconds',            intervals: ['1P', '2m', '2M'] },
  thirds:            { group: 'thirds',            label: 'thirds',             intervals: ['1P', '3m', '3M'] },
  fourthsFifths:     { group: 'fourthsFifths',     label: '4ths & 5ths',        intervals: ['1P', '4P', '5P'] },
  sixths:            { group: 'sixths',            label: 'sixths',             intervals: ['1P', '6m', '6M'] },
  sevenths:          { group: 'sevenths',          label: 'sevenths',           intervals: ['1P', '7m', '7M'] },
  ninths:            { group: 'ninths',            label: 'ninths',             intervals: ['1P', '9m', '9M'] },
  alteredExtensions: { group: 'alteredExtensions', label: 'altered extensions', intervals: ['1P', '9A', '11A'] },
  thirteenth:        { group: 'thirteenth',        label: 'thirteenth',         intervals: ['1P', '9M', '13M'] },
}
