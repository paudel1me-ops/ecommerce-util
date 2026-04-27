import { describe, it, expect } from 'vitest'
import {
  cn, formatCurrency, formatDate, truncate, slugify,
  capitalize, formatNumber, clamp, groupBy,
} from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => expect(cn('a', 'b')).toBe('a b'))
  it('deduplicates tailwind classes', () => expect(cn('p-2', 'p-4')).toBe('p-4'))
  it('handles falsy values', () => expect(cn('a', undefined, false, 'b')).toBe('a b'))
  it('handles conditional', () => expect(cn('base', true && 'on', false && 'off')).toBe('base on'))
})

describe('formatCurrency', () => {
  it('formats USD', () => { const r = formatCurrency(10, 'USD'); expect(r).toContain('10'); expect(r).toContain('$') })
  it('handles zero', () => expect(formatCurrency(0, 'USD')).toContain('0'))
  it('handles large amounts', () => expect(formatCurrency(1_000_000, 'USD')).toContain('1'))
  it('falls back on unknown currency', () => expect(formatCurrency(5, 'XXX')).toContain('5'))
})

describe('truncate', () => {
  it('leaves short strings', () => expect(truncate('hello', 10)).toBe('hello'))
  it('truncates long strings', () => expect(truncate('hello world', 8)).toBe('hello...'))
  it('exact boundary', () => expect(truncate('12345', 5)).toBe('12345'))
})

describe('slugify', () => {
  it('converts spaces to hyphens', () => expect(slugify('Hello World')).toBe('hello-world'))
  it('removes special chars', () => expect(slugify('Pure! 100%')).toBe('pure-100'))
  it('collapses hyphens', () => expect(slugify('a  -  b')).toBe('a-b'))
})

describe('capitalize', () => {
  it('capitalizes first letter', () => expect(capitalize('hello')).toBe('Hello'))
  it('lowercases rest', () => expect(capitalize('WORLD')).toBe('World'))
})

describe('formatNumber', () => {
  it('formats M', () => expect(formatNumber(1_500_000)).toBe('1.5M'))
  it('formats K', () => expect(formatNumber(2_500)).toBe('2.5K'))
  it('small unchanged', () => expect(formatNumber(42)).toBe('42'))
})

describe('clamp', () => {
  it('clamps to min', () => expect(clamp(0, 5, 10)).toBe(5))
  it('clamps to max', () => expect(clamp(20, 5, 10)).toBe(10))
  it('within range', () => expect(clamp(7, 5, 10)).toBe(7))
})

describe('groupBy', () => {
  it('groups correctly', () => {
    const items = [{ t: 'a', v: 1 }, { t: 'b', v: 2 }, { t: 'a', v: 3 }]
    const r = groupBy(items, (i) => i.t)
    expect(r['a']).toHaveLength(2)
    expect(r['b']).toHaveLength(1)
  })
})

describe('formatDate', () => {
  it('formats date object', () => { const r = formatDate(new Date('2024-01-15')); expect(r).toContain('2024'); expect(r).toContain('Jan') })
  it('accepts string', () => expect(formatDate('2024-06-01')).toContain('2024'))
})
