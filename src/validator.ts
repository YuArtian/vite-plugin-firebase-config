import type { FirebaseConfig } from './types'
import { logger } from './utils'

/**
 * Required Firebase configuration fields
 */
const REQUIRED_FIELDS: Array<keyof FirebaseConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

/**
 * Optional Firebase configuration fields
 */
const OPTIONAL_FIELDS: Array<keyof FirebaseConfig> = [
  'measurementId',
  'databaseURL',
]

/**
 * All valid Firebase configuration fields
 */
export const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS]

/**
 * Validate Firebase configuration
 * Checks for required fields and warns about unknown fields
 */
export function validateConfig(
  config: Partial<FirebaseConfig>,
  strictValidation: boolean = true
): config is FirebaseConfig {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!config[field]) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Check for unknown fields
  for (const key in config) {
    if (!ALL_FIELDS.includes(key as keyof FirebaseConfig)) {
      warnings.push(`Unknown field: ${key}`)
    }
  }

  // Validate field types
  for (const field of ALL_FIELDS) {
    const value = config[field]
    if (value !== undefined && typeof value !== 'string') {
      errors.push(`Field ${field} must be a string, got ${typeof value}`)
    }
  }

  // Validate authDomain format (basic check)
  if (config.authDomain && !isValidAuthDomain(config.authDomain)) {
    warnings.push(
      `authDomain "${config.authDomain}" doesn't look like a valid domain. This might cause issues.`
    )
  }

  // Log warnings
  if (warnings.length > 0) {
    warnings.forEach((warning) => logger.warn(warning))
  }

  // Handle errors based on strictValidation mode
  if (errors.length > 0) {
    if (strictValidation) {
      // Strict mode: log errors and throw
      errors.forEach((error) => logger.error(error))
      throw new Error(
        `Firebase configuration validation failed:\n${errors.join('\n')}`
      )
    } else {
      // Non-strict mode: convert errors to warnings and continue
      errors.forEach((error) => logger.warn(error))
      logger.warn(
        'Validation errors detected but continuing in non-strict mode. Empty fields will be filled with empty strings.'
      )
    }
  }

  // In non-strict mode, always return true even if there are errors
  return true
}

/**
 * Basic validation for authDomain
 * Accepts: domain.com, subdomain.domain.com, localhost, localhost:port
 */
function isValidAuthDomain(authDomain: string): boolean {
  // Allow localhost with optional port
  if (/^localhost(:\d+)?$/.test(authDomain)) {
    return true
  }

  // Allow IP addresses with optional port (for development)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(authDomain)) {
    return true
  }

  // Allow valid domain names
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(
    authDomain
  )
}

/**
 * Get missing required fields from config
 */
export function getMissingFields(
  config: Partial<FirebaseConfig>
): Array<keyof FirebaseConfig> {
  return REQUIRED_FIELDS.filter((field) => !config[field])
}

/**
 * Fill missing required fields with empty strings
 * Used in non-strict validation mode to ensure all fields exist
 */
export function fillMissingFields(
  config: Partial<FirebaseConfig>
): FirebaseConfig {
  const filledConfig = { ...config } as FirebaseConfig

  for (const field of REQUIRED_FIELDS) {
    if (!filledConfig[field]) {
      filledConfig[field] = ''
    }
  }

  return filledConfig
}
