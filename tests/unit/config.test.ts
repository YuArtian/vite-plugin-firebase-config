import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { env } from 'node:process'
import { readConfigFromEnv, resolveConfig } from '../../src/config'

describe('config', () => {
  const originalEnv = { ...env }

  beforeEach(() => {
    // Clear env vars
    Object.keys(env).forEach((key) => {
      if (key.startsWith('VITE_FIREBASE_') || key.startsWith('CUSTOM_')) {
        delete env[key]
      }
    })
  })

  afterEach(() => {
    // Restore original env
    Object.keys(env).forEach((key) => {
      if (key.startsWith('VITE_FIREBASE_') || key.startsWith('CUSTOM_')) {
        delete env[key]
      }
    })
    Object.assign(env, originalEnv)
  })

  describe('readConfigFromEnv', () => {
    it('should read config from environment variables', () => {
      env.VITE_FIREBASE_API_KEY = 'test-key'
      env.VITE_FIREBASE_AUTH_DOMAIN = 'test.com'
      env.VITE_FIREBASE_PROJECT_ID = 'test-project'

      const config = readConfigFromEnv('VITE_FIREBASE_')

      expect(config.apiKey).toBe('test-key')
      expect(config.authDomain).toBe('test.com')
      expect(config.projectId).toBe('test-project')
    })

    it('should handle custom prefix', () => {
      env.CUSTOM_API_KEY = 'custom-key'
      env.CUSTOM_AUTH_DOMAIN = 'custom.com'

      const config = readConfigFromEnv('CUSTOM_')

      expect(config.apiKey).toBe('custom-key')
      expect(config.authDomain).toBe('custom.com')
    })

    it('should return empty object when no env vars match', () => {
      const config = readConfigFromEnv('NONEXISTENT_')
      expect(config).toEqual({})
    })
  })

  describe('resolveConfig', () => {
    it('should apply environment-specific overrides', () => {
      env.VITE_FIREBASE_AUTH_DOMAIN = 'base.com'

      const options = {
        envPrefix: 'VITE_FIREBASE_',
        environments: {
          development: {
            authDomain: 'localhost:5173',
          },
          production: {
            authDomain: 'prod.com',
          },
        },
      }

      const devConfig = resolveConfig(options, 'development')
      expect(devConfig.authDomain).toBe('localhost:5173')

      const prodConfig = resolveConfig(options, 'production')
      expect(prodConfig.authDomain).toBe('prod.com')
    })
  })
})

