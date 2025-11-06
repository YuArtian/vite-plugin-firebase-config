import { resolve } from 'node:path'
import pc from 'picocolors'

/* eslint-disable no-console */
/**
 * Log levels
 */
export const logger = {
  info: (msg: string) => console.log(pc.blue('[firebase-config]'), msg),
  success: (msg: string) => console.log(pc.green('[firebase-config]'), msg),
  warn: (msg: string) => console.warn(pc.yellow('[firebase-config]'), msg),
  error: (msg: string) => console.error(pc.red('[firebase-config]'), msg),
  debug: (msg: string, enabled: boolean) => {
    if (enabled) {
      console.log(pc.gray('[firebase-config]'), msg)
    }
  },
}
/* eslint-enable no-console */

/**
 * Resolve path relative to project root
 */
export function resolvePath(root: string, path: string): string {
  return resolve(root, path)
}

/**
 * Convert camelCase to SCREAMING_SNAKE_CASE
 * Example: 'authDomain' -> 'AUTH_DOMAIN'
 */
export function toScreamingSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '')
}

/**
 * Format file size for display
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result = { ...target } as Record<string, unknown>

  for (const key in source) {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      )
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue
    }
  }

  return result as T
}
