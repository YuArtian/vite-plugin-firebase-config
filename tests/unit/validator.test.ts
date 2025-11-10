import { describe, it, expect } from 'vitest'
import {
  validateConfig,
  getMissingFields,
  fillMissingFields,
} from '../../src/validator'
import type { FirebaseConfig } from '../../src/types'

describe('validator', () => {
  const validConfig: FirebaseConfig = {
    apiKey: 'test-api-key',
    authDomain: 'test.firebaseapp.com',
    projectId: 'test-project',
    storageBucket: 'test-project.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123:web:abc',
  }

  describe('validateConfig', () => {
    it('should pass with valid config', () => {
      expect(validateConfig(validConfig)).toBe(true)
    })

    it('should pass with valid config and optional fields', () => {
      const config = {
        ...validConfig,
        measurementId: 'G-XXXXXXXXXX',
        databaseURL: 'https://test.firebaseio.com',
      }
      expect(validateConfig(config)).toBe(true)
    })

    it('should throw error when missing required field', () => {
      const invalidConfig = { ...validConfig }
      delete invalidConfig.apiKey

      expect(() => validateConfig(invalidConfig)).toThrow(
        'Firebase configuration validation failed'
      )
    })

    it('should accept localhost as authDomain', () => {
      const config = { ...validConfig, authDomain: 'localhost:5173' }
      expect(validateConfig(config)).toBe(true)
    })

    it('should accept IP address as authDomain', () => {
      const config = { ...validConfig, authDomain: '192.168.1.1:3000' }
      expect(validateConfig(config)).toBe(true)
    })

    it('should throw error in strict mode when missing required field', () => {
      const invalidConfig = { ...validConfig }
      delete invalidConfig.apiKey

      expect(() => validateConfig(invalidConfig, true)).toThrow(
        'Firebase configuration validation failed'
      )
    })

    it('should not throw error in non-strict mode when missing required field', () => {
      const invalidConfig = { ...validConfig }
      delete invalidConfig.apiKey

      expect(() => validateConfig(invalidConfig, false)).not.toThrow()
      expect(validateConfig(invalidConfig, false)).toBe(true)
    })

    it('should not throw error in non-strict mode with empty config', () => {
      const emptyConfig = {}

      expect(() => validateConfig(emptyConfig, false)).not.toThrow()
      expect(validateConfig(emptyConfig, false)).toBe(true)
    })
  })

  describe('getMissingFields', () => {
    it('should return empty array for complete config', () => {
      expect(getMissingFields(validConfig)).toEqual([])
    })

    it('should return missing required fields', () => {
      const incomplete = {
        apiKey: 'test',
        projectId: 'test',
      }
      const missing = getMissingFields(incomplete)
      expect(missing).toContain('authDomain')
      expect(missing).toContain('storageBucket')
      expect(missing).toContain('messagingSenderId')
      expect(missing).toContain('appId')
    })
  })

  describe('fillMissingFields', () => {
    it('should fill missing required fields with empty strings', () => {
      const incomplete = {
        apiKey: 'test',
        projectId: 'test',
      }
      const filled = fillMissingFields(incomplete)

      expect(filled.apiKey).toBe('test')
      expect(filled.projectId).toBe('test')
      expect(filled.authDomain).toBe('')
      expect(filled.storageBucket).toBe('')
      expect(filled.messagingSenderId).toBe('')
      expect(filled.appId).toBe('')
    })

    it('should not modify existing fields', () => {
      const complete = { ...validConfig }
      const filled = fillMissingFields(complete)

      expect(filled).toEqual(validConfig)
    })

    it('should fill all fields when config is empty', () => {
      const empty = {}
      const filled = fillMissingFields(empty)

      expect(filled.apiKey).toBe('')
      expect(filled.authDomain).toBe('')
      expect(filled.projectId).toBe('')
      expect(filled.storageBucket).toBe('')
      expect(filled.messagingSenderId).toBe('')
      expect(filled.appId).toBe('')
    })
  })
})

