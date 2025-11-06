import { describe, it, expect } from 'vitest'
import { toScreamingSnakeCase, formatBytes, deepMerge } from '../../src/utils'

describe('utils', () => {
  describe('toScreamingSnakeCase', () => {
    it('should convert camelCase to SCREAMING_SNAKE_CASE', () => {
      expect(toScreamingSnakeCase('authDomain')).toBe('AUTH_DOMAIN')
      expect(toScreamingSnakeCase('apiKey')).toBe('API_KEY')
      expect(toScreamingSnakeCase('messagingSenderId')).toBe(
        'MESSAGING_SENDER_ID'
      )
    })

    it('should handle single word strings', () => {
      expect(toScreamingSnakeCase('api')).toBe('API')
      expect(toScreamingSnakeCase('projectId')).toBe('PROJECT_ID')
    })
  })

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1536)).toBe('1.5 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
    })
  })

  describe('deepMerge', () => {
    it('should merge objects deeply', () => {
      const target = { a: 1, b: { c: 2, d: 3 } }
      const source = { b: { c: 4 }, e: 5 }
      const result = deepMerge(target, source)

      expect(result).toEqual({
        a: 1,
        b: { c: 4, d: 3 },
        e: 5,
      })
    })

    it('should not mutate original objects', () => {
      const target = { a: 1 }
      const source = { b: 2 }
      deepMerge(target, source)

      expect(target).toEqual({ a: 1 })
    })
  })
})

