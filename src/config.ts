import { env } from 'node:process'
import type { FirebaseConfig, PluginOptions, TransformFunction } from './types'
import { toScreamingSnakeCase, logger, deepMerge } from './utils'
import { ALL_FIELDS, fillMissingFields } from './validator'

/**
 * Read Firebase configuration from environment variables
 */
export function readConfigFromEnv(
  prefix: string = 'VITE_FIREBASE_',
  debug: boolean = false,
  envVars?: Record<string, string>
): Partial<FirebaseConfig> {
  const config: Partial<FirebaseConfig> = {}
  const envSource = envVars || env

  logger.debug(`Reading config from env with prefix: ${prefix}`, debug)

  for (const field of ALL_FIELDS) {
    const envKey = `${prefix}${toScreamingSnakeCase(field)}`
    const value = envSource[envKey]

    if (value) {
      config[field] = value
      logger.debug(`  ${envKey} = ${maskSensitiveValue(field, value)}`, debug)
    }
  }

  return config
}

/**
 * Mask sensitive values in logs
 */
function maskSensitiveValue(field: string, value: string): string {
  const sensitiveFields = ['apiKey', 'measurementId']

  if (sensitiveFields.includes(field) && value.length > 8) {
    return `${value.slice(0, 4)}...${value.slice(-4)}`
  }

  return value
}

/**
 * Resolve final configuration by merging sources
 */
export function resolveConfig(
  options: PluginOptions,
  mode: string,
  envVars?: Record<string, string>,
  fillEmptyFields: boolean = false
): Partial<FirebaseConfig> {
  let config: Partial<FirebaseConfig> = {}

  // Read from environment variables or use inline config
  if (options.source === 'inline' && options.config) {
    config = { ...options.config }
    logger.debug('Using inline config', options.debug || false)
  } else {
    config = readConfigFromEnv(options.envPrefix, options.debug, envVars)
  }

  // Apply environment-specific overrides
  if (options.environments && options.environments[mode]) {
    logger.debug(`Applying overrides for mode: ${mode}`, options.debug || false)
    config = deepMerge(config, options.environments[mode])
  }

  // Fill missing fields with empty strings if requested
  if (fillEmptyFields) {
    config = fillMissingFields(config)
  }

  return config
}

/**
 * Apply custom transform if provided
 */
export function applyTransform(
  config: FirebaseConfig,
  transform?: TransformFunction
): FirebaseConfig {
  if (transform) {
    return transform(config)
  }
  return config
}
