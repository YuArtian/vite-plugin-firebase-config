import { describe, it, expect } from 'vitest'
import { validateConfig, getMissingFields } from '../../src/validator'
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
})

