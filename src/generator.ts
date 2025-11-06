import { writeFileSync, mkdirSync } from 'node:fs'
import { Buffer } from 'node:buffer'
import { dirname } from 'node:path'
import type { FirebaseConfig, OutputConfig } from './types'
import { logger, formatBytes } from './utils'

/**
 * Generate Firebase init.json file
 */
export function generateConfigFile(
  config: FirebaseConfig,
  outputPath: string,
  outputConfig: Required<OutputConfig>,
  debug: boolean = false
): void {
  try {
    // Ensure output directory exists
    const dir = dirname(outputPath)
    mkdirSync(dir, { recursive: true })

    // Prepare JSON content (no comments - JSON doesn't support them)
    const content = JSON.stringify(config, null, outputConfig.indent)

    // Write file
    writeFileSync(outputPath, content, 'utf-8')

    const size = Buffer.byteLength(content, 'utf-8')
    logger.success(
      `Generated Firebase config → ${outputPath} (${formatBytes(size)})`
    )

    if (debug) {
      logger.debug(`Config content:\n${content}`, true)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error(`Failed to generate config file: ${message}`)
    throw error
  }
}

/**
 * Get default output path
 */
export function getDefaultOutputPath(): string {
  return 'public/__/auth/init.json'
}

/**
 * Validate output path
 */
export function validateOutputPath(path: string): boolean {
  // Check for invalid characters
  if (path.includes('\0')) {
    throw new Error('Output path contains null characters')
  }

  // Warn if not using recommended path
  if (!path.includes('__/auth/')) {
    logger.warn(
      `Output path "${path}" doesn't match Firebase's expected path "public/__/auth/init.json"`
    )
    logger.warn('This may cause Firebase Authentication to fail')
  }

  return true
}
